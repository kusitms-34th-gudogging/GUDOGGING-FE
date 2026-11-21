import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useMutation } from '@tanstack/react-query';

import { authToken, type AuthTokens } from '@/lib/authToken';
import { request } from '@/lib/request';
import type { LoginProvider } from '@/types/auth';

// 사용자가 SDK 로그인 창을 닫음 → 오류 안내 없이 L-01로
export class LoginCanceledError extends Error {}

// Google 로그인 창을 띄워 받은 idToken으로 요청 바디를 만듦
// webClientId: 서버가 검증하는 idToken 대상(aud). 서버 GOOGLE_CLIENT_IDS에 등록된 Web 클라이언트 ID
const googleBody = async () => {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
  const res = await GoogleSignin.signIn();
  if (res.type === 'cancelled') throw new LoginCanceledError();
  if (!res.data.idToken) throw new Error('Google idToken이 비어 있음 → webClientId 확인');
  return { idToken: res.data.idToken };
};

// shortcut: Apple SDK는 아직 없어 임시 토큰, SDK 붙이면 받은 값으로 교체 (첫 인증 때 받은 name도)
const bodyOf = {
  apple: async () => ({
    identityToken: 'pending-apple-sdk',
    authorizationCode: 'pending-apple-sdk',
  }),
  google: googleBody,
};

// 소셜 로그인 (L-01·L-02). 처음이면 서버가 가입시키고 isNewUser로 알려 줌 → 소개·온보딩부터
export const useLogin = () =>
  useMutation({
    mutationFn: async (provider: LoginProvider) => {
      const { isNewUser, ...tokens } = await request<AuthTokens & { isNewUser: boolean }>(
        `/api/v1/auth/${provider}`,
        { method: 'POST', body: await bodyOf[provider]() },
      );
      await authToken.save(tokens);
      return isNewUser;
    },
  });
