import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In | Nostr Messenger',
  description: 'Sign in to your Nostr account for secure, private messaging.',
};

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
