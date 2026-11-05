import { render, screen, userEvent } from '@testing-library/react-native';

import { SegmentedControl } from '@/components/common/SegmentedControl';

const OPTIONS = [
  { value: 'monthly', label: '월간' },
  { value: 'yearly', label: '연간' },
] as const;

describe('SegmentedControl', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('옵션을 누르면 onSelect(그 옵션의 value)가 호출된다', async () => {
    const onSelect = jest.fn();
    await render(<SegmentedControl options={OPTIONS} selected="monthly" onSelect={onSelect} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('tab', { name: '연간' }));

    expect(onSelect).toHaveBeenCalledWith('yearly');
  });

  it('selected와 같은 옵션만 선택 상태로 읽힌다', async () => {
    await render(<SegmentedControl options={OPTIONS} selected="yearly" onSelect={() => {}} />);

    expect(screen.getByRole('tab', { name: '연간' })).toBeSelected();
    expect(screen.getByRole('tab', { name: '월간' })).not.toBeSelected();
  });
});
