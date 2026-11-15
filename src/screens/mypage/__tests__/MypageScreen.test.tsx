import { userEvent } from '@testing-library/react-native';
import { Slot } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

import MypageGmailRoute from '@/app/mypage/gmail';
import { ToastProvider } from '@/components/common/ToastProvider';
import { useGmailLink } from '@/hooks/useGmailLink';
import { MypageScreen } from '@/screens/mypage/MypageScreen';

// Gmail 연동 화면의 토스트용 (앱에선 루트 레이아웃이 감쌈)
const ToastLayout = () => (
  <ToastProvider>
    <Slot />
  </ToastProvider>
);

test('Gmail 연동 행을 누르면 Gmail 연동 화면으로 이동한다', async () => {
  await renderRouter({
    _layout: ToastLayout,
    index: () => <MypageScreen />,
    'mypage/gmail': MypageGmailRoute,
  });

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연동' }));

  expect(screen).toHavePathname('/mypage/gmail');
});

test('알림 설정 행을 누르면 알림 설정 화면으로 이동한다', async () => {
  await renderRouter({ index: () => <MypageScreen />, 'mypage/notification': () => null });

  await userEvent.press(screen.getByRole('button', { name: '알림 설정' }));

  expect(screen).toHavePathname('/mypage/notification');
});

test('로그아웃을 확인하면 Gmail 연결을 비우고 로그인 화면으로, 취소하면 그대로다', async () => {
  useGmailLink.setState({ gmail: 'suum.mail@gmail.com' });
  await renderRouter({ index: () => <MypageScreen />, login: () => null });

  await userEvent.press(screen.getByRole('button', { name: '로그아웃' }));
  await userEvent.press(screen.getByRole('button', { name: '취소' }));
  expect(screen).toHavePathname('/');

  await userEvent.press(screen.getByRole('button', { name: '로그아웃' }));
  await userEvent.press(screen.getByRole('button', { name: '로그아웃 하기' }));

  expect(screen).toHavePathname('/login');
  expect(useGmailLink.getState().gmail).toBeNull();
});

test('회원 탈퇴 행을 누르면 회원 탈퇴 화면으로 이동한다', async () => {
  await renderRouter({ index: () => <MypageScreen />, 'mypage/withdraw': () => null });

  await userEvent.press(screen.getByRole('button', { name: '회원 탈퇴' }));

  expect(screen).toHavePathname('/mypage/withdraw');
});
