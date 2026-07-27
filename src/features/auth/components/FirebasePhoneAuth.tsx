import React, { useState, useEffect } from 'react';
import { sendPhoneOtp, confirmPhoneOtp, getFirebaseIdToken, initRecaptcha, clearRecaptcha } from '../../../services/auth/firebasePhoneAuthService';
import { Loader2, Phone, ShieldCheck } from 'lucide-react';
import { apiClient } from '../../../lib/axios';

export function FirebasePhoneAuth({ accountType = 'CUSTOMER', onSuccess }: { accountType?: 'CUSTOMER' | 'RIDER', onSuccess?: (data: any) => void }) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'PHONE' | 'OTP'>('PHONE');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initRecaptcha('firebase-recaptcha-container');
    return () => {
      clearRecaptcha();
    };
  }, []);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    let formattedPhone = phone.trim();
    if (formattedPhone.length === 10 && !formattedPhone.startsWith('+')) {
      formattedPhone = '+91' + formattedPhone;
    }
    
    if (!/^\+[1-9]\d{1,14}$/.test(formattedPhone)) {
      setError('Invalid phone number format. Use E.164 format (e.g. +919876543210)');
      setLoading(false);
      return;
    }

    try {
      await sendPhoneOtp(formattedPhone, 'firebase-recaptcha-container');
      setStep('OTP');
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      clearRecaptcha();
      initRecaptcha('firebase-recaptcha-container');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await confirmPhoneOtp(otp);
      const idToken = await getFirebaseIdToken();
      
      const res = await apiClient.post('/auth/firebase/verify', {
        idToken,
        accountType,
        device: {
          platform: 'WEB',
          deviceName: navigator.userAgent
        }
      });
      
      if (res.data.success) {
        if (onSuccess) onSuccess(res.data.data);
      } else {
        setError(res.data.message || 'Verification failed on server');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const resetFlow = () => {
    setStep('PHONE');
    setOtp('');
    setError(null);
    clearRecaptcha();
    initRecaptcha('firebase-recaptcha-container');
  };

  const maskedPhone = phone.length >= 10 
    ? phone.replace(/(\d{2})(\d{5})(\d{3})/, '$1••• ••$3')
    : phone;

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100">
      <div id="firebase-recaptcha-container"></div>
      
      {error && (
        <div className="mb-4 p-3 bg-rose-50 text-rose-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {step === 'PHONE' ? (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-slate-900">Login with Phone</h2>
            <p className="text-slate-500 text-sm mt-1">We will send you an OTP via SMS.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mobile Number</label>
            <div className="relative">
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-slate-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/[^\d+]/g, ''))}
                placeholder="+91 98765 43210"
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading || !phone}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition flex justify-center items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Send OTP
          </button>
        </form>
      ) : (
        <form onSubmit={handleConfirmOtp} className="space-y-4">
          <div className="text-center mb-6">
            <ShieldCheck className="h-12 w-12 text-indigo-500 mx-auto mb-2" />
            <h2 className="text-xl font-bold text-slate-900">Verify OTP</h2>
            <p className="text-slate-500 text-sm mt-1">
              Sent to <span className="font-semibold text-slate-800">{maskedPhone}</span>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="w-full px-4 py-2 text-center tracking-widest text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading || otp.length < 6}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition flex justify-center items-center gap-2"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Verify & Login
          </button>
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={resetFlow}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
            >
              Change Phone Number
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
