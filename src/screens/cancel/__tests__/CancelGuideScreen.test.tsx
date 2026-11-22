import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen, waitFor } from 'expo-router/testing-library';
import { Linking } from 'react-native';

import CancelGuideRoute from '@/app/cancel/[id]';
import CheckupCancelRoute from '@/app/checkup/[id]/cancel';
import SubscriptionDetailRoute from '@/app/manage/detail/[id]';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
import { CancelGuideScreen } from '@/screens/cancel/CancelGuideScreen';

const detail = {
  subscriptionId: 'melon',
  status: 'ACTIVE',
  serviceName: '멜론',
  category: 'MUSIC',
  amount: 10900,
  billingCycleValue: 1,
  billingCycleUnit: 'MONTH',
  nextBillingDate: '2026-12-01',
  startedAt: '2026-01-01',
  paymentMethod: 'WEB_DIRECT',
  isSteady: false,
  canceledAt: null,
  totalPaidAmount: 119900,
  latestCheckup: null,
  pastCheckupAverage: null,
};
const guide = (over: object = {}) => ({
  serviceName: '멜론',
  paymentMethod: 'WEB_DIRECT',
  steps: [],
  cancelUrl: null,
  caution: null,
  guideMessage: '{name} 앱이나 웹사이트에서 해지할 수 있어요.',
  lastVerifiedAt: '2026-10-20',
  ...over,
});
const STORE_STEPS = ['아래 버튼을 눌러 구독 관리를 열어요', '목록에서 {name}을 선택해요', '끝!'];

const renderGuide = async (response: object) => {
  mockApi({ 'GET /api/v1/subscriptions/melon/cancel-guide': response });
  await renderRouter(
    { index: () => <CancelGuideScreen subscriptionId="melon" /> },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
  await screen.findByText('멜론 구독을\n해지할게요.');
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

it.each([
  ['APP_STORE', 'https://apps.apple.com', 'App Store 결제', 'App Store 구독 관리 열기'],
  ['GOOGLE_PLAY', 'https://play.google.com', 'Google Play 결제', 'Google Play 정기 결제 열기'],
])('%s 결제는 결제 경로와 해지 단계, 맞는 버튼을 보여준다', async (method, url, payment, cta) => {
  await renderGuide(guide({ paymentMethod: method, steps: STORE_STEPS, cancelUrl: url }));

  expect(screen.getByText(`멜론 · ${payment}`)).toBeOnTheScreen();
  // 단계 문구의 {name}은 서비스명 받침에 맞춰 채움
  expect(screen.getByText('목록에서 멜론을 선택해요')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: cta })).toBeOnTheScreen();
});

it('웹·직접 결제는 서비스별 문구 대신 공통 3단계와 해지 페이지 버튼을 보여준다', async () => {
  await renderGuide(guide({ steps: STORE_STEPS, cancelUrl: 'https://melon.com' }));

  expect(screen.getByText('멜론 · 웹·직접 결제')).toBeOnTheScreen();
  expect(screen.getByText('아래 버튼을 눌러 해지 페이지로 이동해요')).toBeOnTheScreen();
  expect(screen.queryByText('목록에서 멜론을 선택해요')).not.toBeOnTheScreen();
  expect(screen.getByRole('button', { name: '해지 페이지로 이동' })).toBeOnTheScreen();
});

it('해지 링크가 없으면 앱·웹 해지 안내와 해지했어요 버튼을 보여준다', async () => {
  await renderGuide(guide());

  expect(screen.getByText('멜론 앱이나 웹에서 해지 메뉴로 이동해요')).toBeOnTheScreen();
  expect(screen.getByText("돌아와서 '해지했어요'를 눌러요")).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: '해지했어요' })).toBeOnTheScreen();
});

it('주의사항이 있으면 함께 보여준다', async () => {
  await renderGuide(guide({ caution: '해지해도 결제 기간 끝까지 이용 가능' }));

  expect(screen.getByText('해지해도 결제 기간 끝까지 이용 가능')).toBeOnTheScreen();
});

it('불러오지 못하면 다시 시도로 다시 요청한다', async () => {
  mockApi({ 'GET /api/v1/subscriptions/melon/cancel-guide': apiError(500) });
  await renderRouter(
    { index: () => <CancelGuideScreen subscriptionId="melon" /> },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(await screen.findByRole('button', { name: '다시 시도' }));

  expect(globalThis.fetch).toHaveBeenCalledTimes(2);
});

it('해지 완료하면 해지 완료 처리 후 해지를 시작한 구독 상세로 돌아간다', async () => {
  mockApi({
    'GET /api/v1/subscriptions/melon': detail,
    'GET /api/v1/subscriptions/melon/cancel-guide': guide(),
    'PATCH /api/v1/subscriptions/melon/cancel': {
      subscriptionId: 'melon',
      status: 'ENDED',
      canceledAt: '2026-11-17',
    },
  });
  await renderRouter(
    {
      'manage/detail/[id]': SubscriptionDetailRoute,
      'checkup/[id]/cancel': CheckupCancelRoute,
      'cancel/[id]': CancelGuideRoute,
    },
    { initialUrl: '/manage/detail/melon', wrapper: createQueryWrapper() },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  // 상세 → 해지 이유(건너뛰기) → 해지 안내
  await user.press(await screen.findByRole('button', { name: '해지하기' }));
  await user.press(await screen.findByRole('button', { name: '건너뛰기' }));
  expect(screen).toHavePathname('/cancel/melon');
  await user.press(await screen.findByRole('button', { name: '해지했어요' }));
  await user.press(screen.getByRole('button', { name: '해지 완료' }));

  await waitFor(() => expect(screen).toHavePathname('/manage/detail/melon'));
  expect(await screen.findByText('멜론을 해지했어요')).toBeOnTheScreen();
  const patch = jest.mocked(globalThis.fetch).mock.calls.find(([, i]) => i?.method === 'PATCH');
  expect(String(patch?.[0])).toBe('https://api.test/api/v1/subscriptions/melon/cancel');
});

it('해지 완료 처리에 실패하면 해지 안내에 남는다', async () => {
  mockApi({
    'GET /api/v1/subscriptions/melon/cancel-guide': guide(),
    'PATCH /api/v1/subscriptions/melon/cancel': apiError(500),
  });
  await renderRouter(
    { 'cancel/[id]': CancelGuideRoute },
    { initialUrl: '/cancel/melon', wrapper: createQueryWrapper() },
  );
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(await screen.findByRole('button', { name: '해지했어요' }));
  await user.press(screen.getByRole('button', { name: '해지 완료' }));

  expect(await screen.findByText('저장하지 못했어요')).toBeOnTheScreen();
  expect(screen).toHavePathname('/cancel/melon');
});

it('해지 페이지를 열지 못하면 안내 토스트를 띄운다', async () => {
  jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('cannot open'));
  await renderGuide(guide({ cancelUrl: 'https://melon.com' }));
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: '해지 페이지로 이동' }));

  expect(await screen.findByText('페이지를 열지 못했어요')).toBeOnTheScreen();
});
