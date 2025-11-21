'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { ProductForm } from '@/components/pages/ProductForm';
import { Store } from 'lucide-react';

export default function CreateProductPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user) {
      router.push('/signin?returnUrl=' + encodeURIComponent('/my-shop/create'));
    }
  }, [user, router]);

  const handleProductCreated = (productId: string) => {
    console.log('Product created:', productId);
    // Redirect handled by ProductForm
  };

  const handleCancel = () => {
    router.push('/my-shop');
  };

  if (!user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-width py-8">
          <div className="flex items-center gap-3">
            <Store className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary-900">List a Product</h1>
              <p className="text-gray-600 text-lg mt-1">
                Share products or services with the nomad community
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container-width py-8">
        <ProductForm
          onProductCreated={handleProductCreated}
          onCancel={handleCancel}
          isEditMode={false}
        />
      </div>
    </div>
  );
}
