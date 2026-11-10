import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { HomeScreen } from '@/screens/home/HomeScreen';
import type { HomeSubscription } from '@/utils/homeSummary';

// 오늘: 10월 16일
const day = (d: number) => new Date(2026, 9, d);
const sub = (over: Partial<HomeSubscription> & { id: string }): HomeSubscription => ({
  name: over.id,
  amount: 10000,
  cycle: 1,
  unit: '개월',
  ...over,
});

const renderHome = async (subscriptions: HomeSubscription[]) => {
  await renderRouter(
    {
      index: () => <HomeScreen subscriptions={subscriptions} />,
      'register/index': () => null,
      'checkup/[id]': () => null,
      calendar: () => null,
    },
    { initialUrl: '/' },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date(2026, 9, 16, 10));
});
afterEach(() => jest.useRealTimers());

describe('HomeScreen', () => {
  it('등록된 구독이 없으면 빈 상태를 보여 주고, 구독 등록하기로 구독 추가에 간다', async () => {
    const user = await renderHome([]);

    expect(screen.getByText('아직 등록된 구독이 없어요')).toBeOnTheScreen();
    expect(screen.queryByText('다가오는 결제')).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: '구독 추가' })).not.toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: '구독 등록하기' }));
    expect(screen).toHavePathname('/register');
  });

  it('7일 안 결제는 D-n과 함께 보이고, 점검 안 한 구독만 눌러서 점검에 간다', async () => {
    const user = await renderHome([
      sub({ id: 'netflix', name: '넷플릭스', nextDate: day(17), usage: 45 }),
      sub({ id: 'youtube', name: '유튜브', nextDate: day(19), checked: true }),
    ]);

    expect(screen.getByText('10월 17일 결제 · D-1')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: '유튜브 점검하기' })).not.toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: '넷플릭스 점검하기' }));
    expect(screen).toHavePathname('/checkup/netflix');
    expect(screen).toHaveSearchParams({ id: 'netflix', restart: '1' });
  });

  it('7일 안 결제가 없으면 안내 문구와 가장 가까운 1건을 보여 준다', async () => {
    await renderHome([
      sub({ id: 'far', name: '먼 구독', nextDate: day(30), usage: 45 }),
      sub({ id: 'farther', name: '더 먼 구독', nextDate: new Date(2026, 10, 20) }),
    ]);

    expect(screen.getByText('7일 안에 결제 예정인 구독이 없어요')).toBeOnTheScreen();
    expect(screen.getByText('10월 30일 결제')).toBeOnTheScreen();
    expect(screen.queryByText('더 먼 구독')).not.toBeOnTheScreen();
  });

  it('점검 기록이 없으면 점검 유도 카드로, 결제일이 가장 가까운 구독의 점검에 간다', async () => {
    const user = await renderHome([
      sub({ id: 'later', nextDate: day(25) }),
      sub({ id: 'soon', nextDate: day(18) }),
    ]);

    await user.press(screen.getByRole('button', { name: '점검하러 가기' }));
    expect(screen).toHavePathname('/checkup/soon');
  });

  it('다가오는 결제 화살표를 누르면 캘린더로 간다', async () => {
    const user = await renderHome([sub({ id: 'a', nextDate: day(17) })]);

    await user.press(screen.getByRole('button', { name: '다가오는 결제' }));
    expect(screen).toHavePathname('/calendar');
  });

  it('+ 버튼을 누르면 구독 추가로 간다', async () => {
    const user = await renderHome([sub({ id: 'a', nextDate: day(17) })]);

    await user.press(screen.getByRole('button', { name: '구독 추가' }));
    expect(screen).toHavePathname('/register');
  });
});
