import { act, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen, waitFor, within } from 'expo-router/testing-library';

import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
import { CheckupResultScreen } from '@/screens/checkup/CheckupResultScreen';

// 숨 블러는 Skia 네이티브 렌더링이라 그리지 않음 (장식이라 화면 동작과 무관)
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: () => null,
  Circle: () => null,
  Blur: () => null,
  Group: () => null,
  RadialGradient: () => null,
  vec: (x: number, y: number) => ({ x, y }),
}));

const bundle = {
  name: '통신사 OTT 번들',
  includes: ['넷플릭스', '티빙'],
  tags: ['통신사', '약정 없음'],
  monthlyPrice: 19900,
  monthlySaving: 5100,
  condition: null,
  providerType: '통신사',
  priceType: 'FIXED',
};
const result = (over: object = {}) => ({
  checkupId: 'c1',
  subscriptionId: 'netflix',
  serviceName: '넷플릭스',
  nextBillingDate: '2026-11-17',
  yearlyCost: 162000,
  score: 28,
  stage: 'CANCEL_RECOMMENDED',
  bundles: [bundle],
  categorySpending: {
    category: 'VIDEO_OTT',
    monthlyTotal: 28400,
    subscriptionCount: 6,
    // 점검 중인 구독이 맨 위, 5개 넘으면 4개 + 그 외 n개 (서버가 정리)
    items: [
      { serviceName: '넷플릭스', logoUrl: null, monthlyAmount: 13500 },
      { serviceName: '유튜브 프리미엄', logoUrl: null, monthlyAmount: 14900 },
    ],
    otherCount: 2,
  },
  ...over,
});

const renderResult = async (routes: Record<string, unknown> = {}) => {
  mockApi({ 'GET /api/v1/checkups/c1': result(), ...routes });
  await renderRouter(
    {
      index: () => null,
      'checkup/[id]/result': () => <CheckupResultScreen checkupId="c1" />,
      'checkup/[id]/cancel': () => null,
    },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
  // 홈에서 점검을 거쳐 온 것처럼 돌아갈 곳을 둠
  await act(() => router.push('/checkup/netflix/result'));
  await screen.findByText('넷플릭스 점검 완료');
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('CheckupResultScreen', () => {
  it('같은 카테고리 지출은 응답대로, 점검 중인 구독을 표시하고 그 외 개수를 보여준다', async () => {
    await renderResult();

    expect(screen.getByText('영상·OTT 구독')).toBeOnTheScreen();
    expect(screen.getByText('매달 28,400원 지출')).toBeOnTheScreen();
    // 점검 중 표시는 점검 중인 구독(맨 위) 행에만
    expect(screen.getAllByText('현재 점검 중')).toHaveLength(1);
    expect(
      within(screen.getByText('넷플릭스').parent!).getByText('현재 점검 중'),
    ).toBeOnTheScreen();
    expect(screen.getByText('그 외 2개')).toBeOnTheScreen();
  });

  it('번들 추천은 절약 금액과 번들 가격으로 보여준다', async () => {
    await renderResult();

    expect(screen.getByText('같은 넷플릭스, 더 싸게')).toBeOnTheScreen();
    expect(screen.getByText('넷플릭스 + 티빙')).toBeOnTheScreen();
    expect(screen.getByText('월 19,900원에 이용')).toBeOnTheScreen();
  });

  it('추천 상품이 없으면 더 싸게 영역을 숨긴다', async () => {
    await renderResult({ 'GET /api/v1/checkups/c1': result({ bundles: [] }) });

    expect(screen.queryByText('같은 넷플릭스, 더 싸게')).not.toBeOnTheScreen();
  });

  it('해지하기를 누르면 이 점검을 들고 해지 이유로 이동한다', async () => {
    const user = await renderResult();

    await user.press(screen.getByRole('button', { name: '해지하기' }));

    expect(screen).toHavePathname('/checkup/netflix/cancel');
    expect(screen).toHaveSearchParams({ id: 'netflix', checkupId: 'c1' });
  });

  it('유지하기를 누르면 유지 결정을 저장하고 홈으로 돌아간다', async () => {
    const user = await renderResult({ 'PATCH /api/v1/checkups/c1/decision': null });

    await user.press(screen.getByRole('button', { name: '유지하기' }));

    await waitFor(() => expect(screen).toHavePathname('/'));
    const call = jest.mocked(globalThis.fetch).mock.calls.find(([, i]) => i?.method === 'PATCH');
    expect(JSON.parse(String(call?.[1]?.body))).toEqual({ decision: 'KEEP' });
  });

  it('유지 저장에 실패하면 결과 화면에 남는다', async () => {
    const user = await renderResult({ 'PATCH /api/v1/checkups/c1/decision': apiError(500) });

    await user.press(screen.getByRole('button', { name: '유지하기' }));

    await waitFor(() => expect(screen.getByRole('button', { name: '유지하기' })).toBeEnabled());
    expect(screen).toHavePathname('/checkup/netflix/result');
  });
});
