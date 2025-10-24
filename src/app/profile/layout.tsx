import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Profile | Nostr Messenger',
  description: 'Manage your Nostr profile and settings.',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
