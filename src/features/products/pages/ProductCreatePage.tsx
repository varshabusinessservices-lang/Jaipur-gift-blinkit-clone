import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductFormWizard } from '../components/ProductFormWizard';
import { productApi } from '../services/productApi';
import { CreateProductInput } from '../types/product';

export function ProductCreatePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleCreateSubmit = async (data: CreateProductInput) => {
    setLoading(true);
    try {
      const created = await productApi.createProduct(data);
      alert(`Product created successfully (${created.title})`);
      navigate('/admin/products');
    } catch (err: any) {
      alert(err.message || 'Failed to create product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      <ProductFormWizard onSubmit={handleCreateSubmit} loading={loading} mode="create" />
    </div>
  );
}
