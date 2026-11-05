import { render, screen, userEvent } from '@testing-library/react-native';

import { Cta } from '@/components/common/Cta';

describe('Cta', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('누르면 onPress가 호출된다', async () => {
    const onPress = jest.fn();
    await render(<Cta label="다음" onPress={onPress} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '다음' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disabled면 눌러도 onPress가 호출되지 않는다', async () => {
    const onPress = jest.fn();
    await render(<Cta label="다음" disabled onPress={onPress} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '다음' }));

    expect(onPress).not.toHaveBeenCalled();
  });
});
