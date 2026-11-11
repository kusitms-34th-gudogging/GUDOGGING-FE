import { useRouter } from 'expo-router';
import { useEffect } from 'react';

import { launch } from '@/lib/launch';
import { LoginScreen } from '@/screens/login/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();

  useEffect(() => {
    launch.loginShown = true;
  }, []);

  return (
    <LoginScreen
      onLoggedIn={(provider) => router.replace({ pathname: '/onboarding', params: { provider } })}
    />
  );
}
