import { render, screen, userEvent } from '@testing-library/react-native';

import { Segment } from '@/components/common/Segment';

describe('Segment', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('누르면 onSelect가 호출된다', async () => {
    const onSelect = jest.fn();
    await render(<Segment label="월간" selected={false} onSelect={onSelect} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('tab', { name: '월간' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('selected면 선택 상태로 읽힌다', async () => {
    await render(<Segment label="월간" selected onSelect={() => {}} />);

    expect(screen.getByRole('tab', { name: '월간' })).toBeSelected();
  });
});
