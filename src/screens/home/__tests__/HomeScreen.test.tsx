import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import type { Home } from '@/hooks/useHome';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
import { HomeScreen } from '@/screens/home/HomeScreen';

const payment = (id: string, name: string, date: string, dDay: number) => ({
  subscriptionId: id,
  serviceName: name,
  logoUrl: null,
  amount: 10000,
  nextBillingDate: date,
  dDay,
});

const home = (over: Partial<Home> = {}): Home => ({
  summary: { expectedAmount: 0, yearlyAmount: 0, subscriptionCount: 0, logos: [] },
  upcomingPayments: [],
  nearestPayment: null,
  usage: {
    hasCheckup: false,
    nudgeSubscriptionId: null,
    unusedCount: 0,
    monthlyAmount: 0,
    yearlyAmount: 0,
    items: [],
  },
  hasUnreadNotification: false,
  ...over,
});
const subscribed = { expectedAmount: 20000, yearlyAmount: 240000, subscriptionCount: 2, logos: [] };

const renderHome = async (response: unknown) => {
  mockApi({ 'GET /api/v1/home': response });
  await renderRouter(
    {
      index: () => <HomeScreen />,
      'register/index': () => null,
      'checkup/[id]': () => null,
      calendar: () => null,
      notification: () => null,
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

describe('HomeScreen', () => {
  it('불러오는 동안 로딩을 보여 준다', async () => {
    await renderHome(home());

    expect(screen.getByLabelText('불러오는 중')).toBeOnTheScreen();
    expect(await screen.findByText('아직 등록된 구독이 없어요')).toBeOnTheScreen();
  });

  it('불러오지 못하면 다시 시도로 다시 요청한다', async () => {
    const user = await renderHome(apiError(500));

    await user.press(await screen.findByRole('button', { name: '다시 시도' }));

    expect(globalThis.fetch).toHaveBeenCalledTimes(2);
  });

  it('구독 수와 결제 예정액은 응답 값 그대로 보여 준다', async () => {
    await renderHome(home({ summary: subscribed }));

    expect(await screen.findByText('2개 구독 중이에요')).toBeOnTheScreen();
    expect(screen.getByText('20,000원')).toBeOnTheScreen();
    expect(screen.getByText('연 240,000원')).toBeOnTheScreen();
  });

  it('등록된 구독이 없으면 빈 상태를 보여 주고, 구독 등록하기로 구독 추가에 간다', async () => {
    const user = await renderHome(home());

    await user.press(await screen.findByRole('button', { name: '구독 등록하기' }));

    expect(screen.queryByText('다가오는 결제')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: '구독 추가' })).not.toBeOnTheScreen();
    expect(screen).toHavePathname('/register');
  });

  it('7일 안 결제는 D-n과 함께 보이고, 점검이 필요한 구독만 눌러서 점검에 간다', async () => {
    const user = await renderHome(
      home({
        summary: subscribed,
        upcomingPayments: [
          { ...payment('netflix', '넷플릭스', '2026-10-17', 1), needsCheckup: true },
          { ...payment('youtube', '유튜브', '2026-10-19', 3), needsCheckup: false },
        ],
      }),
    );

    expect(await screen.findByText('10월 17일 결제 · D-1')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: '유튜브 점검하기' })).not.toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: '넷플릭스 점검하기' }));
    expect(screen).toHavePathname('/checkup/netflix');
    expect(screen).toHaveSearchParams({ id: 'netflix', restart: '1' });
  });

  it('7일 안 결제가 없으면 안내 문구와 가장 가까운 1건을 보여 준다', async () => {
    await renderHome(
      home({ summary: subscribed, nearestPayment: payment('far', '먼 구독', '2026-10-30', 14) }),
    );

    expect(await screen.findByText('7일 안에 결제 예정인 구독이 없어요')).toBeOnTheScreen();
    expect(screen.getByText('10월 30일 결제')).toBeOnTheScreen();
  });

  it('점검 기록이 없으면 점검 유도 카드로, 응답이 고른 구독의 점검에 간다', async () => {
    const user = await renderHome(
      home({ summary: subscribed, usage: { ...home().usage, nudgeSubscriptionId: 'soon' } }),
    );

    await user.press(await screen.findByRole('button', { name: '점검하러 가기' }));
    expect(screen).toHavePathname('/checkup/soon');
  });

  it('점검 기록이 있으면 잘 안 쓰는 구독과 월 합계를 보여 준다', async () => {
    await renderHome(
      home({
        summary: subscribed,
        usage: {
          ...home().usage,
          hasCheckup: true,
          monthlyAmount: 13500,
          items: [payment('netflix', '넷플릭스', '2026-10-17', 1)],
        },
      }),
    );

    expect(await screen.findByText('월 13,500원 결제')).toBeOnTheScreen();
    expect(screen.getByText('넷플릭스')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: '점검하러 가기' })).not.toBeOnTheScreen();
  });

  it('다가오는 결제 화살표를 누르면 캘린더로 간다', async () => {
    const user = await renderHome(home({ summary: subscribed }));

    await user.press(await screen.findByRole('button', { name: '다가오는 결제' }));
    expect(screen).toHavePathname('/calendar');
  });

  it('+ 버튼을 누르면 구독 추가로 간다', async () => {
    const user = await renderHome(home({ summary: subscribed }));

    await user.press(await screen.findByRole('button', { name: '구독 추가' }));
    expect(screen).toHavePathname('/register');
  });

  it('종 아이콘을 누르면 알림 목록으로 간다', async () => {
    const user = await renderHome(home());

    await user.press(await screen.findByRole('button', { name: '알림' }));
    expect(screen).toHavePathname('/notification');
  });
});
