import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import type { Home } from '@/hooks/useHome';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
import { HomeScreen } from '@/screens/home/HomeScreen';

const payment = (id: string, name: string, date: string, dDay: number, needsCheckup = true) => ({
  subscriptionId: id,
  serviceName: name,
  logoUrl: null,
  amount: 10000,
  nextBillingDate: date,
  dDay,
  needsCheckup,
});
const unused = (id: string, name: string, scorePercent: number) => ({
  subscriptionId: id,
  serviceName: name,
  logoUrl: null,
  amount: 10000,
  scorePercent,
});

const home = (over: Partial<Home> = {}): Home => ({
  summary: { expectedAmount: 0, yearlyAmount: 0, subscriptionCount: 0, logos: [] },
  upcomingPayments: [],
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
      'manage/detail/[id]': () => null,
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

    expect(screen.queryByText('구독 점검하기')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: '구독 추가' })).not.toBeOnTheScreen();
    expect(screen).toHavePathname('/register');
  });

  it('점검할 구독은 결제일·D-n과 함께 보이고, 행을 누르면 그 구독 점검에 간다', async () => {
    const user = await renderHome(
      home({
        summary: subscribed,
        upcomingPayments: [payment('netflix', '넷플릭스', '2026-10-30', 14)],
      }),
    );

    expect(await screen.findByText('10월 30일 결제 · D-14')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: '넷플릭스 점검하기' }));
    expect(screen).toHavePathname('/checkup/netflix');
    expect(screen).toHaveSearchParams({ id: 'netflix', restart: '1' });
  });

  it('이번 주기 점검을 마친 구독(needsCheckup false)은 점검으로 갈 수 없다', async () => {
    await renderHome(
      home({
        summary: subscribed,
        upcomingPayments: [payment('netflix', '넷플릭스', '2026-10-30', 14, false)],
      }),
    );

    expect(await screen.findByText('10월 30일 결제 · D-14')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: '넷플릭스 점검하기' })).not.toBeOnTheScreen();
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
          items: [unused('netflix', '넷플릭스', 39), unused('tving', '티빙', 40)],
        },
      }),
    );

    expect(await screen.findByText('월 13,500원 결제')).toBeOnTheScreen();
    expect(screen.getByText('넷플릭스')).toBeOnTheScreen();
    // 활용도 구간: 40% 미만 해지 추천, 40–59% 해지 고려
    expect(screen.getByText('39% 해지 추천')).toBeOnTheScreen();
    expect(screen.getByText('40% 해지 고려')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: '점검하러 가기' })).not.toBeOnTheScreen();
  });

  it('잘 안 쓰는 구독 행을 누르면 그 구독 상세로 간다', async () => {
    const user = await renderHome(
      home({
        summary: subscribed,
        usage: {
          ...home().usage,
          hasCheckup: true,
          items: [unused('netflix', '넷플릭스', 45)],
        },
      }),
    );

    await user.press(await screen.findByRole('button', { name: '넷플릭스 상세' }));
    expect(screen).toHavePathname('/manage/detail/netflix');
  });

  it('구독 점검하기 화살표를 누르면 캘린더로 간다', async () => {
    const user = await renderHome(home({ summary: subscribed }));

    await user.press(await screen.findByRole('button', { name: '구독 점검하기' }));
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
