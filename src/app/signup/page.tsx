import { SignUpFlow } from '@/components/auth/SignUpFlow';

export const metadata = {
  title: 'Sign Up | Nostr for Nomads',
  description: 'Create your Nostr account and join the decentralized platform',
};

export default function SignUpPage() {
  return <SignUpFlow />;
}
