import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata = {
  title: 'Home | Nostr for Nomads',
  description: 'Welcome to Nostr for Nomads - Your decentralized platform for nomadic lifestyle',
};

export default function HomePage() {
  redirect('/messages');
}
