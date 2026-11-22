import { userEvent } from '@testing-library/react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { renderRouter, screen } from 'expo-router/testing-library';

import LoginRoute from '@/app/login';
import { ToastProvider } from '@/components/common/ToastProvider';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';

// 로그인 배경은 Skia 네이티브 렌더링이라 그리지 않음 (장식이라 결과와 무관)
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: () => null,
  Group: () => null,
  Image: () => null,
  Path: () => null,
  Blur: () => null,
  LinearGradient: () => null,
  drawAsImage: () => new Promise(() => {}),
  Skia: { Path: { MakeFromSVGString: () => null } },
  vec: (x: number, y: number) => ({ x, y }),
}));
// 네이티브 로그인 창은 테스트에서 못 띄움 → SDK 응답만 흉내
jest.mock('expo-apple-authentication', () => ({
  ...jest.requireActual('expo-apple-authentication'),
  signInAsync: jest.fn(),
}));

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

const renderLogin = () =>
  renderRouter(
    {
      login: () => (
        <ToastProvider>
          <LoginRoute />
        </ToastProvider>
      ),
    },
    { initialUrl: '/login', wrapper: createQueryWrapper() },
  );

const pressApple = async () => {
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(await screen.findByTestId('login-apple'));
};

it('로그인 요청이 실패하면 실패 토스트를 띄우고 로그인 화면에 머문다', async () => {
  jest.mocked(AppleAuthentication.signInAsync).mockResolvedValue({
    user: 'apple-user',
    identityToken: 'identity',
    authorizationCode: 'code',
    fullName: null,
    email: null,
    realUserStatus: 1,
    state: null,
  });
  mockApi({ 'POST /api/v1/auth/apple': apiError(500) });
  await renderLogin();

  await pressApple();

  expect(await screen.findByText('로그인에 실패했어요')).toBeOnTheScreen();
  expect(screen).toHavePathname('/login');
});

it('로그인 창을 닫으면 토스트 없이 로그인 화면에 머문다', async () => {
  jest
    .mocked(AppleAuthentication.signInAsync)
    .mockRejectedValue(Object.assign(new Error('canceled'), { code: 'ERR_REQUEST_CANCELED' }));
  await renderLogin();

  await pressApple();

  expect(screen.queryByText('로그인에 실패했어요')).not.toBeOnTheScreen();
  expect(screen).toHavePathname('/login');
});
