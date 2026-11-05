import { render, screen, userEvent } from '@testing-library/react-native';

import { DropdownOption } from '@/components/common/DropdownOption';

describe('DropdownOption', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('누르면 onSelect가 호출된다', async () => {
    const onSelect = jest.fn();
    await render(<DropdownOption label="매월" selected={false} onSelect={onSelect} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('menuitem', { name: '매월' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('selected면 선택 상태로 읽힌다', async () => {
    await render(<DropdownOption label="매월" selected onSelect={() => {}} />);

    expect(screen.getByRole('menuitem', { name: '매월' })).toBeSelected();
  });
});
