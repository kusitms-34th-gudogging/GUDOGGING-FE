import { render, screen, userEvent } from '@testing-library/react-native';

import { CalendarDay, type CalendarDaySubscription } from '@/components/calendar/CalendarDay';

const LOGO = { uri: 'logo.png' };
const SUBS: CalendarDaySubscription[] = [
  { id: 'netflix', name: '넷플릭스', category: 'ott', logo: LOGO },
  { id: 'spotify', name: '스포티파이', category: 'music', logo: LOGO },
  { id: 'tving', name: '티빙', category: 'ott', logo: LOGO },
  { id: 'coupang', name: '쿠팡 와우', category: 'shopping', logo: LOGO },
];

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

describe('CalendarDay', () => {
  it('로고는 2개까지 보이고 나머지 개수는 +N으로 보인다', async () => {
    await render(<CalendarDay date={17} subscriptions={SUBS.slice(0, 3)} />);

    expect(screen.getByLabelText('넷플릭스')).toBeOnTheScreen();
    expect(screen.getByLabelText('스포티파이')).toBeOnTheScreen();
    expect(screen.queryByLabelText('티빙')).not.toBeOnTheScreen();
    expect(screen.getByText('+1')).toBeOnTheScreen();
  });

  it('로고가 2개 이하면 +N이 없다', async () => {
    await render(<CalendarDay date={17} subscriptions={SUBS.slice(0, 2)} />);

    expect(screen.queryByText(/^\+/)).not.toBeOnTheScreen();
  });

  it('서비스명은 3개까지만 보인다', async () => {
    await render(<CalendarDay date={17} subscriptions={SUBS} display="name" />);

    expect(screen.getByText('넷플릭스')).toBeOnTheScreen();
    expect(screen.getByText('스포티파이')).toBeOnTheScreen();
    expect(screen.getByText('티빙')).toBeOnTheScreen();
    expect(screen.queryByText('쿠팡 와우')).not.toBeOnTheScreen();
  });

  it('다른 달 날짜면 구독 내용이 없고 눌러도 onPress가 불리지 않는다', async () => {
    const onPress = jest.fn();
    await render(
      <CalendarDay date={3} subscriptions={SUBS} display="name" disabled onPress={onPress} />,
    );

    expect(screen.queryByText('넷플릭스')).not.toBeOnTheScreen();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '3' }));
    expect(onPress).not.toHaveBeenCalled();
  });

  it('누르면 onPress가 불리고 selected가 선택 상태로 전달된다', async () => {
    const onPress = jest.fn();
    await render(<CalendarDay date={20} selected onPress={onPress} />);

    const day = screen.getByRole('button', { name: '20' });
    expect(day).toBeSelected();
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(day);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
