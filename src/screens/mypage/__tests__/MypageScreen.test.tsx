import { userEvent } from '@testing-library/react-native';
import { Slot } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
import { Linking } from 'react-native';

import MypageGmailRoute from '@/app/mypage/gmail';
import { ToastProvider } from '@/components/common/ToastProvider';
import { authToken } from '@/lib/authToken';
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

test('Apple 이메일 가리기로 이메일이 없으면 이메일 비공개로 보여 준다', async () => {
  await renderMypage({}, { ...ME, email: null });

  expect(await screen.findByText('이메일 비공개')).toBeOnTheScreen();
});

test('Apple 이메일 가리기 릴레이 주소면 이메일 비공개로 보여 준다', async () => {
  await renderMypage({}, { ...ME, email: '7nkf2bbrvt@privaterelay.appleid.com' });

  expect(await screen.findByText('이메일 비공개')).toBeOnTheScreen();
  expect(screen.queryByText('7nkf2bbrvt@privaterelay.appleid.com')).not.toBeOnTheScreen();
});

test('릴레이 도메인이 대문자여도 이메일 비공개로 보여 준다', async () => {
  await renderMypage({}, { ...ME, email: '7nkf2bbrvt@PRIVATERELAY.APPLEID.COM' });

  expect(await screen.findByText('이메일 비공개')).toBeOnTheScreen();
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
  await authToken.save({ accessToken: 'access', refreshToken: 'refresh' });
  await renderMypage({ login: () => null });

  await userEvent.press(screen.getByRole('button', { name: '로그아웃' }));
  await userEvent.press(screen.getByRole('button', { name: '취소' }));
  expect(screen).toHavePathname('/');

  await userEvent.press(screen.getByRole('button', { name: '로그아웃' }));
  await userEvent.press(screen.getByRole('button', { name: '로그아웃 하기' }));

  // 서버 세션 종료를 요청하고, 응답이 실패(이 테스트는 목 응답 없음 → 404)여도 기기에선 로그아웃
  const logoutCall = jest
    .mocked(globalThis.fetch)
    .mock.calls.find(([url]) => String(url).endsWith('/api/v1/auth/logout'));
  expect(logoutCall?.[1]?.method).toBe('POST');
  expect(JSON.parse(String(logoutCall?.[1]?.body))).toEqual({ refreshToken: 'refresh' });
  expect(screen).toHavePathname('/login');
  expect(await authToken.getRefresh()).toBeNull();
});

test('회원 탈퇴 행을 누르면 회원 탈퇴 화면으로 이동한다', async () => {
  await renderMypage({ 'mypage/withdraw': () => null });

  await userEvent.press(screen.getByRole('button', { name: '회원 탈퇴' }));

  expect(screen).toHavePathname('/mypage/withdraw');
});

test('이용 약관 및 개인정보 처리방침은 노션 페이지를 브라우저로 연다', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue();
  await renderMypage({});

  await userEvent.press(screen.getByRole('button', { name: '이용 약관 및 개인정보 처리방침' }));

  expect(open).toHaveBeenCalledWith(
    'https://pear-yew-dc3.notion.site/41fe0bd8b68780fcb12fea088ac232ff?source=copy_link',
  );
  expect(screen.queryByRole('button', { name: '개인정보 처리방침' })).not.toBeOnTheScreen();
});
