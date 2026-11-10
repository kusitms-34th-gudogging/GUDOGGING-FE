import { render, screen, userEvent } from '@testing-library/react-native';

import { FloatingButton } from '@/components/common/FloatingButton';

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('누르면 onPress가 호출된다', async () => {
  const onPress = jest.fn();
  await render(<FloatingButton accessibilityLabel="구독 추가" onPress={onPress} />);

  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(screen.getByRole('button', { name: '구독 추가' }));

  expect(onPress).toHaveBeenCalledTimes(1);
});
