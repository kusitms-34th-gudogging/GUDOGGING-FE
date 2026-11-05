import { render, screen, userEvent } from '@testing-library/react-native';
import { View } from 'react-native';

import { TabItem } from '@/components/common/TabItem';

const TestIcon = () => <View />;

describe('TabItem', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('누르면 onSelect가 호출된다', async () => {
    const onSelect = jest.fn();
    await render(
      <TabItem icon={TestIcon} accessibilityLabel="홈" selected={false} onSelect={onSelect} />,
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('tab', { name: '홈' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('selected면 선택 상태로 읽힌다', async () => {
    await render(<TabItem icon={TestIcon} accessibilityLabel="홈" selected onSelect={() => {}} />);

    expect(screen.getByRole('tab', { name: '홈' })).toBeSelected();
  });
});
