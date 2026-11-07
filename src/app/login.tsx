import { useRouter } from 'expo-router';

import { LoginScreen } from '@/screens/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();

  return <LoginScreen onLoggedIn={() => router.replace('/onboarding')} />;
}
