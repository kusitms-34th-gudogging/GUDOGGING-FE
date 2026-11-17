import { userEvent } from '@testing-library/react-native';
import { Slot } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

import MypageGmailRoute from '@/app/mypage/gmail';
import { ToastProvider } from '@/components/common/ToastProvider';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
import { MypageScreen } from '@/screens/mypage/MypageScreen';

const ME = {
  userId: 'u1',
  provider: 'APPLE',
  email: 'suum.user@icloud.com',
  gmailLinked: false,
  gmailEmail: null,
};

// Gmail 연동 화면의 토스트용 (앱에선 루트 레이아웃이 감쌈)
const ToastLayout = () => (
  <ToastProvider>
    <Slot />
  </ToastProvider>
);

const renderMypage = async (routes: Record<string, unknown>, me: unknown = ME) => {
  mockApi({ 'GET /api/v1/users/me': me });
  await renderRouter(
    { _layout: ToastLayout, index: () => <MypageScreen />, ...routes },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
};

afterEach(() => jest.restoreAllMocks());

test('로그인 계정과 로그인 방식을 보여 준다', async () => {
  await renderMypage({});

  expect(await screen.findByText('suum.user@icloud.com')).toBeOnTheScreen();
  expect(screen.getByText('Apple로 로그인')).toBeOnTheScreen();
});

test('계정 정보를 못 불러와도 메뉴는 쓸 수 있다', async () => {
  await renderMypage({ 'mypage/notification': () => null }, apiError(500));

  await userEvent.press(screen.getByRole('button', { name: '알림 설정' }));

  expect(screen).toHavePathname('/mypage/notification');
});

test('Gmail 연동 행을 누르면 Gmail 연동 화면으로 이동한다', async () => {
  await renderMypage({ 'mypage/gmail': MypageGmailRoute });

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연동' }));

  expect(screen).toHavePathname('/mypage/gmail');
});

test('로그아웃을 확인하면 로그인 화면으로, 취소하면 그대로다', async () => {
  await renderMypage({ login: () => null });

  await userEvent.press(screen.getByRole('button', { name: '로그아웃' }));
  await userEvent.press(screen.getByRole('button', { name: '취소' }));
  expect(screen).toHavePathname('/');

  await userEvent.press(screen.getByRole('button', { name: '로그아웃' }));
  await userEvent.press(screen.getByRole('button', { name: '로그아웃 하기' }));

  expect(screen).toHavePathname('/login');
});

test('회원 탈퇴 행을 누르면 회원 탈퇴 화면으로 이동한다', async () => {
  await renderMypage({ 'mypage/withdraw': () => null });

  await userEvent.press(screen.getByRole('button', { name: '회원 탈퇴' }));

  expect(screen).toHavePathname('/mypage/withdraw');
});
