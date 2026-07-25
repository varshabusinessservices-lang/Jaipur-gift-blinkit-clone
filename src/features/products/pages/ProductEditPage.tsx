import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductFormWizard } from '../components/ProductFormWizard';
import { useProductDetail } from '../hooks/useProducts';
import { productApi } from '../services/productApi';
import { CreateProductInput } from '../types/product';

export function ProductEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { product, loading: detailLoading, error } = useProductDetail(id);
  const [submitting, setSubmitting] = useState(false);

  const handleEditSubmit = async (data: CreateProductInput) => {
    if (!id) return;
    setSubmitting(true);
    try {
      await productApi.updateProduct(id, data);
      alert('Product updated successfully!');
      navigate('/admin/products');
    } catch (err: any) {
      alert(err.message || 'Failed to update product');
    } finally {
      setSubmitting(false);
    }
  };

  if (detailLoading) {
    return <div className="p-12 text-center text-slate-500 text-sm">Loading product for editing...</div>;
  }

  if (error || !product) {
    return <div className="p-12 text-center text-red-600 text-sm">{error || 'Product not found'}</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <ProductFormWizard initialData={product} onSubmit={handleEditSubmit} loading={submitting} mode="edit" />
    </div>
  );
}
