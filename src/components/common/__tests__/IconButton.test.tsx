import { render, screen, userEvent } from '@testing-library/react-native';
import { View } from 'react-native';

import { IconButton } from '@/components/common/IconButton';

const TestIcon = () => <View />;

describe('IconButton', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('누르면 onPress가 호출된다', async () => {
    const onPress = jest.fn();
    await render(<IconButton icon={TestIcon} accessibilityLabel="추가" onPress={onPress} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '추가' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
