import { router, Stack } from 'expo-router';
import { act, renderRouter, screen } from 'expo-router/testing-library';

import { RegisterAnalyzeScreen } from '@/screens/register/RegisterAnalyzeScreen';

// 애니메이션은 네이티브 렌더링이라 그리지 않음
jest.mock('lottie-react-native', () => () => null);
// 분석 결과에 확인 필요 항목이 없으면 실패로 봄 → 그런 샘플로 바꿔 실패 흐름을 만듦
jest.mock('@/constants/services', () => {
  const actual = jest.requireActual('@/constants/services');
  return { ...actual, FOUND_SAMPLE: [] };
});

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('스크린샷 분석에 실패하면 실패 화면 바로 아래가 안내(A-06)라 스와이프로 돌아가도 A-06이다', async () => {
  await renderRouter(
    {
      'register/_layout': () => <Stack />,
      'register/screenshot': () => null,
      'register/images': () => null,
      'register/analyze': () => <RegisterAnalyzeScreen source="screenshot" />,
      'register/failed': () => null,
    },
    { initialUrl: '/register/screenshot' },
  );
  await act(() => router.push('/register/images'));
  await act(() => router.push('/register/analyze'));

  await act(() => jest.advanceTimersByTime(1500));
  expect(screen).toHavePathname('/register/failed');

  // 스와이프 뒤로가기 = 스택에서 한 칸 뒤로
  await act(() => router.back());
  expect(screen).toHavePathname('/register/screenshot');
});
