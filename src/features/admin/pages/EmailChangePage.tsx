import { useState } from 'react';
import { apiClient } from '../../../lib/axios';
import { toast } from 'sonner';
import { Mail } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/authStore';

export function EmailChangePage() {
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [newEmail, setNewEmail] = useState('');
  const [oldOtp, setOldOtp] = useState('');
  const [newOtp, setNewOtp] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOldOtp = async () => {
    if (!newEmail || !newEmail.includes('@')) return toast.error('Valid new email is required');
    if (newEmail.toLowerCase() === user?.email.toLowerCase()) return toast.error('New email must be different from current');
    
    setIsLoading(true);
    try {
      const res = await apiClient.post('/admin/security/email/request-old-email-otp');
      if (res.data.success) {
        toast.success(`OTP sent to ${user?.email}`);
        setStep(2);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOldOtp = async () => {
    if (!oldOtp) return toast.error('OTP required');
    setIsLoading(true);
    try {
      const res = await apiClient.post('/admin/security/email/verify-old-email-otp', { otp: oldOtp, newEmail });
      if (res.data.success) {
        toast.success('Current email verified');
        // Now request OTP for new email
        await handleRequestNewOtp();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
      setIsLoading(false);
    }
  };

  const handleRequestNewOtp = async () => {
    try {
      const res = await apiClient.post('/admin/security/email/request-new-email-otp');
      if (res.data.success) {
        toast.success(`OTP sent to ${newEmail}`);
        setStep(3);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP to new email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyNewOtp = async () => {
    if (!newOtp) return toast.error('OTP required');
    setIsLoading(true);
    try {
      const res = await apiClient.post('/admin/security/email/verify-new-email-otp', { otp: newOtp });
      if (res.data.success) {
        toast.success('New email verified');
        setStep(4);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeEmail = async () => {
    if (!currentPassword) return toast.error('Current password required');
    setIsLoading(true);
    try {
      const res = await apiClient.post('/admin/security/email/change', { currentPassword });
      if (res.data.success) {
        toast.success('Email changed successfully. Please login again.');
        setTimeout(() => navigate('/admin/login'), 2000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change email');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12 px-4 sm:px-6">
      <div className="mb-8">
        <Link to="/admin/profile" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">&larr; Back to Profile</Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
              <Mail className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-medium text-slate-900">Change Email Address</h2>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">To change your email, we need to verify both your current and new email addresses.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700">Current Email</label>
                <input type="text" disabled value={user?.email || ''} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm bg-slate-50 sm:text-sm text-slate-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">New Email Address</label>
                <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <button onClick={handleRequestOldOtp} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {isLoading ? 'Sending...' : 'Send OTP to Current Email'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">We've sent a 6-digit code to your current email. Enter it below to proceed.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700">Enter OTP (Current Email)</label>
                <input type="text" maxLength={6} value={oldOtp} onChange={(e) => setOldOtp(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center tracking-widest text-lg font-mono" placeholder="------" />
              </div>
              <button onClick={handleVerifyOldOtp} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Now, we've sent a 6-digit code to your new email <strong>{newEmail}</strong>.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700">Enter OTP (New Email)</label>
                <input type="text" maxLength={6} value={newOtp} onChange={(e) => setNewOtp(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center tracking-widest text-lg font-mono" placeholder="------" />
              </div>
              <button onClick={handleVerifyNewOtp} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Please enter your current password to finalize the email change.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700">Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <button onClick={handleChangeEmail} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {isLoading ? 'Changing...' : 'Confirm & Change Email'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
