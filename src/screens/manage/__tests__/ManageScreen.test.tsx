import { userEvent } from '@testing-library/react-native';
import { Slot } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

import SubscriptionDetailRoute from '@/app/manage/detail/[id]';
import { ToastProvider } from '@/components/common/ToastProvider';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
import { ManageScreen } from '@/screens/manage/ManageScreen';

const item = (over: object) => ({
  logoUrl: null,
  billingCycleValue: 1,
  billingCycleUnit: 'MONTH',
  nextBillingDate: null,
  dDay: null,
  canceledAt: null,
  totalPaidAmount: null,
  ...over,
});
const list = (subscriptions: object[], monthlyTotal: number) => ({
  count: subscriptions.length,
  activeCount: 2,
  endedCount: 1,
  monthlyTotal,
  subscriptions,
});
// 서버가 정렬해서 줌 (구독 중: 결제일 순)
const ACTIVE = list(
  [
    item({
      subscriptionId: 'a',
      serviceName: '빠른 결제',
      amount: 29000,
      monthlyAmount: 29000,
      nextBillingDate: '2026-10-17',
      dDay: 1,
    }),
    item({
      subscriptionId: 'b',
      serviceName: '늦은 결제',
      amount: 10000,
      // 구독 중 탭은 결제 금액 그대로 (월 환산이 아님)
      monthlyAmount: 3333,
      nextBillingDate: '2026-10-20',
      dDay: 4,
      billingCycleValue: 3,
    }),
  ],
  39000,
);
const ENDED = list(
  [
    // 연 결제: 구독 종료 탭 금액은 서버가 준 월 환산 금액(monthlyAmount)
    item({
      subscriptionId: 'c',
      serviceName: '왓챠',
      amount: 94800,
      monthlyAmount: 7900,
      billingCycleUnit: 'YEAR',
      canceledAt: '2026-10-10',
      totalPaidAmount: 47400,
    }),
  ],
  7900,
);
const routes = {
  'GET /api/v1/subscriptions': ACTIVE,
  'DELETE /api/v1/subscriptions': { deletedCount: 1 },
};

// 상태별 목록은 쿼리 문자열로 나뉘어 mockApi 경로가 같음 → 쿼리로 골라 응답
const mockLists = (extra: Record<string, unknown> = {}) => {
  const spy = mockApi({ ...routes, ...extra });
  const base = spy.getMockImplementation()!;
  spy.mockImplementation(async (input, init) =>
    String(input).includes('status=ENDED')
      ? new Response(JSON.stringify({ code: 200, data: ENDED }))
      : base(input, init),
  );
  return spy;
};

// 삭제 완료 토스트용 (앱에선 루트 레이아웃이 감쌈)
const ToastLayout = () => (
  <ToastProvider>
    <Slot />
  </ToastProvider>
);

const renderManage = async (detail = false) => {
  await renderRouter(
    {
      _layout: ToastLayout,
      index: () => <ManageScreen />,
      'register/index': () => null,
      'manage/detail/[id]': detail ? SubscriptionDetailRoute : () => null,
    },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(() => jest.useFakeTimers());
afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe('ManageScreen', () => {
  it('구독이 없으면 빈 상태를 보여 주고, 구독 등록하기로 구독 추가에 간다', async () => {
    mockApi({ 'GET /api/v1/subscriptions': { ...list([], 0), activeCount: 0, endedCount: 0 } });
    const user = await renderManage();

    await user.press(await screen.findByRole('button', { name: '구독 등록하기' }));

    expect(screen).toHavePathname('/register');
  });

  it('불러오지 못하면 다시 시도로 다시 요청한다', async () => {
    mockApi({ 'GET /api/v1/subscriptions': apiError(500) });
    const user = await renderManage();

    await user.press(await screen.findByRole('button', { name: '다시 시도' }));

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('구독 중 탭은 받은 순서·월 합계, 구독 종료 탭은 해지 정보를 보여 준다', async () => {
    mockLists();
    const user = await renderManage();

    expect(await screen.findByText('월 39,000원')).toBeOnTheScreen();
    const titles = screen.getAllByText(/결제$/).map((t) => t.props.children);
    expect(titles).toEqual(['빠른 결제', '늦은 결제']);
    expect(screen.getByText('매월 17일 · D-1')).toBeOnTheScreen();
    // 매월이 아니면 다음 결제일
    expect(screen.getByText('10월 20일 · D-4')).toBeOnTheScreen();

    await user.press(screen.getByRole('tab', { name: '구독 종료 1' }));

    expect(await screen.findByText('월 7,900원 절약')).toBeOnTheScreen();
    expect(screen.getByText('7,900원')).toBeOnTheScreen();
    expect(screen.getByText('10월 10일 해지 · 총 지출 47,400원')).toBeOnTheScreen();
  });

  it('더보기 → 삭제로 고른 구독만 확인 모달을 거쳐 삭제 API로 보낸다', async () => {
    const fetchSpy = mockLists();
    const user = await renderManage();

    await user.press(await screen.findByRole('button', { name: '더보기' }));
    await user.press(screen.getByRole('menuitem', { name: '삭제' }));
    // 아무것도 안 골랐으면 삭제 못 함
    expect(screen.getByRole('button', { name: '선택한 구독 삭제' })).toBeDisabled();

    // 행 어디를 눌러도 체크
    await user.press(screen.getByText('빠른 결제'));
    expect(screen.getByText('1개 선택')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: '선택한 구독 삭제' }));
    expect(screen.getByText('구독 1개를 삭제할까요?')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: '삭제하기' }));

    expect(await screen.findByText('구독 1개를 삭제했어요')).toBeOnTheScreen();
    const del = fetchSpy.mock.calls.find(([, init]) => init?.method === 'DELETE');
    expect(JSON.parse(String(del?.[1]?.body))).toEqual({ subscriptionIds: ['a'] });
    // 삭제가 끝나면 선택 모드에서 빠짐
    expect(screen.queryByText('1개 선택')).not.toBeOnTheScreen();
  });

  it('삭제에 실패하면 실패 안내를 보여 주고 선택 모드에 남는다', async () => {
    mockLists({ 'DELETE /api/v1/subscriptions': apiError(404) });
    const user = await renderManage();

    await user.press(await screen.findByRole('button', { name: '더보기' }));
    await user.press(screen.getByRole('menuitem', { name: '삭제' }));
    await user.press(screen.getByText('빠른 결제'));
    await user.press(screen.getByRole('button', { name: '선택한 구독 삭제' }));
    await user.press(screen.getByRole('button', { name: '삭제하기' }));

    expect(await screen.findByText('구독을 삭제하지 못했어요')).toBeOnTheScreen();
    expect(screen.getByText('1개 선택')).toBeOnTheScreen();
  });

  it('구독 중 행을 누르면 그 구독의 상세로 간다', async () => {
    mockLists();
    const user = await renderManage();

    await user.press(await screen.findByRole('button', { name: '빠른 결제 상세' }));

    expect(screen).toHavePathname('/manage/detail/a');
  });

  it('상세 경로는 구독 상태에 따라 구독 중·구독 종료 화면을 고른다', async () => {
    const detail = (status: string) => ({
      subscriptionId: 'a',
      status,
      serviceName: '빠른 결제',
      category: 'VIDEO_OTT',
      amount: 29000,
      billingCycleValue: 1,
      billingCycleUnit: 'MONTH',
      nextBillingDate: '2026-10-17',
      startedAt: '2026-01-17',
      paymentMethod: 'APP_STORE',
      isSteady: false,
      canceledAt: status === 'ENDED' ? '2026-10-10' : null,
      totalPaidAmount: 261000,
      latestCheckup: null,
      pastCheckupAverage: null,
    });
    mockLists({ 'GET /api/v1/subscriptions/a': detail('ACTIVE') });
    const user = await renderManage(true);

    await user.press(await screen.findByRole('button', { name: '빠른 결제 상세' }));
    expect(await screen.findByRole('button', { name: '구독 점검' })).toBeOnTheScreen();

    jest.restoreAllMocks();
    mockLists({ 'GET /api/v1/subscriptions/a': detail('ENDED') });
    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));
    await user.press(await screen.findByRole('button', { name: '빠른 결제 상세' }));
    expect(await screen.findByRole('button', { name: '재등록하기' })).toBeOnTheScreen();
  });
});
