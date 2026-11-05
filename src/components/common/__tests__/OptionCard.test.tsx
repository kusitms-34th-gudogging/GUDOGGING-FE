import { render, screen, userEvent } from '@testing-library/react-native';
import { View } from 'react-native';

import { OptionCard } from '@/components/common/OptionCard';

// 에셋은 텍스트·role이 없어서 testID로 찾음
const ColorAsset = () => <View testID="color-asset" />;
const MonoAsset = () => <View testID="mono-asset" />;

const baseProps = {
  title: '직접 입력',
  description: '구독 정보를 직접 입력해요',
  asset: ColorAsset,
  monoAsset: MonoAsset,
  onSelect: () => {},
};

describe('OptionCard', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('누르면 onSelect가 호출된다', async () => {
    const onSelect = jest.fn();
    await render(<OptionCard {...baseProps} selected={false} onSelect={onSelect} />);

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('radio'));

    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('selected가 접근성 상태에 반영된다', async () => {
    await render(<OptionCard {...baseProps} selected />);
    expect(screen.getByRole('radio', { selected: true })).toBeOnTheScreen();

    await render(<OptionCard {...baseProps} selected={false} />);
    expect(screen.getByRole('radio', { selected: false })).toBeOnTheScreen();
  });

  it('선택되면 컬러 에셋, 선택 안 되면 모노 에셋이 보인다', async () => {
    await render(<OptionCard {...baseProps} selected />);
    expect(screen.getByTestId('color-asset')).toBeOnTheScreen();
    expect(screen.queryByTestId('mono-asset')).not.toBeOnTheScreen();

    await render(<OptionCard {...baseProps} selected={false} />);
    expect(screen.getByTestId('mono-asset')).toBeOnTheScreen();
    expect(screen.queryByTestId('color-asset')).not.toBeOnTheScreen();
  });

  it('showAsset이 false면 에셋이 보이지 않는다', async () => {
    await render(<OptionCard {...baseProps} selected showAsset={false} />);
    expect(screen.queryByTestId('color-asset')).not.toBeOnTheScreen();

    await render(<OptionCard {...baseProps} selected={false} showAsset={false} />);
    expect(screen.queryByTestId('mono-asset')).not.toBeOnTheScreen();
  });

  it('설명은 기본으로 보이고, showDescription이 false면 보이지 않는다', async () => {
    await render(<OptionCard {...baseProps} selected={false} />);
    expect(screen.getByText('구독 정보를 직접 입력해요')).toBeOnTheScreen();

    await render(<OptionCard {...baseProps} selected={false} showDescription={false} />);
    expect(screen.queryByText('구독 정보를 직접 입력해요')).not.toBeOnTheScreen();
  });
});
