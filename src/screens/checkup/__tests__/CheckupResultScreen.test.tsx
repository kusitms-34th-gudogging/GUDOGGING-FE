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
  includes: '넷플릭스 + 티빙',
  tags: ['통신사', '약정 없음'],
  priceType: 'FIXED',
  monthlySaving: 5100,
  savingRate: 20,
  monthlyPrice: 19900,
};
const result = (over: object = {}) => ({
  checkupId: 'c1',
  subscriptionId: 'netflix',
  serviceName: '넷플릭스',
  nextBillingDate: '2026-11-17',
  yearlyCost: 162000,
  score: 28,
  stage: 'CANCEL_RECOMMENDED',
  mainFactor: 'USAGE',
  bundles: [bundle],
  categorySpending: {
    category: 'VIDEO_OTT',
    monthlyTotal: 28400,
    subscriptionCount: 6,
    // 점검 중인 구독이 맨 위. 6개 모두 나열 ('그 외 n개'로 줄이지 않음)
    items: [
      { serviceName: '넷플릭스', logoUrl: null, monthlyAmount: 13500 },
      { serviceName: '유튜브 프리미엄', logoUrl: null, monthlyAmount: 14900 },
      { serviceName: '티빙', logoUrl: null, monthlyAmount: 0 },
      { serviceName: '디즈니+', logoUrl: null, monthlyAmount: 0 },
      { serviceName: '왓챠', logoUrl: null, monthlyAmount: 0 },
      { serviceName: '웨이브', logoUrl: null, monthlyAmount: 0 },
    ],
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
  await screen.findByText(/^넷플릭스 (유지|해지)를/);
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('CheckupResultScreen', () => {
  it('같은 카테고리 지출은 응답대로 전부 나열하고, 점검 중인 구독을 표시한다', async () => {
    await renderResult();

    expect(screen.getByText('영상·OTT 구독')).toBeOnTheScreen();
    expect(screen.getByText('매달 28,400원 지출')).toBeOnTheScreen();
    // 점검 중 표시는 점검 중인 구독(맨 위) 행에만
    expect(screen.getAllByText('현재 점검 중')).toHaveLength(1);
    expect(
      within(screen.getByText('넷플릭스').parent!).getByText('현재 점검 중'),
    ).toBeOnTheScreen();
    expect(screen.getByText('웨이브')).toBeOnTheScreen();
    expect(screen.queryByText(/그 외/)).not.toBeOnTheScreen();
  });

  it('번들 추천은 절약 금액과 번들 가격으로 보여준다', async () => {
    await renderResult();

    expect(screen.getByText('같은 넷플릭스, 더 싸게')).toBeOnTheScreen();
    expect(screen.getByText('넷플릭스 + 티빙')).toBeOnTheScreen();
    expect(screen.getByText('월 19,900원에 이용')).toBeOnTheScreen();
    // 추천 개수는 보여 주지 않음
    expect(screen.queryByText(/추천 \d+개/)).not.toBeOnTheScreen();
  });

  it('빈 태그는 그리지 않는다', async () => {
    await renderResult({
      'GET /api/v1/checkups/c1': result({ bundles: [{ ...bundle, tags: ['KT 구독', ''] }] }),
    });

    expect(screen.getByText('KT 구독')).toBeOnTheScreen();
    expect(screen.queryByText('')).not.toBeOnTheScreen();
  });

  it('통신 요금제(BENEFIT)는 금액 대신 핵심 혜택과 요금제 가격을 보여준다', async () => {
    await renderResult({
      'GET /api/v1/checkups/c1': result({
        bundles: [
          {
            ...bundle,
            tags: ['통신사 · 요금제', '넷플릭스 무료'],
            priceType: 'BENEFIT',
            monthlySaving: null,
            savingRate: null,
            monthlyPrice: 69000,
          },
        ],
      }),
    });

    expect(screen.getByText('요금제 월 69,000원')).toBeOnTheScreen();
    expect(screen.getAllByText('넷플릭스 무료').length).toBeGreaterThan(0);
  });

  it('해지 쪽 결과는 활용도 구간 추천 문구와 가장 큰 영향 문항의 해지 쪽 문구를 보여준다', async () => {
    await renderResult();

    expect(screen.getByText('넷플릭스 해지를 추천해요.')).toBeOnTheScreen();
    expect(screen.getByText('최근 한 달 동안 거의 이용하지 않았어요.')).toBeOnTheScreen();
  });

  it('유지 쪽 결과는 같은 문항이어도 유지 쪽 문구를 보여준다', async () => {
    await renderResult({
      'GET /api/v1/checkups/c1': result({ score: 72, stage: 'KEEP_CONSIDER', mainFactor: 'PLAN' }),
    });

    expect(screen.getByText('넷플릭스 유지를 고려해 보세요.')).toBeOnTheScreen();
    expect(screen.getByText('다음 달에도 계속 쓸 계획이에요.')).toBeOnTheScreen();
  });

  it('구독 종료된 구독의 점검(nextBillingDate null)도 결과를 보여준다', async () => {
    await renderResult({ 'GET /api/v1/checkups/c1': result({ nextBillingDate: null }) });

    expect(screen.getByText('넷플릭스 해지를 추천해요.')).toBeOnTheScreen();
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
