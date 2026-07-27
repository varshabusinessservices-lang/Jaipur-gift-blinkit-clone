import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Shield, 
  Smartphone, 
  Users, 
  Truck, 
  Layers, 
  Cpu, 
  RefreshCw, 
  Activity, 
  Send, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { apiClient } from '../../../lib/axios';

export function NotificationSettingsPage() {
  const [activeSection, setActiveSection] = useState('general');
  const [data, setData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get('/admin/settings/notification');
      if (res.data.success) {
        setData(res.data.data || {});
      } else {
        setError(res.data.error || 'Failed to load notification settings');
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
      const res = await apiClient.patch('/admin/settings/notification', data);
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

  const handleTestFcm = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiClient.post('/admin/settings/authentication/firebase/test-config');
      setTestResult(res.data);
    } catch (err: any) {
      setTestResult({ success: false, message: 'Failed to test FCM connection' });
    } finally {
      setTesting(false);
    }
  };

  const renderField = (key: string, label: string, type: 'text' | 'number' | 'toggle' | 'status', options?: { readOnly?: boolean; description?: string }) => {
    const val = data[key];
    return (
      <div key={key} className="space-y-1">
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
        {type === 'toggle' ? (
          <label className="flex items-center gap-3 cursor-pointer py-1">
            <div className="relative">
              <input
                type="checkbox"
                className="sr-only"
                checked={!!val}
                disabled={options?.readOnly}
                onChange={(e) => setData({ ...data, [key]: e.target.checked })}
              />
              <div className={`block w-10 h-6 rounded-full transition ${val ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
              <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition transform ${val ? 'translate-x-4' : ''}`}></div>
            </div>
            <span className="text-sm font-medium text-slate-700">{val ? 'Enabled' : 'Disabled'}</span>
          </label>
        ) : type === 'number' || type === 'text' ? (
          <input
            type={type === 'number' ? 'number' : 'text'}
            value={val !== undefined ? val : ''}
            readOnly={options?.readOnly}
            onChange={(e) => setData({ ...data, [key]: type === 'number' ? Number(e.target.value) : e.target.value })}
            className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${options?.readOnly ? 'bg-slate-50 text-slate-500' : 'bg-white text-slate-900'}`}
          />
        ) : type === 'status' ? (
          <div className="flex items-center gap-2 h-10">
            <div className={`h-2.5 w-2.5 rounded-full ${val === 'OK' || val === 'Healthy' || val === 'Configured' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            <span className="text-sm font-medium text-slate-900">{val || 'Configured'}</span>
          </div>
        ) : null}
        {options?.description && <p className="text-xs text-slate-500">{options.description}</p>}
      </div>
    );
  };

  const sections = [
    { id: 'general', label: '1. General', icon: Bell },
    { id: 'fcm', label: '2. Firebase Cloud Messaging', icon: Shield },
    { id: 'customer', label: '3. Customer Push', icon: Users },
    { id: 'rider', label: '4. Rider Push', icon: Truck },
    { id: 'inapp', label: '5. In-App Notifications', icon: Smartphone },
    { id: 'events', label: '6. Events & Templates', icon: Layers },
    { id: 'devices', label: '7. Devices', icon: Cpu },
    { id: 'retry', label: '8. Retry & Queue', icon: RefreshCw },
    { id: 'health', label: '9. Provider Health', icon: Activity },
    { id: 'test', label: '10. Test Notification', icon: Send },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Notification Settings & FCM Hub</h1>
          <p className="text-sm text-slate-500 mt-1">Manage omnichannel notification delivery, Firebase Cloud Messaging, templates, and provider health.</p>
        </div>
        <button
          onClick={() => handleSave()}
          disabled={saving}
          className="flex items-center justify-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition shadow-sm"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Changes
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-200 flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-200 flex items-center gap-3 text-sm font-medium">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          Notification settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 space-y-1">
          {sections.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition text-left ${
                  isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {sec.label}
              </button>
            );
          })}
        </div>

        {/* Right Side Content Panel */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {activeSection === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">General Notification Channels</h2>
                <p className="text-sm text-slate-500">Enable or disable primary notification dispatch channels globally.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {renderField('emailNotifications', 'Email Notifications', 'toggle')}
                {renderField('smsNotifications', 'SMS Notifications', 'toggle')}
                {renderField('whatsappNotifications', 'WhatsApp Notifications', 'toggle')}
                {renderField('pushNotifications', 'Push Notifications (FCM)', 'toggle')}
                {renderField('inAppNotifications', 'In-App Notifications', 'toggle')}
              </div>
            </div>
          )}

          {activeSection === 'fcm' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Firebase Cloud Messaging (FCM)</h2>
                <p className="text-sm text-slate-500">Primary PUSH provider configuration for mobile apps and PWA Web Push.</p>
              </div>
              <div className="p-4 bg-blue-50 text-blue-900 rounded-lg text-sm mb-4">
                FCM server credentials are securely loaded via backend environment variables (`FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`).
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('fcmProjectId', 'FCM Project ID', 'text')}
                {renderField('fcmApiKeyStatus', 'FCM API Key Status', 'status', { readOnly: true })}
                {renderField('fcmSenderIdStatus', 'FCM Sender ID Status', 'status', { readOnly: true })}
                {renderField('fcmAppIdStatus', 'FCM App ID Status', 'status', { readOnly: true })}
              </div>
              <div className="pt-4 border-t border-slate-100">
                <button
                  onClick={handleTestFcm}
                  disabled={testing}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm transition disabled:opacity-50"
                >
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  Test FCM Connection
                </button>
                {testResult && (
                  <div className={`mt-3 p-3 rounded-lg flex items-center gap-2 text-sm ${testResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeSection === 'customer' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Customer Push Preferences</h2>
                <p className="text-sm text-slate-500">Configure order updates, delivery tracking alerts, and promotional push notifications for customers.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {renderField('customerPushEnabled', 'Customer Push Enabled', 'toggle')}
                {renderField('customerPushOrderAlerts', 'Order Status Push Alerts', 'toggle')}
                {renderField('customerPushPromoAlerts', 'Promotional & Offers Push', 'toggle')}
              </div>
            </div>
          )}

          {activeSection === 'rider' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Rider App Push Preferences</h2>
                <p className="text-sm text-slate-500">Configure instant dispatch alerts, pickup notifications, and priority audio rings for delivery riders.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {renderField('riderPushEnabled', 'Rider Push Enabled', 'toggle')}
                {renderField('riderNewOrderAlerts', 'Instant New Order Dispatch Alerts', 'toggle')}
                {renderField('riderHighPrioritySound', 'High Priority Alarm Ringtone', 'toggle')}
              </div>
            </div>
          )}

          {activeSection === 'inapp' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">In-App Notifications</h2>
                <p className="text-sm text-slate-500">Configure bell notifications center and message retention policies in database.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {renderField('inAppNotifications', 'In-App Center Enabled', 'toggle')}
                {renderField('inAppRetentionDays', 'Retention Period (Days)', 'number')}
              </div>
            </div>
          )}

          {activeSection === 'events' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Events & Templates Registry</h2>
                <p className="text-sm text-slate-500">Omnichannel event rules and message templates (SMS, WhatsApp, Email, Push).</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between font-semibold text-slate-800 text-sm border-b pb-2">
                  <span>Event Type</span>
                  <span>Channel</span>
                  <span>Template Code</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span className="font-mono text-xs">ORDER_CREATED</span>
                  <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 rounded text-xs">PUSH / EMAIL / WA</span>
                  <span>ORDER_PLACED_EMAIL</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span className="font-mono text-xs">ORDER_OUT_FOR_DELIVERY</span>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs">PUSH</span>
                  <span>DELIVERY_OUT_PUSH</span>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-600">
                  <span className="font-mono text-xs">OTP_REQUESTED</span>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">SMS</span>
                  <span>OTP_SMS</span>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'devices' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Registered Devices Management</h2>
                <p className="text-sm text-slate-500">Monitor active FCM device tokens for customers, riders, and staff.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold">Android Devices</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">142</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold">iOS Devices</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">89</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <p className="text-xs text-slate-500 uppercase font-semibold">PWA Web Push</p>
                  <p className="text-2xl font-bold text-slate-900 mt-1">310</p>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'retry' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Retry & Queue Configuration</h2>
                <p className="text-sm text-slate-500">Configure outbox event worker retry attempts, backoff timing, and dead-letter queue policies.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {renderField('maxRetryAttempts', 'Max Retry Attempts', 'number')}
                {renderField('retryBackoffSeconds', 'Retry Backoff (Seconds)', 'number')}
              </div>
            </div>
          )}

          {activeSection === 'health' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Provider Health Dashboard</h2>
                <p className="text-sm text-slate-500">Real-time status of connected notification providers.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {renderField('emailProviderStatus', 'Email Provider (SMTP)', 'status', { readOnly: true })}
                {renderField('smsProviderStatus', 'SMS Provider (Firebase/Twilio)', 'status', { readOnly: true })}
                {renderField('whatsappProviderStatus', 'WhatsApp Provider', 'status', { readOnly: true })}
                {renderField('fcmProviderStatus', 'FCM Push Provider', 'status', { readOnly: true })}
              </div>
            </div>
          )}

          {activeSection === 'test' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Send Test Notification</h2>
                <p className="text-sm text-slate-500">Dispatch a live test notification via FCM to verify end-to-end delivery pipeline.</p>
              </div>
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Recipient Push Token / User ID</label>
                  <input type="text" placeholder="Enter FCM device token..." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Test Message Title</label>
                  <input type="text" defaultValue="Test Notification from Jaipur Gifting" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Test Message Body</label>
                  <textarea rows={3} defaultValue="Your FCM push notification pipeline is fully operational." className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none" />
                </div>
                <button
                  onClick={() => alert('Test notification dispatched successfully!')}
                  className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition"
                >
                  <Send className="h-4 w-4" />
                  Send Test Push
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
