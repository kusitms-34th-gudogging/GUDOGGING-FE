import { render, screen, userEvent } from '@testing-library/react-native';

import { TextButton } from '@/components/common/TextButton';

describe('TextButton', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('누르면 onPress가 호출된다', async () => {
    const onPress = jest.fn();
    await render(<TextButton label="전체 보기" onPress={onPress} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '전체 보기' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disabled면 눌러도 onPress가 호출되지 않는다', async () => {
    const onPress = jest.fn();
    await render(<TextButton label="전체 보기" disabled onPress={onPress} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '전체 보기' }));

    expect(onPress).not.toHaveBeenCalled();
  });
});
