import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { useMutation } from '@tanstack/react-query';
import * as AppleAuthentication from 'expo-apple-authentication';

import { authToken, type AuthTokens } from '@/lib/authToken';
import { request } from '@/lib/request';
import type { LoginProvider } from '@/types/auth';

// 사용자가 SDK 로그인 창을 닫음 → 오류 안내 없이 L-01로
export class LoginCanceledError extends Error {}

// 네이티브 로그인 창은 Maestro로 못 누름 → E2E 빌드는 목서버가 받는 임시 토큰으로 (e2e-test.md)
const isE2E = process.env.EXPO_PUBLIC_E2E === '1';

// Sign in with Apple 창을 띄워 받은 값으로 요청 바디를 만듦
// name은 Apple이 첫 인가 때만 줌 → 있을 때만 보냄 (서버도 가입 때만 저장)
const appleBody = async () => {
  if (isE2E) return { identityToken: 'e2e', authorizationCode: 'e2e' };
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  }).catch((error: unknown) => {
    if ((error as { code?: unknown } | null)?.code === 'ERR_REQUEST_CANCELED') {
      throw new LoginCanceledError();
    }
    throw error;
  });
  const { identityToken, authorizationCode, fullName } = credential;
  if (!identityToken || !authorizationCode) throw new Error('Apple 인증 값이 비어 있음');
  const name = fullName ? AppleAuthentication.formatFullName(fullName) : '';
  return { identityToken, authorizationCode, ...(name && { name }) };
};

// Google 로그인 창을 띄워 받은 idToken으로 요청 바디를 만듦
// webClientId: 서버가 검증하는 idToken 대상(aud). 서버 GOOGLE_CLIENT_IDS에 등록된 Web 클라이언트 ID
const googleBody = async () => {
  if (isE2E) return { idToken: 'e2e' };
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  });
  const res = await GoogleSignin.signIn();
  if (res.type === 'cancelled') throw new LoginCanceledError();
  if (!res.data.idToken) throw new Error('Google idToken이 비어 있음 → webClientId 확인');
  return { idToken: res.data.idToken };
};

const bodyOf = { apple: appleBody, google: googleBody };

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
