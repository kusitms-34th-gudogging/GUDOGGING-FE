import { render, screen, userEvent } from '@testing-library/react-native';

import { TabBar } from '@/components/common/TabBar';

describe('TabBar', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('캘린더 탭을 누르면 onSelect("calendar")가 호출된다', async () => {
    const onSelect = jest.fn();
    await render(<TabBar selected="home" onSelect={onSelect} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('tab', { name: '캘린더' }));

    expect(onSelect).toHaveBeenCalledWith('calendar');
  });

  it('선택된 탭만 선택 상태로 읽힌다', async () => {
    await render(<TabBar selected="mypage" onSelect={() => {}} />);

    expect(screen.getByRole('tab', { name: '마이페이지' })).toBeSelected();
    expect(screen.getByRole('tab', { name: '홈' })).not.toBeSelected();
  });
});
