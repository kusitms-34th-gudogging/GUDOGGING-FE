import { GoogleSignin } from '@react-native-google-signin/google-signin';

import { useCheckupDraft } from '@/hooks/useCheckupDraft';
import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { authToken } from '@/lib/authToken';

// Gmail 연동용 Google 서버 인증 코드 (명세: 웹 클라이언트 ID로 gmail.readonly·email 범위). 계정 선택·권한 동의를 취소하면 null
// 로그인과 다른 Google 계정을 골라도 됨 (명세)
export const requestGmailAuthCode = async (): Promise<string | null> => {
  GoogleSignin.configure({
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    offlineAccess: true,
    scopes: ['https://www.googleapis.com/auth/gmail.readonly'],
  });
  const res = await GoogleSignin.signIn();
  if (res.type === 'cancelled') return null;
  if (!res.data.serverAuthCode) throw new Error('Gmail 인증 코드가 비어 있음 → webClientId 확인');
  return res.data.serverAuthCode;
};

// 탈퇴·로그아웃 뒤 기기에 남은 계정 데이터(로그인 토큰·작성 중이던 등록·점검) 비우기 (서버 데이터 캐시는 QueryClient에서 따로)
export const clearAccountData = () => {
  useRegisterDraft.getState().reset();
  useCheckupDraft.getState().reset();
  return authToken.clear();
};
