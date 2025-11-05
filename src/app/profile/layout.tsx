import type { Metadata } from 'next';

export const metadata = {
  title: 'Profile | Nostr for Nomads',
  description: 'Manage your Nostr profile',
};

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
