import { useState } from 'react';
import { apiClient } from '../../../lib/axios';
import { toast } from 'sonner';
import { Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export function PasswordChangePage() {
  const [step, setStep] = useState(1);
  const [currentPassword, setCurrentPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleRequestOtp = async () => {
    if (!currentPassword) return toast.error('Current password required');
    setIsLoading(true);
    try {
      const res = await apiClient.post('/admin/security/password/request-otp', { currentPassword });
      if (res.data.success) {
        toast.success('OTP sent to your email');
        setStep(2);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) return toast.error('OTP required');
    setIsLoading(true);
    try {
      const res = await apiClient.post('/admin/security/password/verify-otp', { otp });
      if (res.data.success) {
        toast.success('OTP verified');
        setStep(3);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }
    setIsLoading(true);
    try {
      const res = await apiClient.post('/admin/security/password/change', { currentPassword, newPassword });
      if (res.data.success) {
        toast.success('Password changed successfully. Please login again.');
        // We could logout the user automatically or redirect
        setTimeout(() => {
          navigate('/admin/login');
        }, 2000);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
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
              <Lock className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-lg font-medium text-slate-900">Change Password</h2>
          </div>
        </div>

        <div className="px-6 py-6 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Please enter your current password to verify your identity.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700">Current Password</label>
                <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
              </div>
              <button onClick={handleRequestOtp} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">We've sent a 6-digit code to your email. It will expire in 10 minutes.</p>
              <div>
                <label className="block text-sm font-medium text-slate-700">Enter OTP</label>
                <input type="text" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-center tracking-widest text-lg font-mono" placeholder="------" />
              </div>
              <button onClick={handleVerifyOtp} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-slate-500">Create a new secure password.</p>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">New Password</label>
                  <div className="relative mt-1">
                    <input type={showPassword ? 'text' : 'password'} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400">
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">Must be at least 12 characters, with uppercase, lowercase, numbers, and symbols.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                </div>
              </div>
              <button onClick={handleChangePassword} disabled={isLoading} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                {isLoading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
