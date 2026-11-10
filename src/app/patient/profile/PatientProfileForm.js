'use client';

import { useState } from 'react';
import { updatePatientProfile } from '@/actions/patientActions';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

export default function PatientProfileForm({ initialUser, initialProfile }) {
  const [name, setName] = useState(initialUser.name || '');
  const [phone, setPhone] = useState(initialUser.phone || '');
  const [email] = useState(initialUser.email || '');

  const [gender, setGender] = useState(initialProfile.gender || 'male');
  const [bloodGroup, setBloodGroup] = useState(initialProfile.bloodGroup || 'O+');
  const [dateOfBirth, setDateOfBirth] = useState(
    initialProfile.dateOfBirth ? new Date(initialProfile.dateOfBirth).toISOString().split('T')[0] : ''
  );
  const [heightCm, setHeightCm] = useState(initialProfile.heightCm || '');
  const [weightKg, setWeightKg] = useState(initialProfile.weightKg || '');

  const [allergies, setAllergies] = useState(
    initialProfile.allergies ? initialProfile.allergies.join(', ') : ''
  );
  const [chronicConditions, setChronicConditions] = useState(
    initialProfile.chronicConditions ? initialProfile.chronicConditions.join(', ') : ''
  );

  const [emergencyName, setEmergencyName] = useState(initialProfile.emergencyContact?.name || '');
  const [emergencyRelation, setEmergencyRelation] = useState(initialProfile.emergencyContact?.relation || '');
  const [emergencyPhone, setEmergencyPhone] = useState(initialProfile.emergencyContact?.phone || '');

  const [street, setStreet] = useState(initialProfile.address?.street || '');
  const [city, setCity] = useState(initialProfile.address?.city || '');
  const [state, setState] = useState(initialProfile.address?.state || '');
  const [postalCode, setPostalCode] = useState(initialProfile.address?.postalCode || '');

  const [insuranceProvider, setInsuranceProvider] = useState(initialProfile.insuranceProvider || '');
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState(initialProfile.insurancePolicyNumber || '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    setError('');

    const formData = new FormData();
    formData.append('name', name);
    formData.append('phone', phone);
    formData.append('gender', gender);
    formData.append('bloodGroup', bloodGroup);
    formData.append('dateOfBirth', dateOfBirth);
    formData.append('heightCm', heightCm);
    formData.append('weightKg', weightKg);
    formData.append('allergies', allergies);
    formData.append('chronicConditions', chronicConditions);
    formData.append('emergencyName', emergencyName);
    formData.append('emergencyRelation', emergencyRelation);
    formData.append('emergencyPhone', emergencyPhone);
    formData.append('street', street);
    formData.append('city', city);
    formData.append('state', state);
    formData.append('postalCode', postalCode);
    formData.append('insuranceProvider', insuranceProvider);
    formData.append('insurancePolicyNumber', insurancePolicyNumber);

    const res = await updatePatientProfile(formData);

    if (res.success) {
      setMessage('Profile parameters successfully updated!');
    } else {
      setError(res.error || 'Failed to update profile');
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Basic Info */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          1. Identity & Contact Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Full Legal Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email (Account Primary)</label>
            <input
              type="email"
              disabled
              value={email}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-100 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Clinical Vitals & Parameters */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
          2. Clinical Baseline & Physiological Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Blood Group</label>
            <select
              value={bloodGroup}
              onChange={(e) => setBloodGroup(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map((bg) => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer_not_to_say">Prefer not to say</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Height (cm)</label>
            <input
              type="number"
              placeholder="e.g. 175"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Weight (kg)</label>
            <input
              type="number"
              placeholder="e.g. 72"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Known Drug / Environmental Allergies
            </label>
            <input
              type="text"
              placeholder="e.g. Penicillin, Peanuts, Sulfa (comma separated)"
              value={allergies}
              onChange={(e) => setAllergies(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">
              Pre-existing Chronic Conditions
            </label>
            <input
              type="text"
              placeholder="e.g. Type 2 Diabetes, Mild Asthma (comma separated)"
              value={chronicConditions}
              onChange={(e) => setChronicConditions(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>
        </div>
      </div>

      {/* 3. Emergency Contact & Insurance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            3. Emergency Contact Person
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Contact Name</label>
              <input
                type="text"
                value={emergencyName}
                onChange={(e) => setEmergencyName(e.target.value)}
                placeholder="Relative or guardian name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-600 mb-1">Relationship</label>
                <input
                  type="text"
                  value={emergencyRelation}
                  onChange={(e) => setEmergencyRelation(e.target.value)}
                  placeholder="Spouse / Parent / Sibling"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-600 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+91..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            4. Medical Insurance Coverage
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Insurance Provider</label>
              <input
                type="text"
                value={insuranceProvider}
                onChange={(e) => setInsuranceProvider(e.target.value)}
                placeholder="e.g. Star Health, HDFC ERGO, Care Health"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Policy / Member ID Number</label>
              <input
                type="text"
                value={insurancePolicyNumber}
                onChange={(e) => setInsurancePolicyNumber(e.target.value)}
                placeholder="e.g. POL-89304910"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 transition-all shadow-md shadow-teal-600/20"
        >
          <Save className="w-4 h-4" />
          <span>{isSubmitting ? 'Saving Changes...' : 'Save Profile Details'}</span>
        </button>
      </div>
    </form>
  );
}

