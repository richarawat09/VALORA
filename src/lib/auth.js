import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = process.env.AUTH_SECRET || process.env.JWT_SECRET || 'valora_healthcare_super_secret_jwt_key_2026_secure_medical_platform';
const key = new TextEncoder().encode(SECRET_KEY);

const SESSION_COOKIE_NAME = 'valora_session';

/**
 * Hash plain text password
 */
export async function hashPassword(plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
}

/**
 * Compare plain password against hash
 */
export async function comparePassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

/**
 * Sign JWT token for user session
 */
export async function signToken(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(key);
}

/**
 * Verify JWT token
 */
export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch (error) {
    return null;
  }
}

/**
 * Create session cookie in Next.js Server Action
 */
export async function setSessionCookie(user) {
  const token = await signToken({
    id: user._id.toString(),
    email: user.email,
    name: user.name,
    role: user.role,
    avatar: user.avatar || '',
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });

  return token;
}

/**
 * Retrieve current user session from cookies
 */
export async function getSessionUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!token) return null;

    const payload = await verifyToken(token);
    return payload;
  } catch (error) {
    console.error('Error getting session user:', error);
    return null;
  }
}

/**
 * Delete session cookie for logout
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Helper to ensure a user is logged in
 */
export async function requireAuth() {
  const session = await getSessionUser();
  if (!session) {
    throw new Error('Unauthorized: Authentication required');
  }
  return session;
}

/**
 * Helper to enforce specific roles (e.g. 'doctor', 'patient', 'admin')
 */
export async function requireRole(allowedRoles = []) {
  const session = await requireAuth();
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  if (!roles.includes(session.role)) {
    throw new Error(`Forbidden: Access restricted to ${roles.join(' or ')}`);
  }
  return session;
}

