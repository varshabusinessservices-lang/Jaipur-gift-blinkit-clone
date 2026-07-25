import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Plus, Trash2, Copy, Save, AlertCircle, ArrowUp, ArrowDown, Settings, HelpCircle, History
} from 'lucide-react';
import { PageHeader } from '../../../components/layout/PageHeader';
import { personalisationFormsService } from '../services/personalisationFormsService';
import { toast } from 'sonner';

const FIELD_TYPES = [
  { group: 'Standard Inputs', types: ['TEXT', 'TEXTAREA', 'NUMBER', 'EMAIL', 'PHONE', 'WHATSAPP', 'DATE', 'TIME', 'DATE_TIME', 'COLOR', 'URL', 'RATING', 'BOOLEAN', 'SIGNATURE'] },
  { group: 'Choices', types: ['SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX'] },
  { group: 'Media Uploads', types: ['FILE', 'IMAGE', 'MULTI_IMAGE'] },
  { group: 'Special Production', types: ['MAIN_PHOTO', 'SUPPORTING_PHOTOS', 'PROFILE_PHOTO', 'LOGO', 'QR_IMAGE', 'DOCUMENT'] }
];

const SECTIONS = ['Customer Details', 'Photos', 'Message', 'Occasion', 'Delivery Notes'];
const LAYOUTS = [
  { value: '1_column', label: '1 Column (Half Width)' },
  { value: '2_column', label: '2 Column (Dual Grid)' },
  { value: 'full_width', label: 'Full Width' }
];

export function PersonalisationFormEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [version, setVersion] = useState(1);
  const [fields, setFields] = useState<any[]>([]);
  const [selectedFieldIdx, setSelectedFieldIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadForm = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const data = await personalisationFormsService.getForm(id);
        if (data) {
          setName(data.name);
          setSlug(data.slug);
          setDescription(data.description || '');
          setStatus(data.status);
          setVersion(data.version);
          // ensure fields are correctly structured
          setFields(data.fields || []);
        }
      } catch (error) {
        toast.error('Failed to load personalisation form');
        navigate('/admin/personalisation-forms');
      } finally {
        setLoading(false);
      }
    };
    loadForm();
  }, [id, navigate]);

  const handleAddField = () => {
    const newField = {
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      label: 'New Field Label',
      placeholder: '',
      helpText: '',
      fieldType: 'TEXT',
      required: false,
      sortOrder: fields.length + 1,
      status: 'ACTIVE',
      validationJson: {
        text: { trim: true },
        number: { integer: true },
        date: { pastAllowed: true, futureAllowed: true },
        phone: { length: 10 },
        whatsapp: { isWhatsApp: false, required: false }
      },
      settingsJson: {
        section: 'Customer Details',
        layout: 'full_width',
        options: [],
        conditions: [],
        imageSettings: {
          minImages: 1,
          maxImages: 1,
          maxSizeBytes: 10 * 1024 * 1024,
          allowedFormats: ['jpg', 'jpeg', 'png'],
          cropRequired: false,
          backgroundRemovalRequired: false,
          imageQualityCheckEnabled: true
        }
      }
    };
    setFields([...fields, newField]);
    setSelectedFieldIdx(fields.length);
  };

  const handleDeleteField = (idx: number) => {
    const updated = fields.filter((_, i) => i !== idx);
    setFields(updated);
    if (selectedFieldIdx === idx) {
      setSelectedFieldIdx(null);
    } else if (selectedFieldIdx !== null && selectedFieldIdx > idx) {
      setSelectedFieldIdx(selectedFieldIdx - 1);
    }
  };

  const handleDuplicateField = (idx: number) => {
    const origin = fields[idx];
    const duplicated = {
      ...JSON.parse(JSON.stringify(origin)),
      id: `temp-${Math.random().toString(36).substr(2, 9)}`,
      label: `${origin.label} (Copy)`,
      sortOrder: fields.length + 1
    };
    setFields([...fields, duplicated]);
    setSelectedFieldIdx(fields.length);
  };

  const handleMoveField = (idx: number, direction: 'up' | 'down') => {
    if (direction === 'up' && idx === 0) return;
    if (direction === 'down' && idx === fields.length - 1) return;

    const updated = [...fields];
    const swapWithIdx = direction === 'up' ? idx - 1 : idx + 1;
    
    const temp = updated[idx];
    updated[idx] = updated[swapWithIdx];
    updated[swapWithIdx] = temp;

    // fix sort orders
    updated.forEach((f, index) => {
      f.sortOrder = index + 1;
    });

    setFields(updated);
    if (selectedFieldIdx === idx) {
      setSelectedFieldIdx(swapWithIdx);
    } else if (selectedFieldIdx === swapWithIdx) {
      setSelectedFieldIdx(idx);
    }
  };

  const handleUpdateFieldProp = (prop: string, val: any) => {
    if (selectedFieldIdx === null) return;
    const updated = [...fields];
    updated[selectedFieldIdx][prop] = val;
    setFields(updated);
  };

  const handleUpdateNestedProp = (parentProp: 'validationJson' | 'settingsJson', nestedKey: string, val: any) => {
    if (selectedFieldIdx === null) return;
    const updated = [...fields];
    updated[selectedFieldIdx][parentProp] = {
      ...updated[selectedFieldIdx][parentProp],
      [nestedKey]: {
        ...updated[selectedFieldIdx][parentProp][nestedKey],
        ...val
      }
    };
    setFields(updated);
  };

  const handleUpdateSettingsProp = (key: string, val: any) => {
    if (selectedFieldIdx === null) return;
    const updated = [...fields];
    updated[selectedFieldIdx].settingsJson = {
      ...updated[selectedFieldIdx].settingsJson,
      [key]: val
    };
    setFields(updated);
  };

  const handleSaveForm = async () => {
    if (!id) return;
    if (!name.trim()) {
      toast.error('Form Name is required');
      return;
    }
    if (fields.length === 0) {
      toast.error('Add at least one field to this form');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name,
        slug: slug.trim() || undefined,
        description,
        status,
        fields: fields.map((f, idx) => ({
          ...f,
          id: f.id.startsWith('temp-') ? undefined : f.id,
          sortOrder: idx + 1,
        })),
      };

      await personalisationFormsService.updateForm(id, payload);
      toast.success(`Form updated safely. Saved as version ${version + 1}!`);
      navigate('/admin/personalisation-forms');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update personalisation form');
    } finally {
      setSaving(false);
    }
  };

  const activeField = selectedFieldIdx !== null ? fields[selectedFieldIdx] : null;

  if (loading) {
    return <div className="text-center py-20 text-slate-500 font-semibold">Loading Form Designer...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/admin/personalisation-forms" className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 shadow-sm">
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Catalog Forms</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
              <History className="h-3 w-3" /> Version {version}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-0.5">Edit Designer Schema</h1>
        </div>
        <button
          onClick={handleSaveForm}
          disabled={saving}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow transition-colors"
        >
          <Save className="h-4 w-4" />
          {saving ? 'Saving...' : 'Deploy New Version'}
        </button>
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-semibold text-amber-800">Automatic Version Protection Activated</h4>
          <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
            Editing will automatically publish a new version (v{version + 1}). Old completed orders and shopping cart snapshots pointing to v{version} will remain locked to their historical form design, guaranteeing production safety.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Metadata Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">Form Settings</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Form Name <span className="text-red-500">*</span></label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Baby birth details"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Custom Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="e.g. baby-birth-details"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Brief guidelines for custom production team..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="ACTIVE">ACTIVE (Available for assignments)</option>
                <option value="INACTIVE">INACTIVE (Hidden)</option>
              </select>
            </div>
          </div>

          {/* Form Fields List Side panel */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col min-h-[350px]">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Form Fields ({fields.length})</h3>
              <button
                onClick={handleAddField}
                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <Plus className="h-3 w-3" /> Add Field
              </button>
            </div>

            {fields.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400 py-12 text-center text-sm">
                <AlertCircle className="h-8 w-8 text-slate-300 mb-2" />
                No fields added yet.<br />Click 'Add Field' above.
              </div>
            ) : (
              <div className="space-y-2 flex-1 overflow-y-auto max-h-[400px]">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    onClick={() => setSelectedFieldIdx(idx)}
                    className={`p-3 border rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                      selectedFieldIdx === idx
                        ? 'border-indigo-500 bg-indigo-50/40 shadow-sm'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="font-semibold text-sm text-slate-800 truncate">{field.label || 'Untitled Field'}</span>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5">{field.fieldType} {field.required && '• Required'}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleMoveField(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleMoveField(idx, 'down')}
                        disabled={idx === fields.length - 1}
                        className="p-1 text-slate-400 hover:text-slate-600 disabled:opacity-30"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteField(idx)}
                        className="p-1 text-red-400 hover:text-red-600"
                        title="Delete Field"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Visual Field Editor and Configurator */}
        <div className="lg:col-span-2">
          {activeField ? (
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-800">Field Details: {activeField.label || 'New Field'}</h2>
                  <p className="text-xs text-slate-500 mt-0.5">Customize the field type, display settings, and validation rules.</p>
                </div>
                <button
                  onClick={() => handleDuplicateField(selectedFieldIdx!)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                >
                  <Copy className="h-3.5 w-3.5" /> Duplicate Field
                </button>
              </div>

              {/* Basic configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Field Type</label>
                  <select
                    value={activeField.fieldType}
                    onChange={(e) => handleUpdateFieldProp('fieldType', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {FIELD_TYPES.map((grp) => (
                      <optgroup key={grp.group} label={grp.group}>
                        {grp.types.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Layout Width</label>
                  <select
                    value={activeField.settingsJson?.layout || 'full_width'}
                    onChange={(e) => handleUpdateSettingsProp('layout', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {LAYOUTS.map((lay) => (
                      <option key={lay.value} value={lay.value}>{lay.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Field Label / Title</label>
                  <input
                    type="text"
                    value={activeField.label}
                    onChange={(e) => handleUpdateFieldProp('label', e.target.value)}
                    placeholder="e.g. Baby Name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Placeholder Text</label>
                  <input
                    type="text"
                    value={activeField.placeholder || ''}
                    onChange={(e) => handleUpdateFieldProp('placeholder', e.target.value)}
                    placeholder="e.g. Enter baby's full name"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Help Text / Instruction</label>
                  <input
                    type="text"
                    value={activeField.helpText || ''}
                    onChange={(e) => handleUpdateFieldProp('helpText', e.target.value)}
                    placeholder="e.g. Spell check before submitting"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Field Group / Section</label>
                  <select
                    value={activeField.settingsJson?.section || 'Customer Details'}
                    onChange={(e) => handleUpdateSettingsProp('section', e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {SECTIONS.map((sec) => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeField.required}
                      onChange={(e) => handleUpdateFieldProp('required', e.target.checked)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    Required Field?
                  </label>
                </div>
              </div>

              {/* IMAGE/FILE SETTINGS PANEL */}
              {['IMAGE', 'MULTI_IMAGE', 'MAIN_PHOTO', 'SUPPORTING_PHOTOS', 'PROFILE_PHOTO', 'LOGO', 'QR_IMAGE', 'DOCUMENT', 'FILE'].includes(activeField.fieldType) && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Settings className="h-4 w-4 text-indigo-500" /> Image & File Upload Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Min Files/Images</label>
                      <input
                        type="number"
                        min={0}
                        value={activeField.settingsJson?.imageSettings?.minImages ?? 1}
                        onChange={(e) => handleUpdateNestedProp('settingsJson', 'imageSettings', { minImages: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Max Files/Images</label>
                      <input
                        type="number"
                        min={1}
                        value={activeField.settingsJson?.imageSettings?.maxImages ?? 1}
                        onChange={(e) => handleUpdateNestedProp('settingsJson', 'imageSettings', { maxImages: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Max Size (MB)</label>
                      <input
                        type="number"
                        min={1}
                        value={((activeField.settingsJson?.imageSettings?.maxSizeBytes || 10 * 1024 * 1024) / (1024 * 1024))}
                        onChange={(e) => handleUpdateNestedProp('settingsJson', 'imageSettings', { maxSizeBytes: parseInt(e.target.value, 10) * 1024 * 1024 })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Min Resolution</label>
                      <input
                        type="text"
                        placeholder="e.g. 1000x1000"
                        value={activeField.settingsJson?.imageSettings?.minResolution || ''}
                        onChange={(e) => handleUpdateNestedProp('settingsJson', 'imageSettings', { minResolution: e.target.value })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2 flex flex-col justify-center">
                      <span className="block text-xs font-semibold text-slate-600 mb-2">Image Processing Rules</span>
                      <div className="flex flex-wrap gap-4">
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeField.settingsJson?.imageSettings?.cropRequired || false}
                            onChange={(e) => handleUpdateNestedProp('settingsJson', 'imageSettings', { cropRequired: e.target.checked })}
                            className="rounded border-slate-300 text-indigo-600"
                          />
                          Crop Required
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeField.settingsJson?.imageSettings?.backgroundRemovalRequired || false}
                            onChange={(e) => handleUpdateNestedProp('settingsJson', 'imageSettings', { backgroundRemovalRequired: e.target.checked })}
                            className="rounded border-slate-300 text-indigo-600"
                          />
                          Background Removal
                        </label>
                        <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={activeField.settingsJson?.imageSettings?.imageQualityCheckEnabled ?? true}
                            onChange={(e) => handleUpdateNestedProp('settingsJson', 'imageSettings', { imageQualityCheckEnabled: e.target.checked })}
                            className="rounded border-slate-300 text-indigo-600"
                          />
                          Quality Checks
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TEXT/TEXTAREA VALIDATIONS PANEL */}
              {['TEXT', 'TEXTAREA'].includes(activeField.fieldType) && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Settings className="h-4 w-4 text-indigo-500" /> Text Constraints
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Min Length</label>
                      <input
                        type="number"
                        min={0}
                        value={activeField.validationJson?.text?.minLength ?? ''}
                        onChange={(e) => handleUpdateNestedProp('validationJson', 'text', { minLength: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Max Length</label>
                      <input
                        type="number"
                        min={0}
                        value={activeField.validationJson?.text?.maxLength ?? ''}
                        onChange={(e) => handleUpdateNestedProp('validationJson', 'text', { maxLength: e.target.value ? parseInt(e.target.value, 10) : undefined })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Regex Pattern (Future Ready)</label>
                      <input
                        type="text"
                        placeholder="e.g. ^[A-Z]{3}$"
                        value={activeField.validationJson?.text?.pattern || ''}
                        onChange={(e) => handleUpdateNestedProp('validationJson', 'text', { pattern: e.target.value || undefined })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none font-mono text-xs"
                      />
                    </div>
                    <div className="md:col-span-4 flex flex-wrap gap-4 mt-2 border-t border-slate-200/60 pt-3">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeField.validationJson?.text?.onlyNumbers || false}
                          onChange={(e) => handleUpdateNestedProp('validationJson', 'text', { onlyNumbers: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        Only Numbers
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeField.validationJson?.text?.onlyLetters || false}
                          onChange={(e) => handleUpdateNestedProp('validationJson', 'text', { onlyLetters: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        Only Letters
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeField.validationJson?.text?.uppercase || false}
                          onChange={(e) => handleUpdateNestedProp('validationJson', 'text', { uppercase: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        Force Uppercase
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeField.validationJson?.text?.trim ?? true}
                          onChange={(e) => handleUpdateNestedProp('validationJson', 'text', { trim: e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        Auto Trim Whitespace
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* NUMBER VALIDATIONS PANEL */}
              {activeField.fieldType === 'NUMBER' && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Settings className="h-4 w-4 text-indigo-500" /> Numeric Limits
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Minimum Value</label>
                      <input
                        type="number"
                        value={activeField.validationJson?.number?.min ?? ''}
                        onChange={(e) => handleUpdateNestedProp('validationJson', 'number', { min: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Maximum Value</label>
                      <input
                        type="number"
                        value={activeField.validationJson?.number?.max ?? ''}
                        onChange={(e) => handleUpdateNestedProp('validationJson', 'number', { max: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm bg-white text-slate-800 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-4 md:col-span-2 py-2">
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeField.validationJson?.number?.integer || false}
                          onChange={(e) => handleUpdateNestedProp('validationJson', 'number', { integer: e.target.checked, decimal: !e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        Integer Only
                      </label>
                      <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={activeField.validationJson?.number?.decimal || false}
                          onChange={(e) => handleUpdateNestedProp('validationJson', 'number', { decimal: e.target.checked, integer: !e.target.checked })}
                          className="rounded border-slate-300 text-indigo-600"
                        />
                        Allow Decimal
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* DATE VALIDATIONS PANEL */}
              {['DATE', 'DATE_TIME'].includes(activeField.fieldType) && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                    <Settings className="h-4 w-4 text-indigo-500" /> Date Settings
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeField.validationJson?.date?.futureAllowed ?? true}
                        onChange={(e) => handleUpdateNestedProp('validationJson', 'date', { futureAllowed: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      Future Dates Allowed?
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={activeField.validationJson?.date?.pastAllowed ?? true}
                        onChange={(e) => handleUpdateNestedProp('validationJson', 'date', { pastAllowed: e.target.checked })}
                        className="rounded border-slate-300 text-indigo-600"
                      />
                      Past Dates Allowed?
                    </label>
                  </div>
                </div>
              )}

              {/* OPTIONS LIST FOR SELECTS / CHECKS */}
              {['SELECT', 'MULTI_SELECT', 'RADIO', 'CHECKBOX'].includes(activeField.fieldType) && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Choice Options</h4>
                  <div className="space-y-2">
                    {(activeField.settingsJson?.options || []).map((opt: any, oidx: number) => (
                      <div key={oidx} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt.label}
                          onChange={(e) => {
                            const newOpts = [...(activeField.settingsJson.options || [])];
                            newOpts[oidx] = { label: e.target.value, value: e.target.value.toLowerCase().replace(/\s+/g, '-') };
                            handleUpdateSettingsProp('options', newOpts);
                          }}
                          placeholder="Option Label"
                          className="flex-1 px-3 py-1 border border-slate-300 rounded text-xs bg-white"
                        />
                        <button
                          onClick={() => {
                            const newOpts = (activeField.settingsJson.options || []).filter((_: any, i: number) => i !== oidx);
                            handleUpdateSettingsProp('options', newOpts);
                          }}
                          className="p-1 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => {
                        const newOpts = [...(activeField.settingsJson?.options || []), { label: 'New Option', value: 'new-option' }];
                        handleUpdateSettingsProp('options', newOpts);
                      }}
                      className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <Plus className="h-3 w-3" /> Add Choice Option
                    </button>
                  </div>
                </div>
              )}

              {/* FUTURE CONDITIONAL LOGIC BLOCK */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                  <HelpCircle className="h-4 w-4 text-indigo-500" /> Conditional Visibility Logic (Future Ready)
                </h4>
                <p className="text-xs text-slate-500">Configure future-ready rules to hide or show this field based on other fields' values.</p>
                <div className="space-y-2">
                  {(activeField.settingsJson?.conditions || []).map((cond: any, cidx: number) => (
                    <div key={cidx} className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 p-2 rounded-lg">
                      <span className="text-xs text-slate-500">If Field ID</span>
                      <input
                        type="text"
                        value={cond.fieldId}
                        onChange={(e) => {
                          const newConds = [...activeField.settingsJson.conditions];
                          newConds[cidx].fieldId = e.target.value;
                          handleUpdateSettingsProp('conditions', newConds);
                        }}
                        placeholder="field-123"
                        className="px-2 py-1 border border-slate-300 rounded text-xs w-32 font-mono"
                      />
                      <select
                        value={cond.operator}
                        onChange={(e) => {
                          const newConds = [...activeField.settingsJson.conditions];
                          newConds[cidx].operator = e.target.value;
                          handleUpdateSettingsProp('conditions', newConds);
                        }}
                        className="px-2 py-1 border border-slate-300 rounded text-xs bg-white text-slate-700"
                      >
                        <option value="equals">Equals</option>
                        <option value="not_equals">Does Not Equal</option>
                        <option value="contains">Contains</option>
                        <option value="empty">Is Empty</option>
                        <option value="not_empty">Is Not Empty</option>
                      </select>
                      <input
                        type="text"
                        value={cond.value}
                        onChange={(e) => {
                          const newConds = [...activeField.settingsJson.conditions];
                          newConds[cidx].value = e.target.value;
                          handleUpdateSettingsProp('conditions', newConds);
                        }}
                        placeholder="Expected Value"
                        className="px-2 py-1 border border-slate-300 rounded text-xs flex-1 min-w-[100px]"
                      />
                      <button
                        onClick={() => {
                          const newConds = activeField.settingsJson.conditions.filter((_: any, i: number) => i !== cidx);
                          handleUpdateSettingsProp('conditions', newConds);
                        }}
                        className="p-1 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const newConds = [...(activeField.settingsJson?.conditions || []), { fieldId: '', operator: 'equals', value: '' }];
                      handleUpdateSettingsProp('conditions', newConds);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                  >
                    <Plus className="h-3 w-3" /> Add Show/Hide Rule
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-16 text-center text-slate-400 font-medium h-full flex flex-col items-center justify-center">
              <Settings className="h-12 w-12 text-slate-200 mb-3" />
              Select a field from the side panel or click 'Add Field' to start editing constraints.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
