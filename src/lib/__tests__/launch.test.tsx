import { act } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

import HomeRoute from '@/app/(tabs)/index';
import LoginRoute from '@/app/login';
import { launch } from '@/lib/launch';

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
});
afterEach(() => jest.useRealTimers());

const routes = { '(tabs)/index': HomeRoute, login: LoginRoute, onboarding: () => null };

it('앱을 홈으로 열면 로그인 화면부터 보여 준다', async () => {
  await renderRouter(routes, { initialUrl: '/' });
  expect(screen).toHavePathname('/login');
});

it('로그인 화면부터 열었으면 홈으로 갈 때 다시 로그인으로 보내지 않는다', async () => {
  await renderRouter(routes, { initialUrl: '/login' });

  // 로그인 → 온보딩을 마치고 홈으로
  await act(() => router.replace('/'));
  expect(screen).toHavePathname('/');
});
