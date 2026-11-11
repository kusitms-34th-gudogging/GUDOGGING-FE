import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import SubscriptionDetailRoute from '@/app/manage/detail/[id]';
import { type EndedSubscription, ManageScreen } from '@/screens/manage/ManageScreen';
import type { HomeSubscription } from '@/utils/homeSummary';

// 오늘: 10월 16일
const day = (d: number) => new Date(2026, 9, d);
const active: HomeSubscription[] = [
  { id: 'b', name: '늦은 결제', amount: 10000, cycle: 1, unit: '개월', nextDate: day(20) },
  { id: 'a', name: '빠른 결제', amount: 29000, cycle: 1, unit: '개월', nextDate: day(17) },
];
const ended: EndedSubscription[] = [
  {
    id: 'c',
    name: '왓챠',
    amount: 7900,
    cycle: 1,
    unit: '개월',
    cancelledAt: day(10),
    totalSpent: 47400,
  },
];

const renderManage = async (props: Parameters<typeof ManageScreen>[0]) => {
  await renderRouter(
    {
      index: () => <ManageScreen {...props} />,
      'register/index': () => null,
      'manage/detail/[id]': () => null,
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

describe('ManageScreen', () => {
  it('구독이 없으면 빈 상태를 보여 주고, 구독 등록하기로 구독 추가에 간다', async () => {
    const user = await renderManage({ active: [], ended: [] });

    await user.press(screen.getByRole('button', { name: '구독 등록하기' }));

    expect(screen).toHavePathname('/register');
  });

  it('구독 중 탭은 결제일 순·월 합계, 구독 종료 탭은 해지 정보를 보여 준다', async () => {
    const user = await renderManage({ active, ended });

    expect(screen.getByText('월 39,000원')).toBeOnTheScreen();
    const titles = screen.getAllByText(/결제$/).map((t) => t.props.children);
    expect(titles).toEqual(['빠른 결제', '늦은 결제']);
    expect(screen.getByText('매월 17일 · D-1')).toBeOnTheScreen();

    await user.press(screen.getByRole('tab', { name: '구독 종료 1' }));

    expect(screen.getByText('월 7,900원 절약')).toBeOnTheScreen();
    expect(screen.getByText('10월 10일 해지 · 총 지출 47,400원')).toBeOnTheScreen();
  });

  it('더보기 → 삭제로 고른 구독만 확인 모달을 거쳐 목록에서 지운다', async () => {
    const user = await renderManage({ active, ended });

    await user.press(screen.getByRole('button', { name: '더보기' }));
    await user.press(screen.getByRole('menuitem', { name: '삭제' }));
    // 아무것도 안 골랐으면 삭제 못 함
    expect(screen.getByRole('button', { name: '선택한 구독 삭제' })).toBeDisabled();

    // 행 어디를 눌러도 체크
    await user.press(screen.getByText('빠른 결제'));
    expect(screen.getByText('1개 선택')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: '선택한 구독 삭제' }));
    expect(screen.getByText('구독 1개를 삭제할까요?')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: '삭제하기' }));

    expect(screen.queryByText('빠른 결제')).not.toBeOnTheScreen();
    expect(screen.getByText('늦은 결제')).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: '구독 중 1' })).toBeOnTheScreen();
    // 삭제가 끝나면 선택 모드에서 빠짐
    expect(screen.getByText('월 10,000원')).toBeOnTheScreen();
  });

  it('구독 중 행을 누르면 그 구독의 상세로 간다', async () => {
    const user = await renderManage({ active, ended });

    await user.press(screen.getByRole('button', { name: '빠른 결제 상세' }));

    expect(screen).toHavePathname('/manage/detail/a');
  });

  it('구독 종료 행도 같은 상세 경로로 간다', async () => {
    const user = await renderManage({ active, ended });

    await user.press(screen.getByRole('tab', { name: '구독 종료 1' }));
    await user.press(screen.getByRole('button', { name: '왓챠 상세' }));

    expect(screen).toHavePathname('/manage/detail/c');
  });

  it('상세 경로는 같은 id 체계에서 구독 상태에 따라 구독 중·지난 구독 화면을 고른다', async () => {
    await renderRouter(
      { index: () => <ManageScreen />, 'manage/detail/[id]': SubscriptionDetailRoute },
      { initialUrl: '/' },
    );
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

    await user.press(screen.getByRole('button', { name: 'Netflix 상세' }));
    expect(screen.getByRole('button', { name: '구독 점검' })).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: '뒤로 가기' }));
    await user.press(screen.getByRole('tab', { name: '구독 종료 2' }));
    await user.press(screen.getByRole('button', { name: '왓챠 상세' }));
    expect(screen.getByRole('button', { name: '재등록하기' })).toBeOnTheScreen();
  });
});
