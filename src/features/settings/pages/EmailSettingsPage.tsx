import React, { useState } from 'react';
import { SettingsForm, SettingsField } from '../components/SettingsForm';
import { Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { apiClient } from '../../../lib/axios';

export function EmailSettingsPage() {
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  const fields: SettingsField[] = [
    { key: 'emailEnabled', label: 'Email Enabled', type: 'toggle' },
    { key: 'emailProvider', label: 'Email Provider', type: 'select', options: [{label:'SMTP', value:'smtp'}, {label:'SendGrid', value:'sendgrid'}, {label:'AWS SES', value:'ses'}, {label:'Postmark', value:'postmark'}] },
    { key: 'senderName', label: 'Sender Name', type: 'text' },
    { key: 'senderEmail', label: 'Sender Email', type: 'text' },
    { key: 'replyToEmail', label: 'Reply-To Email', type: 'text' },
    { key: 'smtpApiConfigStatus', label: 'SMTP/API Configuration Status', type: 'status', readOnly: true },
    { key: 'providerHealth', label: 'Provider Health', type: 'status', readOnly: true },
    { key: 'orderEmailEnabled', label: 'Order Email Enabled', type: 'toggle' },
    { key: 'paymentEmailEnabled', label: 'Payment Email Enabled', type: 'toggle' },
    { key: 'deliveryEmailEnabled', label: 'Delivery Email Enabled', type: 'toggle' },
    { key: 'returnRefundEmailEnabled', label: 'Return/Refund Email Enabled', type: 'toggle' },
    { key: 'smtpHost', label: 'SMTP Host', type: 'text' },
    { key: 'smtpPort', label: 'SMTP Port', type: 'number' },
    { key: 'smtpUser', label: 'SMTP Username', type: 'text' },
    { key: 'smtpPassword', label: 'SMTP Password', type: 'password' },
    { key: 'emailTemplatesConfig', label: 'Email Templates Configuration (JSON)', type: 'textarea' },
  ];

  const handleTestEmail = async () => {
    if (!window.confirm("Are you sure you want to send a test email?")) return;
    
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiClient.post('/admin/settings/email/test');
      const data = res.data;
      if (data.success) {
         setTestResult({ success: true, message: data.message || 'Test email sent successfully' });
      } else {
         setTestResult({ success: false, message: data.error || data.message || 'Failed to send test email' });
      }
    } catch (e: any) {
      setTestResult({ success: false, message: e.response?.data?.message || e.response?.data?.error || 'Network error while sending test email' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <SettingsForm 
      title="Email Settings" 
      description="Configure SMTP servers, default sender identities, and email templates."
      namespace="email"
      fields={fields}
    >
      <div className="p-6">
        <h3 className="text-sm font-semibold text-slate-800 mb-2">Diagnostic Actions</h3>
        <p className="text-xs text-slate-500 mb-4">You can test the current email configuration. Ensure you save your settings before running a test.</p>
        <button 
          onClick={handleTestEmail}
          disabled={testing}
          type="button"
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
        >
          {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {testing ? 'Sending...' : 'Send Test Email'}
        </button>
        {testResult && (
          <div className={`mt-4 p-3 rounded-md flex items-center gap-2 text-sm ${testResult.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            {testResult.message}
          </div>
        )}
      </div>
    </SettingsForm>
  );
}
