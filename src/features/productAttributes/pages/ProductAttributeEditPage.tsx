import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  AlertCircle,
} from 'lucide-react';
import {
  useProductAttribute,
  useUpdateAttribute,
  useCreateAttributeValue,
} from '../hooks/useProductAttributes';
import { ProductAttributeType, ProductAttributeStatus, CreateAttributeValueInput } from '../types/productAttribute';
import { useCategories } from '../../categories/hooks/useCategories';

export const ProductAttributeEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: attr, isLoading, isError } = useProductAttribute(id || '');
  const updateMutation = useUpdateAttribute();
  const createValueMutation = useCreateAttributeValue();
  const { flatCategoriesList } = useCategories();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProductAttributeType>('TEXT');
  const [status, setStatus] = useState<ProductAttributeStatus>('ACTIVE');

  const [isVariationAttribute, setIsVariationAttribute] = useState(true);
  const [isFilterable, setIsFilterable] = useState(true);
  const [isRequiredByDefault, setIsRequiredByDefault] = useState(false);
  const [showOnProductPage, setShowOnProductPage] = useState(true);
  const [showInProductSummary, setShowInProductSummary] = useState(true);
  const [allowMultipleValues, setAllowMultipleValues] = useState(false);

  const [values, setValues] = useState<CreateAttributeValueInput[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (attr) {
      setName(attr.name);
      setSlug(attr.slug);
      setCode(attr.code || '');
      setDescription(attr.description || '');
      setType(attr.type);
      setStatus(attr.status);
      setIsVariationAttribute(attr.isVariationAttribute);
      setIsFilterable(attr.isFilterable);
      setIsRequiredByDefault(attr.isRequiredByDefault);
      setShowOnProductPage(attr.showOnProductPage);
      setShowInProductSummary(attr.showInProductSummary);
      setAllowMultipleValues(attr.allowMultipleValues);
      setValues(
        attr.values.map((v) => ({
          id: v.id,
          name: v.name,
          slug: v.slug,
          code: v.code || '',
          displayValue: v.displayValue || '',
          colourHex: v.colourHex || '#000000',
          imageFileId: v.imageFileId || '',
          status: v.status,
          sortOrder: v.sortOrder,
        }))
      );
      setSelectedCategoryIds(attr.categoryAssignments.map((ca) => ca.categoryId));
    }
  }, [attr]);

  const handleAddValueRow = () => {
    setValues((prev) => [
      ...prev,
      {
        name: '',
        slug: '',
        displayValue: '',
        colourHex: '#000000',
        imageFileId: '',
        status: 'ACTIVE',
        sortOrder: prev.length + 1,
      },
    ]);
  };

  const handleValueChange = (index: number, field: keyof CreateAttributeValueInput, val: any) => {
    setValues((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);

    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          name,
          slug,
          code: code || undefined,
          description,
          type,
          status,
          isVariationAttribute,
          isFilterable,
          isRequiredByDefault,
          showOnProductPage,
          showInProductSummary,
          allowMultipleValues,
          categoryAssignments: selectedCategoryIds.map((catId, idx) => ({
            categoryId: catId,
            isRequired: isRequiredByDefault,
            sortOrder: idx + 1,
          })),
        },
      });

      navigate('/admin/product-attributes');
    } catch (err: any) {
      setError(err.message || 'Failed to update attribute');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-stone-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-amber-500 border-t-transparent"></div>
        <p className="mt-2 text-sm font-medium">Loading attribute details...</p>
      </div>
    );
  }

  if (isError || !attr) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-xl m-6">
        <p className="font-semibold">Failed to load attribute details.</p>
        <Link to="/admin/product-attributes" className="mt-2 inline-block text-sm text-amber-700 underline font-medium">
          Return to Attributes List
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/admin/product-attributes"
          className="p-2 text-stone-500 hover:text-stone-900 rounded-lg bg-white border border-stone-200 hover:bg-stone-50 transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Edit Attribute: {attr.name}</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Modify attribute configuration, display type, and values.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-stone-900 border-b border-stone-100 pb-3">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                Attribute Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">Display Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProductAttributeType)}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="TEXT">TEXT</option>
                <option value="COLOUR_SWATCH">COLOUR_SWATCH</option>
                <option value="IMAGE_SWATCH">IMAGE_SWATCH</option>
                <option value="BUTTON">BUTTON</option>
                <option value="DROPDOWN">DROPDOWN</option>
                <option value="RADIO">RADIO</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase font-mono"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-stone-900 border-b border-stone-100 pb-3">Attribute Values ({values.length})</h2>

          <div className="space-y-2">
            {values.map((v, idx) => (
              <div key={v.id || idx} className="flex items-center gap-2 p-2 bg-stone-50 rounded border border-stone-200 text-xs">
                <span className="font-mono text-stone-400 w-6">{idx + 1}.</span>
                <input
                  type="text"
                  value={v.name}
                  onChange={(e) => handleValueChange(idx, 'name', e.target.value)}
                  placeholder="Value Name"
                  className="flex-1 px-2 py-1 border border-stone-300 rounded"
                />
                <input
                  type="text"
                  value={v.displayValue || ''}
                  onChange={(e) => handleValueChange(idx, 'displayValue', e.target.value)}
                  placeholder="Display Label"
                  className="w-32 px-2 py-1 border border-stone-300 rounded"
                />
                {type === 'COLOUR_SWATCH' && (
                  <input
                    type="color"
                    value={v.colourHex || '#000000'}
                    onChange={(e) => handleValueChange(idx, 'colourHex', e.target.value)}
                    className="w-6 h-6 rounded border cursor-pointer p-0"
                  />
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddValueRow}
              className="mt-2 inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-50 rounded border border-amber-200"
            >
              <Plus className="w-3.5 h-3.5" /> Add New Value Row
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            to="/admin/product-attributes"
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition"
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};
