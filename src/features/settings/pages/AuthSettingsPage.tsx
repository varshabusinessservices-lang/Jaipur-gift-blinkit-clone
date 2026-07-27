import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle2, AlertCircle, Shield, Phone, Key, Users, Truck, Share2, Smartphone, Activity } from 'lucide-react';
import { apiClient } from '../../../lib/axios';

const SECTIONS = [
  { id: 'general', label: 'General Authentication', icon: Shield },
  { id: 'firebase', label: 'Firebase Phone OTP', icon: Phone },
  { id: 'otp', label: 'OTP Security', icon: Key },
  { id: 'customer', label: 'Customer Login', icon: Users },
  { id: 'rider', label: 'Rider Login', icon: Truck },
  { id: 'social', label: 'Social Login', icon: Share2 },
  { id: 'session', label: 'Session & Devices', icon: Smartphone },
  { id: 'health', label: 'Provider Health', icon: Activity },
];

export function AuthSettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/settings/authentication');
      if (res.data.success) {
        setData(res.data.data || {});
      } else {
        setError(res.data.error || 'Failed to load settings');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Network error while loading settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await apiClient.patch('/admin/settings/authentication', data);
      if (res.data.success) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.data.error || 'Failed to save settings');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Network error while saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestFirebase = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiClient.post('/admin/settings/authentication/firebase/test-config');
      if (res.data.success) {
        setTestResult({ success: true, message: res.data.message || 'Firebase Admin is configured correctly' });
      } else {
        setTestResult({ success: false, message: res.data.message || 'Firebase Admin configuration failed' });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.response?.data?.message || 'Failed to test Firebase configuration' });
    } finally {
      setTesting(false);
    }
  };

  const updateField = (key: string, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const renderField = (key: string, label: string, type: 'text'|'number'|'toggle'|'status'|'password', options?: any) => {
    const value = data[key];
    
    if (type === 'toggle') {
      return (
        <div key={key} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg bg-white">
          <div className="space-y-0.5">
            <label className="text-sm font-medium text-slate-900">{label}</label>
            {options?.description && <p className="text-xs text-slate-500">{options.description}</p>}
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={!!value} onChange={(e) => updateField(key, e.target.checked)} disabled={options?.readOnly} />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      );
    }

    if (type === 'status') {
      return (
        <div key={key} className="flex flex-col space-y-1">
          <label className="text-sm font-medium text-slate-700">{label}</label>
          <div className="flex items-center gap-2 h-10 px-4 border border-slate-200 rounded-lg bg-slate-50">
            <div className={`h-2.5 w-2.5 rounded-full ${value === 'Configured' || value === 'OK' || value === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            <span className="text-sm font-medium text-slate-900">{value || 'Not Configured'}</span>
          </div>
        </div>
      );
    }

    return (
      <div key={key} className="flex flex-col space-y-1">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        <input 
          type={type} 
          value={value ?? ''} 
          onChange={(e) => updateField(key, type === 'number' ? Number(e.target.value) : e.target.value)}
          disabled={options?.readOnly}
          placeholder={options?.placeholder}
          className={`px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${options?.readOnly ? 'bg-slate-50 text-slate-500' : 'bg-white'}`}
        />
        {options?.description && <p className="text-xs text-slate-500">{options.description}</p>}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Authentication Settings</h1>
        <p className="text-slate-500 mt-1">Configure Firebase Phone Auth, sessions, and security rules.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-64 border-r border-slate-200 bg-slate-50 flex-shrink-0">
          <div className="p-4 space-y-1">
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeSection === section.id 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <section.icon className={`h-5 w-5 ${activeSection === section.id ? 'text-indigo-700' : 'text-slate-400'}`} />
                {section.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col">
          <div className="p-6 border-b border-slate-200 flex-1">
            
            {error && (
              <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-lg flex items-center gap-2 text-sm font-medium">
                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2 text-sm font-medium">
                <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
                Settings saved successfully.
              </div>
            )}

            <div className="space-y-6">
              {activeSection === 'general' && (
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">General Authentication</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('authEnabled', 'Authentication Enabled', 'toggle')}
                    {renderField('mobileOtpLoginEnabled', 'Mobile OTP Login Enabled', 'toggle')}
                    {renderField('firebasePhoneOtpEnabled', 'Firebase Phone OTP Enabled', 'toggle')}
                    {renderField('passwordLoginEnabled', 'Password Login Enabled', 'toggle')}
                    {renderField('emailLoginEnabled', 'Email Login Enabled', 'toggle')}
                    {renderField('customerRegistrationEnabled', 'Customer Registration Enabled', 'toggle')}
                  </div>
                </>
              )}

              {activeSection === 'firebase' && (
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Firebase Phone OTP</h2>
                  <div className="p-4 bg-blue-50 text-blue-800 rounded-lg mb-6 text-sm">
                    Configure Firebase credentials via environment variables. Admin SDK secrets must remain server-only.
                  </div>
                  
                  <h3 className="font-semibold text-slate-800 mb-3">Firebase Web SDK (Frontend)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {renderField('firebaseApiKeyStatus', 'Firebase API Key', 'status', { readOnly: true })}
                    {renderField('firebaseAuthDomainStatus', 'Firebase Auth Domain', 'status', { readOnly: true })}
                    {renderField('firebaseProjectIdStatus', 'Firebase Project ID', 'status', { readOnly: true })}
                    {renderField('firebaseStorageBucketStatus', 'Firebase Storage Bucket', 'status', { readOnly: true })}
                    {renderField('firebaseMessagingSenderIdStatus', 'Firebase Messaging Sender ID', 'status', { readOnly: true })}
                    {renderField('firebaseAppIdStatus', 'Firebase App ID', 'status', { readOnly: true })}
                    {renderField('firebaseMeasurementIdStatus', 'Firebase Measurement ID', 'status', { readOnly: true })}
                  </div>

                  <h3 className="font-semibold text-slate-800 mb-3 border-t pt-6">Firebase Admin SDK (Server-only)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {renderField('firebaseAdminProjectIdStatus', 'Admin Project ID', 'status', { readOnly: true })}
                    {renderField('firebaseAdminClientEmailStatus', 'Admin Client Email', 'status', { readOnly: true })}
                    {renderField('firebaseAdminPrivateKeyStatus', 'Admin Private Key', 'status', { readOnly: true })}
                    {renderField('firebaseAdminSdkStatus', 'Admin SDK Initialisation Status', 'status', { readOnly: true })}
                  </div>
                  
                  <div className="border-t pt-6">
                    <button onClick={handleTestFirebase} disabled={testing} className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium text-sm disabled:opacity-50">
                      {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                      Test Admin SDK Config
                    </button>
                    {testResult && (
                      <div className={`mt-4 p-3 rounded-md flex items-center gap-2 text-sm ${testResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                        {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                        {testResult.message}
                      </div>
                    )}
                  </div>
                </>
              )}

              {activeSection === 'otp' && (
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">OTP Security</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('otpRequestCooldown', 'OTP Request Cooldown (seconds)', 'number', { description: 'Wait time before resend' })}
                    {renderField('maxOtpRequestsPerHour', 'Max OTP Requests per Phone/Hour', 'number')}
                    {renderField('maxOtpRequestsPerIpPerHour', 'Max OTP Requests per IP/Hour', 'number')}
                    {renderField('maxVerificationAttempts', 'Max Verification Attempts', 'number')}
                    {renderField('loginLockoutDuration', 'Login Lockout Duration (minutes)', 'number')}
                    {renderField('otpScreenTimeout', 'OTP Screen Timeout (seconds)', 'number')}
                    {renderField('testPhoneModeEnabled', 'Test Phone Mode Enabled', 'toggle')}
                    {renderField('firebaseAbuseProtectionEnabled', 'Firebase Abuse Protection', 'toggle')}
                  </div>
                </>
              )}

              {activeSection === 'customer' && (
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Customer Login</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('websiteGuestBrowsingEnabled', 'Website Guest Browsing', 'toggle')}
                    {renderField('websiteGuestCartEnabled', 'Website Guest Cart', 'toggle')}
                    {renderField('checkoutLoginRequired', 'Checkout Login Required', 'toggle')}
                    {renderField('mobileLoginFirstEnabled', 'Mobile App: Login First Required', 'toggle')}
                  </div>
                </>
              )}

              {activeSection === 'rider' && (
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Rider Login</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('riderOtpLoginEnabled', 'Rider OTP Login Enabled', 'toggle')}
                  </div>
                </>
              )}

              {activeSection === 'social' && (
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Social Login</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('googleLoginEnabled', 'Google Login Enabled', 'toggle')}
                    {renderField('appleLoginEnabled', 'Apple Login Enabled', 'toggle')}
                  </div>
                </>
              )}

              {activeSection === 'session' && (
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Session & Devices</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('maxActiveDevices', 'Maximum Active Devices', 'number')}
                    {renderField('customerSessionDuration', 'Customer Session Duration (hours)', 'number')}
                    {renderField('riderSessionDuration', 'Rider Session Duration (hours)', 'number')}
                    {renderField('adminSessionDuration', 'Admin Session Duration (hours)', 'number')}
                  </div>
                </>
              )}

              {activeSection === 'health' && (
                <>
                  <h2 className="text-lg font-bold text-slate-900 mb-4">Provider Health</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('phoneProviderEnabledStatus', 'Phone Provider Enabled Status', 'status', { readOnly: true })}
                    {renderField('authorisedDomainStatus', 'Authorised Domain Status', 'status', { readOnly: true })}
                    {renderField('recaptchaStatus', 'reCAPTCHA Status', 'status', { readOnly: true })}
                    {renderField('lastProviderHealthCheck', 'Last Health Check', 'text', { readOnly: true })}
                    {renderField('testModeIndicator', 'Test Mode Indicator', 'status', { readOnly: true })}
                  </div>
                </>
              )}

            </div>
          </div>
          
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
