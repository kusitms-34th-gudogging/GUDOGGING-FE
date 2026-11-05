import { render, screen, userEvent } from '@testing-library/react-native';

import { Checkbox } from '@/components/common/Checkbox';

describe('Checkbox', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('체크 안 된 상태에서 누르면 onCheckedChange(true)가 호출된다', async () => {
    const onCheckedChange = jest.fn();
    await render(
      <Checkbox checked={false} onCheckedChange={onCheckedChange} accessibilityLabel="약관 동의" />,
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('checkbox', { name: '약관 동의' }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('체크된 상태에서 누르면 onCheckedChange(false)가 호출된다', async () => {
    const onCheckedChange = jest.fn();
    await render(
      <Checkbox checked onCheckedChange={onCheckedChange} accessibilityLabel="약관 동의" />,
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('checkbox', { name: '약관 동의' }));

    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('disabled면 눌러도 onCheckedChange가 호출되지 않는다', async () => {
    const onCheckedChange = jest.fn();
    await render(
      <Checkbox
        checked={false}
        disabled
        onCheckedChange={onCheckedChange}
        accessibilityLabel="약관 동의"
      />,
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('checkbox', { name: '약관 동의' }));

    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
