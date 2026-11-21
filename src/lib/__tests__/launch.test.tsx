import { act, waitFor } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

import HomeRoute from '@/app/(tabs)/index';
import LoginRoute from '@/app/login';
import { ToastProvider } from '@/components/common/ToastProvider';
import { authToken } from '@/lib/authToken';
import { launch } from '@/lib/launch';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';

// 로그인 배경은 Skia 네이티브 렌더링이라 그리지 않음 (장식이라 이동과 무관)
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

beforeEach(() => {
  jest.useFakeTimers();
  launch.loginShown = false;
  // 홈이 API를 부르지만 이 테스트는 이동만 봄 → 응답 없이 막아 둠
  mockApi({});
});
afterEach(async () => {
  jest.useRealTimers();
  jest.restoreAllMocks();
  await authToken.clear();
});
const tokens = { accessToken: 'access', refreshToken: 'refresh' };

const routes = {
  '(tabs)/index': HomeRoute,
  login: () => (
    <ToastProvider>
      <LoginRoute />
    </ToastProvider>
  ),
  onboarding: () => null,
};

it('저장된 토큰 없이 앱을 열면 로그인 화면부터 보여 준다', async () => {
  await renderRouter(routes, { initialUrl: '/', wrapper: createQueryWrapper() });

  await screen.findByTestId('login-apple');
  expect(screen).toHavePathname('/login');
});

it('리프레시 토큰이 유효하면 로그인 없이 홈에 머문다', async () => {
  await authToken.save(tokens);
  // 재발급이 실패해도 홈에 머물러서, 새 토큰이 저장됐는지로 재발급 성공을 확인
  mockApi({
    'POST /api/v1/auth/reissue': { accessToken: 'new-access', refreshToken: 'new-refresh' },
  });

  await renderRouter(routes, { initialUrl: '/', wrapper: createQueryWrapper() });

  // 홈 API는 막아 둬서 홈 화면은 에러 상태로 그려짐 → 그 문구로 세션 확인이 끝났는지 기다림
  await screen.findByText('정보를 불러오지 못했어요');
  expect(screen).toHavePathname('/');
  await waitFor(async () => expect(await authToken.getRefresh()).toBe('new-refresh'));
});

it('리프레시 토큰이 만료(401)면 로그인 화면으로 보낸다', async () => {
  await authToken.save(tokens);
  mockApi({ 'POST /api/v1/auth/reissue': apiError(401) });

  await renderRouter(routes, { initialUrl: '/', wrapper: createQueryWrapper() });

  await screen.findByTestId('login-apple');
  expect(screen).toHavePathname('/login');
});

it('로그인 화면부터 열었으면 홈으로 갈 때 다시 로그인으로 보내지 않는다', async () => {
  await renderRouter(routes, { initialUrl: '/login', wrapper: createQueryWrapper() });

  // 로그인 → 온보딩을 마치고 홈으로
  await act(() => router.replace('/'));
  expect(screen).toHavePathname('/');
});
