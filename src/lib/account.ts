import { useCheckupDraft } from '@/hooks/useCheckupDraft';
import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { authToken } from '@/lib/authToken';

// Gmail 연동용 Google 인증 코드. 사용자가 계정 선택·권한 동의를 취소하면 null
// shortcut: Google OAuth 미연동이라 항상 코드를 받은 것처럼, OAuth 붙이면 실제 코드로 교체 (실패하면 throw)
export const requestGmailAuthCode = async (): Promise<string | null> => 'mock-auth-code';

// 탈퇴·로그아웃 뒤 기기에 남은 계정 데이터(로그인 토큰·작성 중이던 등록·점검) 비우기 (서버 데이터 캐시는 QueryClient에서 따로)
export const clearAccountData = () => {
  useRegisterDraft.getState().reset();
  useCheckupDraft.getState().reset();
  return authToken.clear();
};
