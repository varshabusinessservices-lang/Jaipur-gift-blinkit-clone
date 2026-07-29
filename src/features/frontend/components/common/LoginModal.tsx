import React, { useState } from 'react';
import { useShopStore } from '../../store/shopStore';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Phone, ShieldCheck, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginModal = () => {
  const { isLoginModalOpen, setLoginModalOpen, loginWithPhone } = useShopStore();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep('otp');
      setOtp('123456'); // Demo prefill OTP
    }, 800);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      loginWithPhone(phone, name || 'Customer');
      setLoginModalOpen(false);
      setStep('phone');
      setPhone('');
      setOtp('');
      setName('');
    }, 800);
  };

  return (
    <Modal
      isOpen={isLoginModalOpen}
      onClose={() => setLoginModalOpen(false)}
      maxWidth="md"
    >
      <div className="p-2 space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-sm">
            <Sparkles className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Login to Jaipur Gifting</h2>
          <p className="text-xs text-slate-500">Fast 10-minute delivery & exclusive customisation perks</p>
        </div>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Your Name (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Aarav Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-sm p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-600 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Mobile Number</label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <span className="bg-slate-100 dark:bg-slate-800 px-3 py-3 text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center border-r border-slate-200 dark:border-slate-800">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  placeholder="Enter 10 digit mobile number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="w-full text-sm p-3 bg-transparent outline-none"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading || phone.length < 10}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {loading ? 'Sending OTP...' : 'Continue with OTP'} <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-xs text-indigo-700 dark:text-indigo-300 flex items-center justify-between">
              <span>OTP sent to +91 {phone}</span>
              <button
                type="button"
                onClick={() => setStep('phone')}
                className="font-bold underline hover:text-indigo-800"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Enter 6-Digit OTP (Dev: 123456)</label>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center text-lg tracking-widest font-black p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-600 outline-none"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {loading ? 'Verifying...' : 'Verify & Login'} <CheckCircle2 className="h-4 w-4" />
            </Button>
          </form>
        )}

        <div className="text-center">
          <p className="text-[11px] text-slate-400">
            By continuing, you agree to Jaipur Gifting's Terms of Service & Privacy Policy.
          </p>
        </div>
      </div>
    </Modal>
  );
};
