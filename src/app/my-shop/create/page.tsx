'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { ProductForm } from '@/components/pages/ProductForm';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const productTypes = [
  {
    icon: '🎨',
    title: 'Art & Collectibles',
    description: 'Share unique art pieces, handcrafted items, and collectibles.',
    examples: ['Digital art', 'Prints', 'Handmade crafts', 'NFTs'],
  },
  {
    icon: '⚙️',
    title: 'Services',
    description: 'Offer professional services and expertise to the community.',
    examples: ['Consulting', 'Design work', 'Development', 'Coaching'],
  },
  {
    icon: '💻',
    title: 'Hardware & Tech',
    description: 'List tech gadgets, electronics, and hardware products.',
    examples: ['Laptops', 'Accessories', 'Cameras', 'Audio gear'],
  },
  {
    icon: '📱',
    title: 'Digital Products',
    description: 'Sell software, apps, courses, and digital resources.',
    examples: ['E-books', 'Templates', 'Courses', 'Software'],
  },
];

export default function CreateProductPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  // Add detailed logging for debugging
  useEffect(() => {
    console.log('[MY-SHOP/CREATE] Component mounted/updated:', {
      _hasHydrated,
      hasUser: !!user,
      userPubkey: user?.pubkey?.substring(0, 16) || 'none',
      timestamp: new Date().toISOString(),
    });
  }, [_hasHydrated, user]);

  useEffect(() => {
    // Only check auth after hydration is complete
    if (_hasHydrated && !user) {
      console.log('[MY-SHOP/CREATE] Redirecting to signin - no user after hydration');
      router.push('/signin?returnUrl=' + encodeURIComponent('/my-shop/create'));
    } else if (_hasHydrated && user) {
      console.log('[MY-SHOP/CREATE] User authenticated after hydration:', {
        pubkey: user.pubkey.substring(0, 16),
        npub: user.npub.substring(0, 16),
      });
    }
  }, [_hasHydrated, user, router]);

  const handleProductCreated = (productId: string) => {
    console.log('Product created:', productId);
    // Redirect handled by ProductForm
  };

  const handleCancel = () => {
    router.push('/my-shop');
  };

  // Show loading state while hydrating
  if (!_hasHydrated) {
    console.log('[MY-SHOP/CREATE] Waiting for hydration...');
    return (
      <div className="min-h-screen bg-primary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // After hydration, if no user, return null (redirect will happen via useEffect)
  if (!user) {
    console.log('[MY-SHOP/CREATE] No user after hydration, returning null (redirect pending)');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Product Types Section */}
      <section className="section-padding bg-white">
        <div className="container-width">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-purple-800 mb-4">
              What Would You Like to List?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Share products or services with the nomad community. From physical items to digital goods and professional services.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {productTypes.map((type, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-gradient-to-br from-purple-50 to-orange-50 rounded-xl p-6 border-2 border-purple-100 hover:border-orange-300 transition-all duration-300"
              >
                <span className="text-4xl mb-4 block">{type.icon}</span>
                <h3 className="font-serif font-bold text-lg mb-2 text-purple-800">{type.title}</h3>
                <p className="text-sm mb-3 leading-relaxed text-gray-600">
                  {type.description}
                </p>
                <ul className="text-xs space-y-1 text-gray-500">
                  {type.examples.map((ex) => (
                    <li key={ex} className="flex items-center">
                      <CheckCircle className="w-3 h-3 mr-2 text-orange-500" /> {ex}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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
