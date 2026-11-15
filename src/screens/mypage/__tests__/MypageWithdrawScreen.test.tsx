import { act, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

import { useGmailLink } from '@/hooks/useGmailLink';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { MypageWithdrawScreen } from '@/screens/mypage/MypageWithdrawScreen';

const renderFromMypage = async () => {
  await renderRouter({
    index: () => null,
    'mypage/withdraw': () => <MypageWithdrawScreen />,
    'mypage/withdraw-done': () => null,
  });
  await act(() => router.push('/mypage/withdraw'));
};

test('최종 확인에서 탈퇴하기를 누르면 기기의 계정 데이터를 비우고 탈퇴 완료 화면으로 간다', async () => {
  useGmailLink.setState({ gmail: 'suum.mail@gmail.com' });
  useRegisterDraft.setState({ selectedIds: ['netflix'] });
  useNotificationSettings.setState({ checkupReminder: true });
  await renderFromMypage();

  await userEvent.press(screen.getByRole('button', { name: '탈퇴하기' }));
  // 팝업의 탈퇴하기 (화면 버튼과 이름이 같아 마지막 것)
  await userEvent.press(screen.getAllByRole('button', { name: '탈퇴하기' }).at(-1)!);

  expect(screen).toHavePathname('/mypage/withdraw-done');
  expect(useGmailLink.getState().gmail).toBeNull();
  expect(useRegisterDraft.getState().selectedIds).toEqual([]);
  expect(useNotificationSettings.getState().checkupReminder).toBe(false);
});

test('취소를 누르면 마이페이지로 돌아간다', async () => {
  useGmailLink.setState({ gmail: 'suum.mail@gmail.com' });
  await renderFromMypage();

  await userEvent.press(screen.getByRole('button', { name: '취소' }));

  expect(screen).toHavePathname('/');
  expect(useGmailLink.getState().gmail).toBe('suum.mail@gmail.com');
});

test('최종 확인에서 계속 이용하기를 누르면 탈퇴하지 않고 화면에 남는다', async () => {
  useGmailLink.setState({ gmail: 'suum.mail@gmail.com' });
  await renderFromMypage();

  await userEvent.press(screen.getByRole('button', { name: '탈퇴하기' }));
  await userEvent.press(screen.getByRole('button', { name: '계속 이용하기' }));

  expect(screen).toHavePathname('/mypage/withdraw');
  expect(useGmailLink.getState().gmail).toBe('suum.mail@gmail.com');
});
