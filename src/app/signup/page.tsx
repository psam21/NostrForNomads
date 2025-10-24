import type { Metadata } from 'next';
import { SignUpFlow } from '@/components/auth/SignUpFlow';

export const metadata: Metadata = {
  title: 'Sign Up | Nostr Messenger',
  description: 'Create your Nostr identity and start secure, private messaging on the decentralized web.',
};

export default function SignUpPage() {
  return <SignUpFlow />;
}
