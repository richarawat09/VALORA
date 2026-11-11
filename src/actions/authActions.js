'use server';

import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Patient from '@/models/Patient';
import Doctor from '@/models/Doctor';
import AuditLog from '@/models/AuditLog';
import { hashPassword, comparePassword, setSessionCookie, clearSessionCookie, getSessionUser } from '@/lib/auth';
import { isValidEmail, isValidPassword } from '@/lib/validations';
import { seedInitialData } from '@/lib/seed';
import { revalidatePath } from 'next/cache';

/**
 * Register a new user (Patient or Doctor)
 */
export async function registerUser(formData) {
  try {
    await connectDB();

    const name = formData.get('name')?.toString().trim();
    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString();
    const role = formData.get('role')?.toString() || 'patient';
    const phone = formData.get('phone')?.toString().trim() || '';

    if (!name || !email || !password) {
      return { success: false, error: 'Full name, email, and password are required' };
    }

    if (!isValidEmail(email)) {
      return { success: false, error: 'Please enter a valid email address' };
    }

    if (!isValidPassword(password)) {
      return { success: false, error: 'Password must be at least 6 characters long' };
    }

    if (!['patient', 'doctor'].includes(role)) {
      return { success: false, error: 'Invalid account role specified' };
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return { success: false, error: 'An account with this email already exists' };
    }

    const passwordHash = await hashPassword(password);

    // Initial status: All valid registrations active immediately
    const initialStatus = 'active';

    const newUser = await User.create({
      name,
      email,
      passwordHash,
      role,
      phone,
      status: initialStatus,
    });

    // Create role-specific profile document
    if (role === 'patient') {
      const bloodGroup = formData.get('bloodGroup')?.toString() || 'Unknown';
      const gender = formData.get('gender')?.toString() || 'prefer_not_to_say';
      const dateOfBirth = formData.get('dateOfBirth')?.toString();

      let parsedDob = undefined;
      if (dateOfBirth && !isNaN(new Date(dateOfBirth).getTime())) {
        parsedDob = new Date(dateOfBirth);
      }

      await Patient.create({
        userId: newUser._id,
        bloodGroup,
        gender,
        dateOfBirth: parsedDob,
      });
    } else if (role === 'doctor') {
      const specialty = formData.get('specialty')?.toString() || 'General Medicine';
      const licenseNumber = formData.get('licenseNumber')?.toString() || `MCI-PENDING-${Date.now()}`;
      const experienceYears = Number(formData.get('experienceYears')) || 1;
      const consultationFee = Number(formData.get('consultationFee')) || 500;

      await Doctor.create({
        userId: newUser._id,
        specialty,
        licenseNumber,
        experienceYears,
        consultationFee,
        isVerified: false,
      });
    }

    // Create Audit Log
    await AuditLog.create({
      userId: newUser._id,
      action: 'USER_REGISTERED',
      entityType: 'User',
      entityId: newUser._id.toString(),
      details: { role, email },
    });

    // Auto-login session
    await setSessionCookie(newUser);

    revalidatePath('/patient/doctors');
    revalidatePath('/admin/doctors');
    revalidatePath('/admin/patients');
    revalidatePath('/admin/dashboard');

    return {
      success: true,
      user: {
        id: newUser._id.toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message || 'An error occurred during registration' };
  }
}

/**
 * Log in an existing user
 */
export async function loginUser(formData) {
  try {
    await connectDB();

    const email = formData.get('email')?.toString().trim().toLowerCase();
    const password = formData.get('password')?.toString();

    if (!email || !password) {
      return { success: false, error: 'Email and password are required' };
    }

    const user = await User.findOne({ email });
    if (!user) {
      return { success: false, error: 'Invalid email or password' };
    }

    if (user.status === 'suspended') {
      return { success: false, error: 'Your account has been suspended. Please contact platform administration.' };
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return { success: false, error: 'Invalid email or password' };
    }

    // Update lastLogin
    user.lastLogin = new Date();
    await user.save();

    // Create session
    await setSessionCookie(user);

    // Audit log
    await AuditLog.create({
      userId: user._id,
      action: 'USER_LOGIN',
      entityType: 'User',
      entityId: user._id.toString(),
      details: { role: user.role, email: user.email },
    });

    return {
      success: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        avatar: user.avatar,
      },
    };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message || 'Login failed' };
  }
}

/**
 * Log out current user
 */
export async function logoutUser() {
  try {
    const session = await getSessionUser();
    if (session) {
      try {
        await connectDB();
        await AuditLog.create({
          userId: session.id,
          action: 'USER_LOGOUT',
          entityType: 'User',
          entityId: session.id,
        });
      } catch (err) {
        // non-blocking for logout
      }
    }
    await clearSessionCookie();
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Error logging out' };
  }
}

/**
 * Get current session user and their profile data
 */
export async function getCurrentUser() {
  try {
    const session = await getSessionUser();
    if (!session) return null;

    await connectDB();
    const user = await User.findById(session.id).select('-passwordHash').lean();
    if (!user) return null;

    let profile = null;
    if (user.role === 'patient') {
      profile = await Patient.findOne({ userId: user._id }).lean();
    } else if (user.role === 'doctor') {
      profile = await Doctor.findOne({ userId: user._id }).lean();
    }

    return {
      ...user,
      _id: user._id.toString(),
      profile: profile ? { ...profile, _id: profile._id.toString(), userId: profile.userId.toString() } : null,
    };
  } catch (error) {
    console.error('getCurrentUser error:', error);
    return null;
  }
}

/**
 * Action to seed sample data for demonstration/evaluation
 */
export async function seedDatabaseAction() {
  try {
    return await seedInitialData();
  } catch (error) {
    console.error('Seed action error:', error);
    return { success: false, error: error.message };
  }
}

