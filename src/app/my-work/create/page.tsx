'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/useAuthStore';
import { WorkForm } from '@/components/pages/WorkForm';
import { Briefcase } from 'lucide-react';

export default function WorkCreatePage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const handleWorkCreated = (workId: string) => {
    console.log('Work created:', workId);
    // Redirect handled by WorkForm
  };

  const handleCancel = () => {
    router.push('/my-work');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-primary-50">
        <div className="container-width py-16">
          <div className="text-center">
            <h2 className="text-2xl font-serif font-bold text-primary-800 mb-4">Sign In Required</h2>
            <p className="text-gray-600 mb-6">
              You need to sign in to post work opportunities.
            </p>
            <Link href="/signin" className="btn-primary-sm">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container-width py-8">
          <div className="flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-primary-600" />
            <div>
              <h1 className="text-3xl font-serif font-bold text-primary-900">Post a Work Opportunity</h1>
              <p className="text-gray-600 text-lg mt-1">
                Share job openings with the digital nomad community
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
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
