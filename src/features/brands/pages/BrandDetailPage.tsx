import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useBrand, useDeleteBrand } from '../hooks/useBrands';
import { ArrowLeft, Edit3, Trash2, Globe, Tag, Image, Clock, CheckCircle2, Star, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';

export function BrandDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: brand, isLoading, isError, error } = useBrand(id || '');
  const deleteMutation = useDeleteBrand();

  const handleDelete = async () => {
    if (!brand) return;
    if (window.confirm(`Are you sure you want to soft delete brand "${brand.name}"?`)) {
      await deleteMutation.mutateAsync(brand.id);
      navigate('/admin/brands');
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
        <RefreshCw className="h-6 w-6 animate-spin text-indigo-600" />
        <span>Loading brand profile...</span>
      </div>
    );
  }

  if (isError || !brand) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center space-y-4">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Brand Not Found</h2>
        <p className="text-sm text-slate-500">{(error as any)?.message || 'The requested brand details could not be loaded.'}</p>
        <Link
          to="/admin/brands"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/brands"
            className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-0.5">
              <span>Brands</span>
              <span>/</span>
              <span className="text-slate-500">{brand.code || brand.slug}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
              {brand.name}
              {brand.isFeatured && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Star className="h-3 w-3 fill-amber-400" /> Featured
                </span>
              )}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to={`/admin/brands/${brand.id}/edit`}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Edit3 className="h-4 w-4" />
            Edit Brand
          </Link>
          <button
            onClick={handleDelete}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 flex flex-col items-center text-center p-4 bg-slate-50 rounded-xl border border-slate-100">
          {brand.logoUrl ? (
            <img
              src={brand.logoUrl}
              alt={brand.logoAltText || brand.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-white shadow-md mb-3"
            />
          ) : (
            <div className="w-24 h-24 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-3xl flex items-center justify-center border-2 border-white shadow-md mb-3">
              {brand.name.charAt(0).toUpperCase()}
            </div>
          )}
          <h2 className="text-lg font-bold text-slate-900">{brand.name}</h2>
          <p className="text-xs font-mono text-slate-500 mt-0.5">{brand.code || 'NO-CODE'}</p>

          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              brand.status === 'ACTIVE'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-slate-100 text-slate-600 border border-slate-200'
            }`}>
              {brand.status}
            </span>
            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              Order: #{brand.sortOrder}
            </span>
          </div>

          {brand.websiteUrl && (
            <a
              href={brand.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:underline"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Visit Brand Website
            </a>
          )}
        </div>

        <div className="md:col-span-2 space-y-4">
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Short Description</h3>
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100">
              {brand.shortDescription || 'No short description provided.'}
            </p>
          </div>

          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Description</h3>
            <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-lg border border-slate-100 whitespace-pre-line">
              {brand.description || 'No detailed description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block">Created At</span>
              <span className="font-semibold text-slate-700">{new Date(brand.createdAt).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block">Last Updated</span>
              <span className="font-semibold text-slate-700">{new Date(brand.updatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SEO & File Assets */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Globe className="h-4 w-4 text-indigo-600" />
            SEO Configurations
          </h3>

          <div className="space-y-2 text-xs text-slate-600">
            <div>
              <span className="font-semibold text-slate-800 block">Meta Title:</span>
              <span>{brand.seoTitle || 'Default Title'}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-800 block">Meta Description:</span>
              <span>{brand.seoDescription || 'Default Description'}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-800 block">Keywords JSON:</span>
              <code className="text-indigo-600 font-mono block bg-slate-50 p-2 rounded mt-1">
                {brand.seoKeywordsJson || '[]'}
              </code>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-2">
            <Image className="h-4 w-4 text-indigo-600" />
            File Asset References
          </h3>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-100">
              <span className="text-slate-500">Logo File ID:</span>
              <span className="font-mono text-indigo-600 font-semibold">{brand.logoFileId || 'None'} {brand.logoAltText && `(${brand.logoAltText})`}</span>
            </div>
            <div className="flex justify-between p-2 bg-slate-50 rounded border border-slate-100">
              <span className="text-slate-500">SEO Image File ID:</span>
              <span className="font-mono text-indigo-600 font-semibold">{brand.seoImageFileId || 'None'} {brand.seoImageAltText && `(${brand.seoImageAltText})`}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
