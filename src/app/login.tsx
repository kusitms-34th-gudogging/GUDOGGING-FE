import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useLogin } from '@/hooks/useLogin';
import { launch } from '@/lib/launch';
import { LoginScreen } from '@/screens/login/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();
  const login = useLogin();
  // 화면이 사라진 뒤 갈 곳을 정하려고 로그인 응답(isNewUser)을 기억
  const isNewUser = useRef(false);

  useEffect(() => {
    launch.loginShown = true;
  }, []);

  return (
    <LoginScreen
      onLogin={async (provider) => {
        isNewUser.current = await login.mutateAsync(provider);
      }}
      // 처음 가입이면 소개·온보딩, 이미 가입했으면 홈 (명세 isNewUser)
      onLoggedIn={(provider) =>
        isNewUser.current
          ? router.replace({ pathname: '/onboarding', params: { provider } })
          : router.replace('/')
      }
    />
  );
}
