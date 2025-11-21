'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useAuthStore } from '@/stores/useAuthStore';
import { WorkForm } from '@/components/pages/WorkForm';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const workTypes = [
  {
    icon: '💻',
    title: 'Development',
    description: 'Software development, coding, and technical projects.',
    examples: ['Web dev', 'Mobile apps', 'Backend', 'Frontend'],
  },
  {
    icon: '🎨',
    title: 'Design',
    description: 'Creative design work and visual content creation.',
    examples: ['UI/UX', 'Graphics', 'Branding', 'Illustration'],
  },
  {
    icon: '✍️',
    title: 'Writing & Content',
    description: 'Content creation, copywriting, and documentation.',
    examples: ['Blog posts', 'Copy', 'Technical docs', 'Marketing'],
  },
  {
    icon: '📢',
    title: 'Marketing & Support',
    description: 'Marketing, community management, and customer support.',
    examples: ['Social media', 'SEO', 'Community', 'Support'],
  },
];

export default function WorkCreatePage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const _hasHydrated = useAuthStore((state) => state._hasHydrated);

  // Add detailed logging for debugging
  useEffect(() => {
    console.log('[MY-WORK/CREATE] Component mounted/updated:', {
      _hasHydrated,
      hasUser: !!user,
      userPubkey: user?.pubkey?.substring(0, 16) || 'none',
      timestamp: new Date().toISOString(),
    });
  }, [_hasHydrated, user]);

  useEffect(() => {
    // Only check auth after hydration is complete
    if (_hasHydrated && !user) {
      console.log('[MY-WORK/CREATE] Redirecting to signin - no user after hydration');
      router.push('/signin?returnUrl=' + encodeURIComponent('/my-work/create'));
    } else if (_hasHydrated && user) {
      console.log('[MY-WORK/CREATE] User authenticated after hydration:', {
        pubkey: user.pubkey.substring(0, 16),
        npub: user.npub.substring(0, 16),
      });
    }
  }, [_hasHydrated, user, router]);

  const handleWorkCreated = (workId: string) => {
    console.log('Work created:', workId);
    // Redirect handled by WorkForm
  };

  const handleCancel = () => {
    router.push('/my-work');
  };

  // Show loading state while hydrating
  if (!_hasHydrated) {
    console.log('[MY-WORK/CREATE] Waiting for hydration...');
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
    console.log('[MY-WORK/CREATE] No user after hydration, returning null (redirect pending)');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Intro Section */}
      <section className="section-padding bg-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl lg:text-5xl font-serif font-bold text-purple-800 mb-4">
            What Work Do You Offer?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Share your skills and services with the nomad community. Whether you&apos;re a developer, designer, 
            writer, or marketer, connect with clients looking for your expertise.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {workTypes.map((type, index) => (
            <motion.div
              key={type.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gradient-to-br from-purple-50 to-orange-50 border border-purple-100 hover:border-orange-300 rounded-xl p-6 transition-all duration-300"
            >
              <div className="text-4xl mb-4">{type.icon}</div>
              <h3 className="text-xl font-serif font-bold text-purple-800 mb-2">
                {type.title}
              </h3>
              <p className="text-gray-600 mb-4">
                {type.description}
              </p>
              <ul className="space-y-2">
                {type.examples.map((example) => (
                  <li key={example} className="flex items-start text-sm text-gray-600">
                    <CheckCircle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Work Form */}
      <div className="container-width py-8">
        <WorkForm
          onWorkCreated={handleWorkCreated}
          onCancel={handleCancel}
          isEditMode={false}
        />
      </div>
    </div>
  );
}
