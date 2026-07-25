import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Save,
  Palette,
  Image as ImageIcon,
  Tag,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useCreateAttribute } from '../hooks/useProductAttributes';
import { ProductAttributeType, ProductAttributeStatus, CreateAttributeValueInput } from '../types/productAttribute';
import { useCategories } from '../../categories/hooks/useCategories';

export const ProductAttributeCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const createMutation = useCreateAttribute();
  const { flatCategoriesList } = useCategories();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<ProductAttributeType>('TEXT');
  const [status, setStatus] = useState<ProductAttributeStatus>('ACTIVE');

  // Behaviour Settings
  const [isVariationAttribute, setIsVariationAttribute] = useState(true);
  const [isFilterable, setIsFilterable] = useState(true);
  const [isRequiredByDefault, setIsRequiredByDefault] = useState(false);
  const [showOnProductPage, setShowOnProductPage] = useState(true);
  const [showInProductSummary, setShowInProductSummary] = useState(true);
  const [allowMultipleValues, setAllowMultipleValues] = useState(false);
  const [sortOrder, setSortOrder] = useState(0);

  // Initial Attribute Values List
  const [values, setValues] = useState<CreateAttributeValueInput[]>([
    { name: '', slug: '', displayValue: '', colourHex: '#000000', imageFileId: '', status: 'ACTIVE', sortOrder: 1 },
  ]);

  // Selected Category IDs
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [error, setError] = useState<string | null>(null);

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

  const handleDuplicateValueRow = (index: number) => {
    const target = values[index];
    const duplicated: CreateAttributeValueInput = {
      ...target,
      name: `${target.name} (Copy)`,
      slug: target.slug ? `${target.slug}-copy` : '',
      sortOrder: values.length + 1,
    };
    setValues((prev) => [...prev, duplicated]);
  };

  const handleRemoveValueRow = (index: number) => {
    if (values.length === 1) {
      alert('Attribute must have at least one value');
      return;
    }
    setValues((prev) => prev.filter((_, i) => i !== index));
  };

  const handleValueChange = (index: number, field: keyof CreateAttributeValueInput, value: any) => {
    setValues((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleToggleCategory = (catId: string) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(catId) ? prev.filter((id) => id !== catId) : [...prev, catId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Attribute name is required');
      return;
    }

    // Validate type requirements
    for (let i = 0; i < values.length; i++) {
      const v = values[i];
      if (!v.name.trim()) {
        setError(`Value row ${i + 1} requires a name`);
        return;
      }
      if (type === 'COLOUR_SWATCH' && (!v.colourHex || !/^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/.test(v.colourHex))) {
        setError(`Value row ${i + 1} ("${v.name}") requires a valid hex colour code (e.g. #000000)`);
        return;
      }
      if (type === 'IMAGE_SWATCH' && !v.imageFileId?.trim()) {
        setError(`Value row ${i + 1} ("${v.name}") requires an image file asset ID`);
        return;
      }
    }

    try {
      await createMutation.mutateAsync({
        name,
        slug: slug.trim() || undefined,
        code: code.trim() || undefined,
        description: description.trim() || undefined,
        type,
        status,
        isVariationAttribute,
        isFilterable,
        isRequiredByDefault,
        showOnProductPage,
        showInProductSummary,
        allowMultipleValues,
        sortOrder,
        values,
        categoryAssignments: selectedCategoryIds.map((catId, idx) => ({
          categoryId: catId,
          isRequired: isRequiredByDefault,
          sortOrder: idx + 1,
        })),
      });

      navigate('/admin/product-attributes');
    } catch (err: any) {
      setError(err.message || 'Failed to create product attribute');
    }
  };

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
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">Create Product Attribute</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Define global product specifications, swatches, and variation drivers.
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
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-stone-900 border-b border-stone-100 pb-3">
            1. Basic Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                Attribute Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Frame Size, Colour, Material"
                required
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">
                Display Type <span className="text-red-500">*</span>
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ProductAttributeType)}
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="TEXT">TEXT (Standard text list)</option>
                <option value="COLOUR_SWATCH">COLOUR_SWATCH (Hex colour picker)</option>
                <option value="IMAGE_SWATCH">IMAGE_SWATCH (Texture/pattern image sample)</option>
                <option value="BUTTON">BUTTON (Pill button selector)</option>
                <option value="DROPDOWN">DROPDOWN (Select menu)</option>
                <option value="RADIO">RADIO (Radio buttons list)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">Slug (URL Key)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="Auto-generated if left blank"
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">Code / Reference</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. ATTR-SIZE-01"
                className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-stone-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Internal notes or customer tooltip explanation..."
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Section 2: Display & Behaviour Controls */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-stone-900 border-b border-stone-100 pb-3">
            2. Behaviour & Visibility Rules
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <label className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-100 transition">
              <input
                type="checkbox"
                checked={isVariationAttribute}
                onChange={(e) => setIsVariationAttribute(e.target.checked)}
                className="mt-1 rounded text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-semibold text-stone-900">Use for Product Variations</span>
                <p className="text-xs text-stone-500">Drives combination matrix for variable products</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-100 transition">
              <input
                type="checkbox"
                checked={isFilterable}
                onChange={(e) => setIsFilterable(e.target.checked)}
                className="mt-1 rounded text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-semibold text-stone-900">Use in Storefront Filters</span>
                <p className="text-xs text-stone-500">Allows customers to filter products in storefront</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-100 transition">
              <input
                type="checkbox"
                checked={isRequiredByDefault}
                onChange={(e) => setIsRequiredByDefault(e.target.checked)}
                className="mt-1 rounded text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-semibold text-stone-900">Required Selection</span>
                <p className="text-xs text-stone-500">Customer must pick a value before adding to cart</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-100 transition">
              <input
                type="checkbox"
                checked={showOnProductPage}
                onChange={(e) => setShowOnProductPage(e.target.checked)}
                className="mt-1 rounded text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-semibold text-stone-900">Show on Product Page</span>
                <p className="text-xs text-stone-500">Display specification on PDP detail tabs</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-100 transition">
              <input
                type="checkbox"
                checked={showInProductSummary}
                onChange={(e) => setShowInProductSummary(e.target.checked)}
                className="mt-1 rounded text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-semibold text-stone-900">Show in Product Summary</span>
                <p className="text-xs text-stone-500">Include key attribute tag on catalog cards</p>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 bg-stone-50 rounded-lg border border-stone-200 cursor-pointer hover:bg-stone-100 transition">
              <input
                type="checkbox"
                checked={allowMultipleValues}
                onChange={(e) => setAllowMultipleValues(e.target.checked)}
                className="mt-1 rounded text-amber-600 focus:ring-amber-500"
              />
              <div>
                <span className="text-sm font-semibold text-stone-900">Allow Multiple Values</span>
                <p className="text-xs text-stone-500">Allow selecting multiple values simultaneously</p>
              </div>
            </label>
          </div>
        </div>

        {/* Section 3: Attribute Values Management Table */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h2 className="text-lg font-semibold text-stone-900">3. Attribute Values</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Add value options (e.g., A4, Black, MDF). Values are created together in a single transaction.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAddValueRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Value
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-medium text-xs uppercase tracking-wider">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Value Name *</th>
                  <th className="py-2.5 px-3">Display Label</th>
                  {type === 'COLOUR_SWATCH' && <th className="py-2.5 px-3">Colour Swatch *</th>}
                  {type === 'IMAGE_SWATCH' && <th className="py-2.5 px-3">Image File ID *</th>}
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {values.map((v, idx) => (
                  <tr key={idx} className="hover:bg-stone-50/50">
                    <td className="py-2.5 px-3 text-xs text-stone-400 font-mono">{idx + 1}</td>

                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={v.name}
                        onChange={(e) => handleValueChange(idx, 'name', e.target.value)}
                        placeholder="e.g. Classic Black"
                        required
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </td>

                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={v.displayValue || ''}
                        onChange={(e) => handleValueChange(idx, 'displayValue', e.target.value)}
                        placeholder={v.name || 'Short label'}
                        className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
                      />
                    </td>

                    {type === 'COLOUR_SWATCH' && (
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={v.colourHex || '#000000'}
                            onChange={(e) => handleValueChange(idx, 'colourHex', e.target.value.toUpperCase())}
                            className="w-7 h-7 rounded border border-stone-300 cursor-pointer p-0.5"
                          />
                          <input
                            type="text"
                            value={v.colourHex || '#000000'}
                            onChange={(e) => handleValueChange(idx, 'colourHex', e.target.value)}
                            placeholder="#000000"
                            className="w-24 px-2 py-1 text-xs border border-stone-300 rounded uppercase font-mono focus:ring-1 focus:ring-amber-500"
                          />
                        </div>
                      </td>
                    )}

                    {type === 'IMAGE_SWATCH' && (
                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          value={v.imageFileId || ''}
                          onChange={(e) => handleValueChange(idx, 'imageFileId', e.target.value)}
                          placeholder="FileAsset ID"
                          className="w-full px-2.5 py-1.5 text-xs border border-stone-300 rounded font-mono focus:ring-1 focus:ring-amber-500"
                        />
                      </td>
                    )}

                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={v.code || ''}
                        onChange={(e) => handleValueChange(idx, 'code', e.target.value)}
                        placeholder="e.g. VAL-BLK"
                        className="w-28 px-2 py-1 text-xs border border-stone-300 rounded font-mono uppercase focus:ring-1 focus:ring-amber-500"
                      />
                    </td>

                    <td className="py-2.5 px-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleDuplicateValueRow(idx)}
                          className="p-1 text-stone-500 hover:text-stone-800 rounded hover:bg-stone-200"
                          title="Duplicate Row"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveValueRow(idx)}
                          className="p-1 text-stone-500 hover:text-red-600 rounded hover:bg-stone-200"
                          title="Remove Row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: Category Assignment */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-stone-900 border-b border-stone-100 pb-3">
            4. Category Assignment
          </h2>

          <p className="text-xs text-stone-500">
            Assign this attribute to specific categories (e.g. Photo Frames). Subcategories inherit attributes automatically.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto p-3 bg-stone-50 rounded-lg border border-stone-200">
            {flatCategoriesList && flatCategoriesList.length > 0 ? (
              flatCategoriesList.map((cat) => (
                <label
                  key={cat.id}
                  className="flex items-center gap-2 text-xs p-2 rounded bg-white border border-stone-200 hover:bg-amber-50/50 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(cat.id)}
                    onChange={() => handleToggleCategory(cat.id)}
                    className="rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-medium text-stone-800">{cat.name}</span>
                </label>
              ))
            ) : (
              <p className="text-xs text-stone-400 italic p-2 col-span-full">No active categories found.</p>
            )}
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link
            to="/admin/product-attributes"
            className="px-4 py-2 text-sm font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="inline-flex items-center gap-2 px-6 py-2 text-sm font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 shadow-sm transition disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {createMutation.isPending ? 'Saving Attribute...' : 'Save Product Attribute'}
          </button>
        </div>
      </form>
    </div>
  );
};
