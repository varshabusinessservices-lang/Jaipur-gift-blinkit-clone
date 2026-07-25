import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Eye, Layout, Smartphone, Tablet, Monitor, Info, Check, AlertTriangle, ShieldCheck, Download, Mail, Phone, MessageSquare, Clipboard, Image as ImageIcon, Heart
} from 'lucide-react';
import { personalisationFormsService } from '../services/personalisationFormsService';
import { toast } from 'sonner';

export function PersonalisationFormDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [form, setForm] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'preview' | 'production'>('preview');
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [submission, setSubmission] = useState<Record<string, any>>({});
  const [validationErrors, setValidationErrors] = useState<any[]>([]);
  const [validatedSuccessfully, setValidatedSuccessfully] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await personalisationFormsService.getForm(id);
        setForm(data);
      } catch (error) {
        toast.error('Failed to load personalisation form');
        navigate('/admin/personalisation-forms');
      } finally {
        setLoading(false);
      }
    };
    loadForm();
  }, [id, navigate]);

  const handleInputChange = (fieldId: string, val: any) => {
    setSubmission((prev) => ({ ...prev, [fieldId]: val }));
    setValidationErrors((prev) => prev.filter((err) => err.fieldId !== fieldId));
    setValidatedSuccessfully(false);
  };

  const handleTestValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    try {
      const result = await personalisationFormsService.validateSubmission(form.id, submission);
      if (result.isValid) {
        setValidationErrors([]);
        setValidatedSuccessfully(true);
        toast.success('Preview Submission Validated: All rules matched successfully!');
      } else {
        setValidationErrors(result.errors || []);
        setValidatedSuccessfully(false);
        toast.error('Validation Failed: Please check the errors highlighted below.');
      }
    } catch (err) {
      toast.error('Failed to run test validation');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-semibold">Loading Form View...</div>;
  }

  if (!form) {
    return <div className="text-center py-20 text-red-500 font-semibold">Form not found.</div>;
  }

  // Get field widths
  const getColSpan = (layout: string) => {
    if (layout === '1_column') return 'col-span-1';
    if (layout === '2_column') return 'col-span-1 md:col-span-2';
    return 'col-span-1 md:col-span-2';
  };

  // Group fields for production
  const fields = form.fields || [];
  const photoFields = fields.filter((f: any) =>
    ['MAIN_PHOTO', 'SUPPORTING_PHOTOS', 'PROFILE_PHOTO', 'LOGO', 'QR_IMAGE', 'IMAGE', 'MULTI_IMAGE'].includes(f.fieldType)
  );
  const textAndMsgFields = fields.filter((f: any) =>
    ['TEXT', 'TEXTAREA', 'COLOR', 'RATING', 'SIGNATURE'].includes(f.fieldType)
  );
  const metadataFields = fields.filter((f: any) =>
    !photoFields.includes(f) && !textAndMsgFields.includes(f)
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/admin/personalisation-forms" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 shadow-sm">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Form Analytics & Details</span>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{form.name}</h1>
          </div>
        </div>
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-start sm:self-center border border-slate-200 shadow-inner">
          <button
            onClick={() => setActiveTab('preview')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'preview'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="h-4 w-4" /> Live Interactive Preview
          </button>
          <button
            onClick={() => setActiveTab('production')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'production'
                ? 'bg-white text-slate-950 shadow-sm border border-slate-200/50'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layout className="h-4 w-4" /> Production Checklist View
          </button>
        </div>
      </div>

      {activeTab === 'preview' ? (
        <div className="space-y-6">
          {/* Device and instructions bar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white border border-slate-200 rounded-xl p-4 shadow-sm gap-4">
            <div className="flex items-start gap-2.5">
              <Info className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Interactive Form Tester</h4>
                <p className="text-xs text-slate-500">Test live validation rules (regex, required, counts, etc.) directly in the responsive frame below.</p>
              </div>
            </div>
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 shadow-inner self-start sm:self-center">
              <button
                onClick={() => setDevice('desktop')}
                className={`p-1.5 rounded-md ${device === 'desktop' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                title="Desktop Layout"
              >
                <Monitor className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDevice('tablet')}
                className={`p-1.5 rounded-md ${device === 'tablet' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                title="Tablet Frame"
              >
                <Tablet className="h-4 w-4" />
              </button>
              <button
                onClick={() => setDevice('mobile')}
                className={`p-1.5 rounded-md ${device === 'mobile' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                title="Mobile View"
              >
                <Smartphone className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Device frame container */}
          <div className="flex justify-center transition-all">
            <div
              className={`bg-slate-50 border border-slate-200 p-4 rounded-2xl shadow transition-all duration-300 ${
                device === 'mobile'
                  ? 'max-w-[390px] w-full border-[8px] border-slate-800 rounded-[36px]'
                  : device === 'tablet'
                  ? 'max-w-[768px] w-full border-[6px] border-slate-800 rounded-[24px]'
                  : 'w-full'
              }`}
            >
              <form onSubmit={handleTestValidate} className="bg-white p-6 rounded-xl space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{form.name}</h3>
                  {form.description && <p className="text-xs text-slate-500 mt-1">{form.description}</p>}
                </div>

                {validatedSuccessfully && (
                  <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-lg flex items-start gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-emerald-800">Success! Form entries validated</h4>
                      <p className="text-[11px] text-emerald-700 mt-0.5">Ready for shopping cart integration. No client-side payload issues.</p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field: any) => {
                    const error = validationErrors.find((err) => err.fieldId === field.id);
                    const colSpan = getColSpan(field.settingsJson?.layout || 'full_width');
                    const isPhoto = ['MAIN_PHOTO', 'SUPPORTING_PHOTOS', 'IMAGE', 'MULTI_IMAGE', 'FILE'].includes(field.fieldType);

                    return (
                      <div key={field.id} className={`${colSpan} space-y-1.5`}>
                        <label className="block text-xs font-semibold text-slate-700">
                          {field.label} {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {/* Text inputs */}
                        {['TEXT', 'EMAIL', 'PHONE', 'WHATSAPP', 'URL'].includes(field.fieldType) && (
                          <input
                            type={field.fieldType === 'EMAIL' ? 'email' : 'text'}
                            value={submission[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                            className={`w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 ${
                              error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'
                            }`}
                          />
                        )}

                        {/* Textarea */}
                        {field.fieldType === 'TEXTAREA' && (
                          <textarea
                            rows={3}
                            value={submission[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                            className={`w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 ${
                              error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'
                            }`}
                          />
                        )}

                        {/* Numeric */}
                        {field.fieldType === 'NUMBER' && (
                          <input
                            type="number"
                            value={submission[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            placeholder={field.placeholder || 'e.g. 10'}
                            className={`w-full px-3 py-2 border rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 ${
                              error ? 'border-red-500 focus:ring-red-500' : 'border-slate-300 focus:ring-indigo-500'
                            }`}
                          />
                        )}

                        {/* Date / Time */}
                        {field.fieldType === 'DATE' && (
                          <input
                            type="date"
                            value={submission[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none"
                          />
                        )}

                        {/* Select Choice */}
                        {field.fieldType === 'SELECT' && (
                          <select
                            value={submission[field.id] || ''}
                            onChange={(e) => handleInputChange(field.id, e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none"
                          >
                            <option value="">Select an option...</option>
                            {(field.settingsJson?.options || []).map((opt: any) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        )}

                        {/* Media and uploads */}
                        {isPhoto && (
                          <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 text-center space-y-2">
                            <ImageIcon className="h-8 w-8 text-slate-300 mx-auto" />
                            <div className="text-xs text-slate-600 font-semibold">
                              Click or drag images/files here to upload
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Limits: Max {field.settingsJson?.imageSettings?.maxImages || 1} image(s), Up to {((field.settingsJson?.imageSettings?.maxSizeBytes || 10 * 1024 * 1024) / (1024 * 1024))}MB
                            </div>
                            {/* Simulator for photo upload */}
                            <button
                              type="button"
                              onClick={() => {
                                // simulate successful file input
                                handleInputChange(field.id, [{ name: 'test-photo.jpg', size: 1000 }]);
                                toast.success(`Simulated image upload for "${field.label}"`);
                              }}
                              className="px-2 py-1 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 rounded text-[10px] font-semibold text-slate-700"
                            >
                              Mock File Select
                            </button>
                            {submission[field.id] && (
                              <div className="text-[10px] text-indigo-600 font-medium bg-indigo-50 border border-indigo-200/50 py-1 rounded">
                                Selected: {submission[field.id].length} items
                              </div>
                            )}
                          </div>
                        )}

                        {/* Help instructions text */}
                        {field.helpText && <p className="text-[10px] text-slate-400 font-medium">{field.helpText}</p>}

                        {/* Inline red errors */}
                        {error && (
                          <p className="text-xs text-red-500 font-semibold flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" /> {error.message}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-sm font-semibold text-white rounded-lg shadow transition-colors"
                  >
                    Validate Submissions Preview
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      ) : (
        /* Production Team visual view */
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Photos First Left Grid */}
          <div className="xl:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <ImageIcon className="h-5 w-5 text-rose-500" /> Phase 1: High-Resolution Photo Assets
                  </h3>
                  <p className="text-xs text-slate-500">Custom production design team always processes and crops photo assets first.</p>
                </div>
                <span className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full">
                  High Priority
                </span>
              </div>

              {photoFields.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No photo or file assets are collected in this form.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {photoFields.map((f: any) => (
                    <div key={f.id} className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-sm">{f.label}</span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">{f.fieldType}</span>
                      </div>
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>Target Count:</span>
                          <span className="font-semibold text-slate-800">
                            Min {f.settingsJson?.imageSettings?.minImages ?? 1} - Max {f.settingsJson?.imageSettings?.maxImages ?? 1}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Resolution Minimum:</span>
                          <span className="font-semibold text-indigo-600">{f.settingsJson?.imageSettings?.minResolution || 'Auto (Any)'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Crop Required?</span>
                          <span className={`font-semibold ${f.settingsJson?.imageSettings?.cropRequired ? 'text-rose-600' : 'text-slate-500'}`}>
                            {f.settingsJson?.imageSettings?.cropRequired ? 'Yes' : 'No'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Background Removal?</span>
                          <span className={`font-semibold ${f.settingsJson?.imageSettings?.backgroundRemovalRequired ? 'text-amber-600' : 'text-slate-500'}`}>
                            {f.settingsJson?.imageSettings?.backgroundRemovalRequired ? 'Yes' : 'No'}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Texts and messages second */}
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="h-5 w-5 text-indigo-500" /> Phase 2: Card Greeting Message & Inscriptions
                  </h3>
                  <p className="text-xs text-slate-500">Typography inscriptions, greetings, custom text engraving, and font ratings.</p>
                </div>
                <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2.5 py-1 rounded-full">
                  Medium Priority
                </span>
              </div>

              {textAndMsgFields.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-sm">
                  No custom text inputs or greeting messages are collected in this form.
                </div>
              ) : (
                <div className="space-y-4">
                  {textAndMsgFields.map((f: any) => (
                    <div key={f.id} className="border border-slate-100 rounded-lg p-4 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-semibold text-slate-800 text-sm">{f.label}</h4>
                        {f.placeholder && <p className="text-xs text-slate-400 mt-0.5">Placeholder: "{f.placeholder}"</p>}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {f.validationJson?.text?.uppercase && (
                          <span className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-200 px-2 py-0.5 rounded font-semibold uppercase">
                            Engrave Uppercase
                          </span>
                        )}
                        {f.validationJson?.text?.maxLength && (
                          <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                            Max {f.validationJson?.text?.maxLength} chars
                          </span>
                        )}
                        {f.required && (
                          <span className="text-[10px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded font-semibold">
                            Mandatory
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right hand checklist sidebar */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Phase 3: Customer Details</h3>
              {metadataFields.length === 0 ? (
                <p className="text-xs text-slate-500">No external parameters (dates, selections) exist.</p>
              ) : (
                <div className="space-y-3">
                  {metadataFields.map((f: any) => (
                    <div key={f.id} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-100/60 last:border-none">
                      <span className="font-semibold text-slate-700">{f.label}</span>
                      <span className="text-slate-500 font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">{f.fieldType}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white rounded-xl p-5 shadow-md relative overflow-hidden">
              <Heart className="absolute right-[-10px] bottom-[-10px] h-24 w-24 text-indigo-400 opacity-20" />
              <h3 className="text-base font-bold">Production Approved Schema</h3>
              <p className="text-xs text-indigo-100 mt-1.5 leading-relaxed">
                This schema has been deployed successfully as v{form.version}. It has been optimized for clean mobile customer input and flawless delivery team printing layouts.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-200">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                Verified Production-Ready
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
