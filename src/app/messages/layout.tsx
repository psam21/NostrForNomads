import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Messages | Nostr Messenger',
  description: 'Secure, encrypted messaging on Nostr.',
};

export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
