import { render, screen, userEvent } from '@testing-library/react-native';

import { Dropdown } from '@/components/common/Dropdown';

const OPTIONS = ['매월', '매년'];

const baseProps = { label: '결제 주기', placeholder: '선택해주세요', onPress: () => {} };

describe('Dropdown', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('value가 없으면 placeholder가 보인다', async () => {
    await render(<Dropdown {...baseProps} />);

    expect(screen.getByText('선택해주세요')).toBeOnTheScreen();
  });

  it.each([
    [true, true],
    [false, false],
  ])('error가 %s면 안내 문구를 보여 줄지: %s', async (error, shown) => {
    await render(<Dropdown {...baseProps} error={error} helper="결제 주기를 확인해 주세요." />);

    expect(!!screen.queryByText('결제 주기를 확인해 주세요.')).toBe(shown);
  });

  it('누르면 onPress가 호출된다', async () => {
    const onPress = jest.fn();
    await render(<Dropdown {...baseProps} onPress={onPress} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '결제 주기' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('닫혀 있으면 옵션이 보이지 않는다', async () => {
    await render(<Dropdown {...baseProps} options={OPTIONS} />);

    expect(screen.queryByRole('menuitem')).not.toBeOnTheScreen();
  });

  it('열려 있을 때 옵션을 누르면 onSelect(옵션)이 호출된다', async () => {
    const onSelect = jest.fn();
    await render(<Dropdown {...baseProps} open options={OPTIONS} onSelect={onSelect} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('menuitem', { name: '매년' }));

    expect(onSelect).toHaveBeenCalledWith('매년');
  });

  it('value와 같은 옵션만 선택 상태로 읽힌다', async () => {
    await render(<Dropdown {...baseProps} open value="매월" options={OPTIONS} />);

    expect(screen.getByRole('menuitem', { name: '매월' })).toBeSelected();
    expect(screen.getByRole('menuitem', { name: '매년' })).not.toBeSelected();
  });
});
