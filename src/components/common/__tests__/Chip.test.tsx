import { render, screen, userEvent } from '@testing-library/react-native';

import { Chip } from '@/components/common/Chip';

describe('Chip', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('누르면 onSelect가 호출된다', async () => {
    const onSelect = jest.fn();
    await render(<Chip label="OTT" selected={false} onSelect={onSelect} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: 'OTT' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('selected면 선택 상태로 읽힌다', async () => {
    await render(<Chip label="OTT" selected onSelect={() => {}} />);

    expect(screen.getByRole('button', { name: 'OTT' })).toBeSelected();
  });
});
