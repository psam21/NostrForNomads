'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SignInFlow } from '@/components/auth/SignInFlow';

function SigninContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  const handleSuccess = () => {
    router.push(returnUrl);
  };

  const handleCancel = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen hero-section">
      <div className="max-w-lg w-full mx-4">
        <SignInFlow 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen hero-section">
        <div className="max-w-lg w-full mx-4 flex items-center justify-center">
          <div className="animate-pulse text-white">Loading...</div>
        </div>
      </div>
    }>
      <SigninContent />
    </Suspense>
  );
}
