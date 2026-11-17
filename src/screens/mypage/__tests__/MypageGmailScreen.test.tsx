import { act, userEvent } from '@testing-library/react-native';
import { router, Slot } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

import { ToastProvider } from '@/components/common/ToastProvider';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
import { MypageGmailScreen } from '@/screens/mypage/MypageGmailScreen';

const CONNECTION = 'GET /api/v1/gmail/connection';
const CONNECT = 'POST /api/v1/gmail/connection';
const DISCONNECT = 'DELETE /api/v1/gmail/connection';
const connected = (email: string) => ({ status: 'CONNECTED', connected: true, email });
const NOT_CONNECTED = { status: 'NOT_CONNECTED', connected: false, email: null };

// 해제 실패 토스트용 (앱에선 루트 레이아웃이 감쌈)
const ToastLayout = () => (
  <ToastProvider>
    <Slot />
  </ToastProvider>
);

// 마이페이지(index) → Gmail 연동 화면으로 들어온 상태
const renderFromMypage = async (
  routes: Record<string, unknown>,
  props: Parameters<typeof MypageGmailScreen>[0] = {},
) => {
  mockApi(routes);
  await renderRouter(
    {
      _layout: ToastLayout,
      index: () => null,
      'mypage/gmail': () => <MypageGmailScreen {...props} />,
      'mypage/gmail-failed': () => null,
    },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
  await act(() => router.push('/mypage/gmail'));
  await screen.findByRole('button', { name: /^Gmail 연결/ });
};
const sentBody = (method: string) => {
  const call = jest.mocked(globalThis.fetch).mock.calls.find(([, i]) => i?.method === method);
  return call && JSON.parse(String(call[1]?.body));
};

afterEach(() => jest.restoreAllMocks());

test('연결하기를 누르면 인증 코드로 연동하고 연결된 Gmail 주소와 해제 버튼이 보인다', async () => {
  await renderFromMypage({
    [CONNECTION]: NOT_CONNECTED,
    [CONNECT]: connected('suum.mail@gmail.com'),
  });
  expect(screen.queryByText('suum.mail@gmail.com')).toBeNull();

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결하기' }));

  expect(sentBody('POST')).toEqual({ authCode: 'mock-auth-code' });
  expect(await screen.findByText('suum.mail@gmail.com')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Gmail 연결 해제하기' })).toBeOnTheScreen();
});

test('이미 연결돼 있으면 연결됨 화면이 보인다', async () => {
  await renderFromMypage({ [CONNECTION]: connected('other@gmail.com') });

  expect(screen.getByText('other@gmail.com')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Gmail 연결 해제하기' })).toBeOnTheScreen();
});

test('연동 상태를 못 불러오면 다시 시도할 수 있다', async () => {
  mockApi({ [CONNECTION]: apiError(500) });
  await renderRouter(
    { _layout: ToastLayout, index: () => <MypageGmailScreen /> },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );

  expect(await screen.findByText('정보를 불러오지 못했어요')).toBeOnTheScreen();
});

test('Google 계정 선택을 취소하면 연동하지 않고 마이페이지로 돌아간다', async () => {
  await renderFromMypage({ [CONNECTION]: NOT_CONNECTED }, { requestAuthCode: async () => null });

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결하기' }));

  expect(screen).toHavePathname('/');
  expect(sentBody('POST')).toBeUndefined();
});

test.each([
  ['요청이 실패하면', apiError(500)],
  ['서버가 연동 실패로 답하면', { status: 'FAILED', connected: false, email: null }],
])('%s 연동 실패 화면으로 이동한다', async (_, response) => {
  await renderFromMypage({ [CONNECTION]: NOT_CONNECTED, [CONNECT]: response });

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결하기' }));

  expect(screen).toHavePathname('/mypage/gmail-failed');
});

test('연결 해제를 확인하면 미연결 상태로, 취소하면 연결 상태 그대로다', async () => {
  await renderFromMypage({ [CONNECTION]: connected('suum.mail@gmail.com'), [DISCONNECT]: null });

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결 해제하기' }));
  await userEvent.press(screen.getByRole('button', { name: '취소' }));
  expect(screen.getByText('suum.mail@gmail.com')).toBeOnTheScreen();

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결 해제하기' }));
  await userEvent.press(screen.getByRole('button', { name: '연결 해제하기' }));

  expect(await screen.findByRole('button', { name: 'Gmail 연결하기' })).toBeOnTheScreen();
  expect(screen.queryByText('suum.mail@gmail.com')).toBeNull();
});

test('연결 해제가 실패하면 연결 상태를 유지하고 오류를 알린다', async () => {
  await renderFromMypage({
    [CONNECTION]: connected('suum.mail@gmail.com'),
    [DISCONNECT]: apiError(500),
  });

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결 해제하기' }));
  await userEvent.press(screen.getByRole('button', { name: '연결 해제하기' }));

  expect(
    await screen.findByText('연결을 해제하지 못했어요. 다시 시도해 주세요.'),
  ).toBeOnTheScreen();
  expect(screen.getByText('suum.mail@gmail.com')).toBeOnTheScreen();
});
