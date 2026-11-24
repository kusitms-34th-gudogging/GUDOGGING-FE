import { userEvent } from '@testing-library/react-native';
import { router, Stack } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';

import { RegisterFailedScreen } from '@/screens/register/RegisterFailedScreen';

// 배경 블러는 Skia 네이티브 렌더링이라 그리지 않음 (장식이라 화면 동작과 무관)
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: () => null,
  Circle: () => null,
  Blur: () => null,
  LinearGradient: () => null,
  vec: (x: number, y: number) => ({ x, y }),
}));

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('직접 등록하기를 누르면 서비스 선택(A-02)으로 이동한다', async () => {
  await renderRouter(
    {
      'register/failed': () => <RegisterFailedScreen source="screenshot" />,
      'register/select': () => null,
    },
    { initialUrl: '/register/failed' },
  );

  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(screen.getByRole('button', { name: '직접 등록하기' }));

  expect(screen).toHavePathname('/register/select');
});

it('스크린샷 실패에서 뒤로 가면 스크린샷 확인(A-07)으로 간다', async () => {
  await renderRouter(
    {
      'register/_layout': () => <Stack />,
      'register/index': () => null,
      'register/screenshot': () => null,
      'register/images': () => null,
      'register/failed': () => <RegisterFailedScreen source="screenshot" />,
    },
    { initialUrl: '/register' },
  );
  await act(() => router.push('/register/screenshot'));
  await act(() => router.push('/register/images'));
  await act(() => router.push('/register/failed'));

  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(screen.getByRole('button', { name: '뒤로 가기' }));

  expect(screen).toHavePathname('/register/images');
});

it.each([
  ['screenshot', '/register/images'],
  ['gmail', '/register/gmail'],
] as const)(
  '온보딩 %s 실패에서 뒤로 가면 구독 추가(A-01)·안내 화면이 아니라 첫 등록 화면으로 간다',
  async (source, guide) => {
    await renderRouter(
      {
        'onboarding/add-subscription': () => null,
        'register/_layout': () => <Stack />,
        'register/index': () => null,
        'register/images': () => null,
        'register/gmail': () => null,
        'register/failed': () => <RegisterFailedScreen source={source} />,
      },
      { initialUrl: '/onboarding/add-subscription' },
    );
    await act(() => router.push(guide));
    await act(() => router.push('/register/failed'));

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(screen).toHavePathname('/onboarding/add-subscription');
  },
);
