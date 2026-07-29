import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useShopStore } from '../store/shopStore';
import { ArrowLeft, Sparkles, Upload, CheckCircle2, ChevronRight, Image as ImageIcon, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const ProductCustomizePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { products, templates, addToCart, addToast } = useShopStore();

  const product = products.find(p => p.slug === slug || p.id === slug);
  const template = templates.find(t => t.code === product?.personalisationTemplateCode) || templates[0];

  const [step, setStep] = useState<number>(1);
  const [selectedVariation, setSelectedVariation] = useState(product?.variations?.[0]);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, string>>({});
  const [giftMessage, setGiftMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-xl font-black text-slate-900 dark:text-white">Product Not Found</h2>
        <Button onClick={() => navigate('/')}>Return Home</Button>
      </div>
    );
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleFileUpload = (fieldId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate object URL for preview
      const previewUrl = URL.createObjectURL(file);
      setUploadedFiles(prev => ({ ...prev, [fieldId]: previewUrl }));
      setFormData(prev => ({ ...prev, [fieldId]: file.name }));
      addToast(`Photo uploaded successfully for ${fieldId}`, 'success');
    }
  };

  const totalSteps = product.productType === 'variation' ? 3 : 2;

  const handleAddToCartWithCustomization = () => {
    // Validate required fields
    for (const field of template.fields) {
      if (field.required && !formData[field.id] && !uploadedFiles[field.id]) {
        addToast(`Please fill required field: ${field.label}`, 'error');
        return;
      }
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const combinedPersonalisation = { ...formData, ...uploadedFiles, templateCode: template.code };
      addToCart(product, 1, selectedVariation, combinedPersonalisation, giftMessage);
      setIsSubmitting(false);
      addToast('Customized product added to cart!', 'success');
      navigate('/cart');
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pb-24">
      {/* Sticky Top Header */}
      <div className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Customisation Studio</span>
            <h1 className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[220px] sm:max-w-md">{product.name}</h1>
          </div>
        </div>

        <div className="text-xs font-bold text-slate-500">
          Step {step} of {totalSteps}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1">
        <div
          className="bg-indigo-600 h-1 transition-all duration-300"
          style={{ width: `${(step / totalSteps) * 100}%` }}
        />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Step 1: Variations (if applicable) */}
        {step === 1 && product.productType === 'variation' && product.variations && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <h2 className="text-base font-black text-slate-900 dark:text-white">Select Product Edition</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.variations.map(v => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariation(v)}
                  className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between ${selectedVariation?.id === v.id ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-2 ring-indigo-100' : 'border-slate-200 dark:border-slate-800'}`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">{v.name}</div>
                    <div className="text-xs font-black text-indigo-600 mt-1">₹{v.price}</div>
                  </div>
                  {selectedVariation?.id === v.id && <CheckCircle2 className="h-5 w-5 text-indigo-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Personalisation Form Fields */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <div>
              <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{template.name}</span>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mt-0.5">Enter Personalisation Details</h2>
            </div>
            <span className="text-xs text-slate-400">All fields marked * are required</span>
          </div>

          <div className="space-y-4">
            {template.fields.map(field => (
              <div key={field.id} className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {field.label} {field.required && <span className="text-rose-600">*</span>}
                </label>

                {field.type === 'image' ? (
                  <div className="space-y-3">
                    {uploadedFiles[field.id] ? (
                      <div className="relative w-32 h-32 rounded-2xl overflow-hidden border-2 border-indigo-600 shadow-sm">
                        <img src={uploadedFiles[field.id]} alt="Preview" className="w-full h-full object-cover" />
                        <button
                          onClick={() => {
                            setUploadedFiles(prev => { const n = {...prev}; delete n[field.id]; return n; });
                            setFormData(prev => { const n = {...prev}; delete n[field.id]; return n; });
                          }}
                          className="absolute top-2 right-2 bg-rose-600 text-white p-1.5 rounded-full shadow-md hover:bg-rose-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-indigo-600 transition-colors bg-slate-50 dark:bg-slate-800/50">
                        <Upload className="h-8 w-8 text-indigo-600 mb-2" />
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Tap to upload photo</span>
                        <span className="text-[10px] text-slate-400 mt-0.5">Supports JPG, PNG (High resolution for printing)</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(field.id, e)}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ) : field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    placeholder={field.placeholder || 'Enter custom text...'}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full text-xs p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                ) : field.type === 'dropdown' && field.options ? (
                  <select
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full text-xs p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="">Select option</option>
                    {field.options.map((opt, i) => (
                      <option key={i} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={field.type === 'date' ? 'date' : 'text'}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    value={formData[field.id] || ''}
                    onChange={(e) => handleFieldChange(field.id, e.target.value)}
                    className="w-full text-xs p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                )}

                {field.helpText && <p className="text-[10px] text-slate-400">{field.helpText}</p>}
              </div>
            ))}

            {/* Gift message card */}
            <div className="space-y-1.5 pt-4 border-t border-slate-100 dark:border-slate-800">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Free Gift Message on Card
              </label>
              <input
                type="text"
                placeholder="e.g. Happy Birthday! Wishing you endless joy."
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                className="w-full text-xs p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Disclaimer box */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <p className="font-bold">Important Customisation Policy</p>
            <p className="text-[11px] opacity-90">Customized products are precision printed according to your exact instructions. No returns or exchanges are accepted for customer-provided spelling or photo errors.</p>
          </div>
        </div>
      </div>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 pb-safe flex items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Price</span>
          <span className="text-lg font-black text-slate-900 dark:text-white">₹{selectedVariation ? selectedVariation.price : product.price}</span>
        </div>

        <Button
          onClick={handleAddToCartWithCustomization}
          disabled={isSubmitting}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-black px-8 py-3.5 rounded-2xl shadow-lg flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" /> {isSubmitting ? 'Adding...' : 'Add Customized Product'}
        </Button>
      </div>
    </div>
  );
};
