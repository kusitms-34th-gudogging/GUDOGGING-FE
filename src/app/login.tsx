import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';

import { LoginCanceledError, useLogin } from '@/hooks/useLogin';
import { useToast } from '@/hooks/useToast';
import { launch } from '@/lib/launch';
import { LoginScreen } from '@/screens/login/LoginScreen';

export default function LoginRoute() {
  const router = useRouter();
  const login = useLogin();
  const { show } = useToast();
  // 화면이 사라진 뒤 갈 곳을 정하려고 로그인 응답(isNewUser)을 기억
  const isNewUser = useRef(false);

  useEffect(() => {
    launch.loginShown = true;
  }, []);

  return (
    <LoginScreen
      onLogin={async (provider) => {
        try {
          isNewUser.current = await login.mutateAsync(provider);
        } catch (error) {
          // 취소는 조용히 L-01로, 그 외 실패는 안내 후 다시 시도할 수 있게 L-01로
          if (!(error instanceof LoginCanceledError)) {
            show({ type: 'error', message: '로그인하지 못했어요. 다시 시도해 주세요.' });
          }
          throw error;
        }
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
