import { render, screen, userEvent } from '@testing-library/react-native';

import { Toggle } from '@/components/common/Toggle';

describe('Toggle', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('꺼진 상태에서 누르면 onValueChange(true)가 호출된다', async () => {
    const onValueChange = jest.fn();
    await render(<Toggle value={false} onValueChange={onValueChange} accessibilityLabel="알림" />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('switch', { name: '알림' }));

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('켜진 상태에서 누르면 onValueChange(false)가 호출된다', async () => {
    const onValueChange = jest.fn();
    await render(<Toggle value onValueChange={onValueChange} accessibilityLabel="알림" />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('switch', { name: '알림' }));

    expect(onValueChange).toHaveBeenCalledWith(false);
  });
});
