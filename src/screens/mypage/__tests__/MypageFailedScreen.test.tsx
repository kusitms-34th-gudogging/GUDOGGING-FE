import { act, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { apiError, createQueryWrapper, mockApi, mockGmailAuthCode } from '@/lib/testing';
import { MypageFailedScreen } from '@/screens/mypage/MypageFailedScreen';

// 배경 블러는 Skia 네이티브 렌더링이라 그리지 않음 (장식이라 화면 동작과 무관)
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: () => null,
  Circle: () => null,
  Blur: () => null,
  LinearGradient: () => null,
  vec: (x: number, y: number) => ({ x, y }),
}));

const CONNECT = 'POST /api/v1/gmail/connection';
const WITHDRAW = 'DELETE /api/v1/users/me';

// 직전 화면(Gmail 연동·회원 탈퇴)에서 실패 화면으로 들어온 상태
const renderFailed = async (kind: 'gmail' | 'withdraw', routes: Record<string, unknown>) => {
  mockApi(routes);
  await renderRouter(
    {
      index: () => null,
      [`mypage/${kind}`]: () => null,
      [`mypage/${kind}-failed`]: () => <MypageFailedScreen kind={kind} />,
      'mypage/withdraw-done': () => null,
    },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
  await act(() => router.push(`/mypage/${kind}`));
  await act(() => router.push(`/mypage/${kind}-failed`));
};
const retry = () => userEvent.press(screen.getByRole('button', { name: '다시 시도하기' }));

beforeEach(() => {
  useRegisterDraft.setState({ selectedIds: ['netflix'] });
  mockGmailAuthCode('google-auth-code');
});
afterEach(() => jest.restoreAllMocks());

test('Gmail 다시 시도가 성공하면 Gmail 연동 화면으로 돌아간다', async () => {
  await renderFailed('gmail', {
    [CONNECT]: { status: 'CONNECTED', connected: true, email: 'a@gmail.com' },
  });

  await retry();

  expect(screen).toHavePathname('/mypage/gmail');
});

test('Gmail 다시 시도가 또 실패하면 실패 화면에 남는다', async () => {
  await renderFailed('gmail', { [CONNECT]: apiError(500) });

  await retry();

  expect(screen).toHavePathname('/mypage/gmail-failed');
});

test('탈퇴 다시 시도가 성공하면 데이터를 비우고 탈퇴 완료 화면으로 간다', async () => {
  await renderFailed('withdraw', { [WITHDRAW]: null });

  await retry();

  expect(screen).toHavePathname('/mypage/withdraw-done');
  expect(useRegisterDraft.getState().selectedIds).toEqual([]);
});

test('탈퇴 다시 시도가 또 실패하면 데이터를 지우지 않고 실패 화면에 남는다', async () => {
  await renderFailed('withdraw', { [WITHDRAW]: apiError(500) });

  await retry();

  expect(screen).toHavePathname('/mypage/withdraw-failed');
  expect(useRegisterDraft.getState().selectedIds).toEqual(['netflix']);
});

test('탈퇴 실패에서 취소하기를 누르면 회원 탈퇴 안내 화면으로 돌아간다', async () => {
  await renderFailed('withdraw', {});

  await userEvent.press(screen.getByRole('button', { name: '취소하기' }));

  expect(screen).toHavePathname('/mypage/withdraw');
});
