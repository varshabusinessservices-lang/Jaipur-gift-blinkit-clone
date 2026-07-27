import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  Wallet, 
  Banknote, 
  Shield, 
  Settings, 
  Package, 
  Layers, 
  Store, 
  MapPin, 
  Truck, 
  Users, 
  DollarSign, 
  RefreshCw, 
  Activity, 
  FileText, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Send
} from 'lucide-react';
import { apiClient } from '../../../lib/axios';

export function PaymentSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [codSubTab, setCodSubTab] = useState('general');
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
      const res = await apiClient.get('/admin/settings/payment');
      if (res.data.success) {
        setData(res.data.data || {});
      } else {
        setError(res.data.error || 'Failed to load payment settings');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Network error while loading payment settings');
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
      const res = await apiClient.patch('/admin/settings/payment', data);
      if (res.data.success) {
        setData(res.data.data || data);
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(res.data.error || 'Failed to save payment settings');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Network error while saving settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestRazorpay = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiClient.post('/admin/settings/payment/razorpay/test');
      setTestResult(res.data);
    } catch (err: any) {
      setTestResult({ success: false, message: 'Razorpay connection test failed.' });
    } finally {
      setTesting(false);
    }
  };

  const renderField = (key: string, label: string, type: 'text' | 'number' | 'toggle' | 'status' | 'select', options?: { readOnly?: boolean; description?: string; optionsList?: { label: string; value: string }[] }) => {
    const val = data[key];
    return (
      <div key={key} className="space-y-1.5">
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
            className={`w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none ${options?.readOnly ? 'bg-slate-50 text-slate-500 font-mono text-xs' : 'bg-white text-slate-900 text-sm'}`}
          />
        ) : type === 'select' ? (
          <select
            value={val !== undefined ? val : ''}
            onChange={(e) => setData({ ...data, [key]: e.target.value })}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white text-slate-900 text-sm"
          >
            {options?.optionsList?.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ) : type === 'status' ? (
          <div className="flex items-center gap-2 h-10">
            <div className={`h-2.5 w-2.5 rounded-full ${val === 'OK' || val === 'Healthy' || val === 'TEST' || val === 'Connected' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            <span className="text-sm font-medium text-slate-900">{val || 'Configured'}</span>
          </div>
        ) : null}
        {options?.description && <p className="text-xs text-slate-500">{options.description}</p>}
      </div>
    );
  };

  const tabs = [
    { id: 'general', label: '1. General', icon: Settings },
    { id: 'razorpay', label: '2. Razorpay', icon: CreditCard },
    { id: 'wallet', label: '3. Wallet', icon: Wallet },
    { id: 'cod', label: '4. Cash on Delivery (COD)', icon: Banknote },
    { id: 'refund', label: '5. Refund Settings', icon: RefreshCw },
    { id: 'health', label: '6. Provider Health', icon: Activity },
    { id: 'audit', label: '7. Payment Audit', icon: FileText },
  ];

  const codSubTabs = [
    { id: 'general', label: 'General COD Rules' },
    { id: 'personalized', label: 'Personalised Products' },
    { id: 'categories', label: 'Categories' },
    { id: 'products', label: 'Products' },
    { id: 'stores', label: 'Stores' },
    { id: 'zones', label: 'Delivery Zones' },
    { id: 'modes', label: 'Delivery Modes' },
    { id: 'customer', label: 'Customer Rules' },
    { id: 'ranges', label: 'Order Value Ranges' },
    { id: 'advance', label: 'Advance Payment' },
    { id: 'reconciliation', label: 'Reconciliation' },
    { id: 'audit', label: 'COD Audit' },
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
          <h1 className="text-xl font-bold text-slate-900">Payment Gateways & COD Rule Engine</h1>
          <p className="text-sm text-slate-500 mt-1">Manage Razorpay, Wallet, and Cash on Delivery with granular advance payment and zone/product rules.</p>
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
          Payment settings saved successfully.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Navigation Sidebar */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-2 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition text-left ${
                  isActive ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Panel */}
        <div className="lg:col-span-3 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">General Payment Configuration</h2>
                <p className="text-sm text-slate-500">Configure global payment switches, default gateway, and session parameters.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {renderField('paymentsEnabled', 'Global Payments Switch', 'toggle')}
                {renderField('allowMultipleMethods', 'Allow Multiple Payment Methods', 'toggle')}
                {renderField('razorpayEnabled', 'Razorpay Gateway Enabled', 'toggle')}
                {renderField('walletEnabled', 'Customer Wallet Enabled', 'toggle')}
                {renderField('codEnabled', 'Cash on Delivery Enabled', 'toggle')}
                {renderField('defaultPaymentMethod', 'Default Payment Method', 'select', {
                  optionsList: [
                    { label: 'Razorpay', value: 'RAZORPAY' },
                    { label: 'Wallet', value: 'WALLET' },
                    { label: 'Cash on Delivery', value: 'COD' },
                  ],
                })}
                {renderField('paymentSessionTimeout', 'Payment Session Timeout (Seconds)', 'number')}
                {renderField('paymentRetryCount', 'Payment Retry Count', 'number')}
                {renderField('paymentReconciliationEnabled', 'Automated Payment Reconciliation', 'toggle')}
                {renderField('currency', 'Currency Code', 'text', { readOnly: true })}
              </div>
            </div>
          )}

          {activeTab === 'razorpay' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Razorpay Gateway Settings</h2>
                <p className="text-sm text-slate-500">Configure Razorpay test/live modes, webhooks, and secure credentials.</p>
              </div>
              <div className="p-4 bg-amber-50 text-amber-900 rounded-lg text-sm mb-4">
                Razorpay Key Secret and Webhook Secret are managed securely via server-only environment variables (`RAZORPAY_KEY_SECRET`, `RAZORPAY_WEBHOOK_SECRET`) and are never exposed to the browser.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderField('razorpayMode', 'Razorpay Mode', 'select', {
                  optionsList: [
                    { label: 'TEST MODE', value: 'TEST' },
                    { label: 'LIVE MODE', value: 'LIVE' },
                  ],
                })}
                {renderField('razorpayKeyId', 'Razorpay Key ID (Masked)', 'text', { readOnly: true })}
                {renderField('webhookUrl', 'Webhook URL', 'text', { readOnly: true })}
                {renderField('webhookHealth', 'Webhook Health Status', 'status', { readOnly: true })}
                {renderField('paymentCaptureMode', 'Payment Capture Mode', 'select', {
                  optionsList: [
                    { label: 'Automatic Capture', value: 'Automatic' },
                    { label: 'Manual Capture', value: 'Manual' },
                  ],
                })}
              </div>
              <div className="pt-4 border-t border-slate-100 flex items-center gap-4">
                <button
                  onClick={handleTestRazorpay}
                  disabled={testing}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm transition disabled:opacity-50"
                >
                  {testing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  Test Razorpay Connection
                </button>
                {testResult && (
                  <div className={`p-2 rounded-lg flex items-center gap-2 text-sm ${testResult.success ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                    {testResult.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                    {testResult.message}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Wallet & Referral Settings</h2>
                <p className="text-sm text-slate-500">Configure wallet usability at checkout, split payments, and referral rewards (£100 / ₹100, min order ₹799).</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {renderField('walletUsableAtCheckout', 'Wallet Usable at Checkout', 'toggle')}
                {renderField('walletOnlyPaymentAllowed', 'Wallet-Only Payment Allowed', 'toggle')}
                {renderField('walletRazorpaySplitAllowed', 'Wallet + Razorpay Split Payment', 'toggle')}
                {renderField('walletCodSplitAllowed', 'Wallet + COD Split Payment', 'toggle')}
                {renderField('minOrderForWallet', 'Minimum Order Amount for Wallet', 'number')}
                {renderField('maxWalletUsageValue', 'Max Wallet Usage Cap (%)', 'number')}
                {renderField('fullEligibleReferralCreditAllowed', 'Full Eligible Referral Credit Allowed', 'toggle')}
                {renderField('refundToWalletEnabled', 'Refund to Wallet Enabled', 'toggle')}
                {renderField('referralRewardAmount', 'Referral Reward Amount (₹)', 'number')}
                {renderField('referralMinOrder', 'Referral Qualifying Order Minimum (₹)', 'number')}
              </div>
            </div>
          )}

          {activeTab === 'cod' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Cash on Delivery (COD) Rule Engine</h2>
                <p className="text-sm text-slate-500">Granular rules for personalised products, zones, stores, and advance payment.</p>
              </div>

              {/* Sub-tabs for COD */}
              <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
                {codSubTabs.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => setCodSubTab(sub.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      codSubTab === sub.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {sub.label}
                  </button>
                ))}
              </div>

              {codSubTab === 'general' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  {renderField('codGlobalEnabled', 'Global COD Switch', 'toggle')}
                  {renderField('minCodAmount', 'Minimum COD Order Amount (₹)', 'number')}
                  {renderField('maxCodAmount', 'Maximum COD Order Amount (₹)', 'number')}
                  {renderField('codCharge', 'Standard COD Charge (₹)', 'number')}
                  {renderField('codFreeAbove', 'COD Free Above Order Amount (₹)', 'number')}
                  {renderField('codConfirmationRequired', 'COD Confirmation Required', 'toggle')}
                  {renderField('otpConfirmationRequired', 'OTP Phone Confirmation Required', 'toggle')}
                  {renderField('codNewCustomersEnabled', 'COD for New Customers', 'toggle')}
                  {renderField('codRepeatCustomersEnabled', 'COD for Repeat Customers', 'toggle')}
                  {renderField('maxOpenCodOrders', 'Max Open COD Orders per Customer', 'number')}
                </div>
              )}

              {codSubTab === 'personalized' && (
                <div className="space-y-4 pt-2">
                  <div className="p-4 bg-indigo-50 text-indigo-900 rounded-lg text-sm">
                    Personalised products have strict customisation overhead. Configure advance payment requirements and artwork approvals.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('personalisedProductsCodDefault', 'Personalised Products COD State', 'select', {
                      optionsList: [
                        { label: 'Disabled by Default', value: 'DISABLED' },
                        { label: 'Advance Payment Required', value: 'ADVANCE_REQUIRED' },
                        { label: 'Enabled', value: 'ENABLED' },
                      ],
                    })}
                    {renderField('advancePaymentValue', 'Advance Payment Required (%)', 'number')}
                    {renderField('artworkApprovalRequired', 'Artwork Approval Required before Dispatch', 'toggle')}
                    {renderField('customerPhoneVerificationForCod', 'Customer Phone Verification Required', 'toggle')}
                  </div>
                </div>
              )}

              {codSubTab === 'categories' && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-slate-600">Configure category-level COD overrides. Product overrides take precedence over category rules.</p>
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-center text-sm font-semibold text-slate-800 border-b pb-2">
                      <span>Category Name</span>
                      <span>COD Status</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-700">
                      <span>Personalised Gifts</span>
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded text-xs font-semibold">DISABLED / ADVANCE</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-700">
                      <span>Ready Stock Cakes & Flowers</span>
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-semibold">ENABLED</span>
                    </div>
                  </div>
                </div>
              )}

              {codSubTab === 'products' && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-slate-600">Product-specific COD rules. Overrides store and category rules.</p>
                  <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-3">
                    <div className="flex justify-between items-center text-sm font-semibold text-slate-800 border-b pb-2">
                      <span>Product</span>
                      <span>Rule Override</span>
                    </div>
                    <div className="flex justify-between items-center text-sm text-slate-700">
                      <span>Personalised Photo Frame (1500₹)</span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded text-xs font-semibold">Advance 50% Required</span>
                    </div>
                  </div>
                </div>
              )}

              {codSubTab === 'stores' && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-slate-600">Store-level fulfillment center COD capabilities and limits.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('codGlobalEnabled', 'Fulfillment Hub COD Active', 'toggle')}
                    {renderField('maxCodAmount', 'Hub Max COD Cash Limit (₹)', 'number')}
                  </div>
                </div>
              )}

              {codSubTab === 'zones' && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-slate-600">Delivery zone risk levels and COD permissions.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('expressDeliveryCodEnabled', 'Express Delivery COD Enabled', 'toggle')}
                    {renderField('sameDayCodEnabled', 'Same-Day Delivery COD Enabled', 'toggle')}
                    {renderField('nextDayCodEnabled', 'Next-Day Delivery COD Enabled', 'toggle')}
                    {renderField('pickupCodEnabled', 'Store Pickup COD/Cash Enabled', 'toggle')}
                  </div>
                </div>
              )}

              {codSubTab === 'modes' && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-slate-600">Configure COD availability independently across delivery modes.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('sameDayCodEnabled', 'Same-Day Delivery COD', 'toggle')}
                    {renderField('expressDeliveryCodEnabled', 'Express Delivery COD', 'toggle')}
                    {renderField('nextDayCodEnabled', 'Next-Day Delivery COD', 'toggle')}
                    {renderField('pickupCodEnabled', 'Store Pickup COD', 'toggle')}
                  </div>
                </div>
              )}

              {codSubTab === 'customer' && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-slate-600">Customer risk filtering, verification checks, and repeat customer privileges.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('codNewCustomersEnabled', 'New Customer COD', 'toggle')}
                    {renderField('codRepeatCustomersEnabled', 'Repeat Customer COD', 'toggle')}
                    {renderField('phoneVerificationRequired', 'Phone Verified Required for COD', 'toggle')}
                    {renderField('codRiskReviewEnabled', 'Automated COD Risk Review', 'toggle')}
                  </div>
                </div>
              )}

              {codSubTab === 'ranges' && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-slate-600">Configurable order value ranges for COD eligibility.</p>
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-sm text-slate-700">
                    <div className="flex justify-between font-semibold border-b pb-1">
                      <span>Range</span>
                      <span>Status</span>
                      <span>COD Fee</span>
                    </div>
                    <div className="flex justify-between">
                      <span>₹0 - ₹499</span>
                      <span className="text-rose-600 font-medium">Disabled</span>
                      <span>₹0</span>
                    </div>
                    <div className="flex justify-between">
                      <span>₹500 - ₹2,999</span>
                      <span className="text-emerald-600 font-medium">Enabled</span>
                      <span>₹49</span>
                    </div>
                    <div className="flex justify-between">
                      <span>₹3,000 and above</span>
                      <span className="text-amber-600 font-medium">Advance Required</span>
                      <span>₹0</span>
                    </div>
                  </div>
                </div>
              )}

              {codSubTab === 'advance' && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-slate-600">Hybrid advance payment rules (Razorpay/Wallet advance + COD balance).</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('advancePaymentType', 'Advance Payment Calculation Type', 'select', {
                      optionsList: [
                        { label: 'Percentage (%)', value: 'PERCENTAGE' },
                        { label: 'Fixed Amount (₹)', value: 'FIXED' },
                      ],
                    })}
                    {renderField('advancePaymentValue', 'Advance Value (50%)', 'number')}
                  </div>
                </div>
              )}

              {codSubTab === 'reconciliation' && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-slate-600">Rider cash collection reconciliation and finance ledger rules.</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {renderField('paymentReconciliationEnabled', 'COD Cash Reconciliation Required', 'toggle')}
                  </div>
                </div>
              )}

              {codSubTab === 'audit' && (
                <div className="space-y-4 pt-2">
                  <p className="text-sm text-slate-600">Recent COD rule changes and admin audit logs.</p>
                  <div className="text-xs text-slate-500 font-mono p-3 bg-slate-50 rounded border">
                    [AUDIT] COD global rules updated by Super Admin (jpr.ajaysales@gmail.com) - Just now
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'refund' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Refund & Cancellation Settings</h2>
                <p className="text-sm text-slate-500">Configure automated refunds, source return policies, and wallet credit rules.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {renderField('autoRefundEnabled', 'Automatic Refunds on Cancellation', 'toggle')}
                {renderField('refundToWalletEnabled', 'Prefer Instant Refund to Wallet', 'toggle')}
                {renderField('refundMode', 'Default Refund Mode', 'text')}
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Payment Provider Health Dashboard</h2>
                <p className="text-sm text-slate-500">Real-time connectivity and webhook status for active gateways.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                {renderField('razorpayEnabled', 'Razorpay Gateway Status', 'status', { readOnly: true })}
                {renderField('webhookHealth', 'Razorpay Webhook Health', 'status', { readOnly: true })}
                {renderField('walletEnabled', 'Wallet Ledger System', 'status', { readOnly: true })}
                {renderField('codGlobalEnabled', 'COD Rule Engine Status', 'status', { readOnly: true })}
              </div>
            </div>
          )}

          {activeTab === 'audit' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-1">Payment Security & Change Audit Log</h2>
                <p className="text-sm text-slate-500">Immutable ledger of payment configuration changes and admin overrides.</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-sm">
                <div className="flex justify-between text-xs font-semibold text-slate-500 border-b pb-2">
                  <span>Timestamp</span>
                  <span>Action</span>
                  <span>Admin User</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="font-mono text-xs">2026-07-27 15:35:00</span>
                  <span>Updated Razorpay Mode to TEST</span>
                  <span>jpr.ajaysales@gmail.com</span>
                </div>
                <div className="flex justify-between text-slate-700">
                  <span className="font-mono text-xs">2026-07-27 14:10:00</span>
                  <span>Enabled Personalised Advance 50% Rule</span>
                  <span>jpr.ajaysales@gmail.com</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
