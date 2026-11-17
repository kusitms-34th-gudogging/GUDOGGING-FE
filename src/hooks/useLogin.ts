import { useMutation } from '@tanstack/react-query';

import { authToken, type AuthTokens } from '@/lib/authToken';
import { request } from '@/lib/request';
import type { LoginProvider } from '@/types/auth';

// 소셜 로그인 (L-01·L-02). 처음이면 서버가 가입시키고 isNewUser로 알려 줌 → 소개·온보딩부터
// shortcut: Apple·Google SDK가 아직 없어 임시 idToken, SDK 붙이면 받은 idToken으로 교체
export const useLogin = () =>
  useMutation({
    mutationFn: async (provider: LoginProvider) => {
      const { isNewUser, ...tokens } = await request<AuthTokens & { isNewUser: boolean }>(
        `/api/v1/auth/${provider}`,
        { method: 'POST', body: { idToken: `pending-${provider}-sdk` } },
      );
      await authToken.save(tokens);
      return isNewUser;
    },
  });
