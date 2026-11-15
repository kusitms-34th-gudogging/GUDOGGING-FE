import { useCheckupDraft } from '@/hooks/useCheckupDraft';
import { useGmailLink } from '@/hooks/useGmailLink';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useRegisterDraft } from '@/hooks/useRegisterDraft';

// 마이페이지 계정 요청. 화면과 실패 화면의 다시 시도하기가 같은 요청을 씀
// shortcut: Gmail OAuth·탈퇴 API 없어 항상 성공, 연동 작업 시 실제 요청으로 교체 (실패하면 throw)

// 연결된 Gmail 주소, 사용자가 계정 선택·권한 동의를 취소하면 null
export const connectGmailAccount = async (): Promise<string | null> => 'suum.mail@gmail.com';

export const disconnectGmailAccount = async () => {};

export const withdrawAccount = async () => {};

// 탈퇴 성공 뒤 기기에 남은 계정 데이터 비우기
export const clearAccountData = () => {
  useGmailLink.getState().setGmail(null);
  useRegisterDraft.getState().reset();
  useCheckupDraft.getState().reset();
  useNotificationSettings.getState().setCheckupReminder(false);
};
