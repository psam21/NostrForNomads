import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Home | Nostr Messenger',
  description: 'A decentralized messaging platform built on Nostr for secure, private communication.',
};

export default function HomePage() {
  redirect('/messages');
}
