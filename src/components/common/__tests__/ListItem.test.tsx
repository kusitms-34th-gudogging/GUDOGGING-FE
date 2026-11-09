import { render, screen, userEvent, within } from '@testing-library/react-native';
import { View } from 'react-native';

import { ListItem } from '@/components/common/ListItem';

// 로고·아이콘은 텍스트·role이 없어서 testID로 찾음
const SvgLogo = () => <View testID="svg-logo" />;
const IconLeft = () => <View testID="icon-left" />;
const IconRight = () => <View testID="icon-right" />;

describe('ListItem', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('체크박스를 누르면 onCheckedChange가 반대 값으로 호출된다', async () => {
    const onCheckedChange = jest.fn();
    await render(
      <ListItem title="넷플릭스" showCheckBox checked={false} onCheckedChange={onCheckedChange} />,
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('checkbox', { name: '넷플릭스' }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it('checked가 체크박스 접근성 상태에 반영된다', async () => {
    await render(<ListItem title="넷플릭스" showCheckBox checked />);
    expect(screen.getByRole('checkbox', { checked: true })).toBeOnTheScreen();

    await render(<ListItem title="넷플릭스" showCheckBox checked={false} />);
    expect(screen.getByRole('checkbox', { checked: false })).toBeOnTheScreen();
  });

  it('iconRightAction이 있으면 오른쪽 아이콘을 눌러 onPress를 호출할 수 있다', async () => {
    const onPress = jest.fn();
    await render(
      <ListItem
        title="넷플릭스"
        iconRight={IconRight}
        showIconRight
        iconRightAction={{ accessibilityLabel: '더보기', onPress }}
      />,
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('button', { name: '더보기' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('iconRightAction이 없으면 오른쪽 아이콘은 보이지만 버튼이 아니다', async () => {
    await render(<ListItem title="넷플릭스" iconRight={IconRight} showIconRight />);

    expect(screen.getByTestId('icon-right')).toBeOnTheScreen();
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('logo에 svg 컴포넌트를 넘기면 컴포넌트로 그려진다', async () => {
    await render(<ListItem title="넷플릭스" logo={SvgLogo} showLogo />);

    expect(screen.getByTestId('svg-logo')).toBeOnTheScreen();
  });

  it('show 옵션을 켜면 각 요소가 보이고, 끄면 보이지 않는다', async () => {
    const props = {
      title: '넷플릭스',
      subtitle: '매월 5일',
      cost: '13,500원',
      logo: SvgLogo,
      iconLeft: IconLeft,
      iconRight: IconRight,
    };

    await render(
      <ListItem
        {...props}
        showLogo
        showIconLeft
        showSubtitle
        showCost
        showCheckBox
        showIconRight
      />,
    );
    expect(screen.getByTestId('svg-logo')).toBeOnTheScreen();
    expect(screen.getByTestId('icon-left')).toBeOnTheScreen();
    expect(screen.getByText('매월 5일')).toBeOnTheScreen();
    expect(screen.getByText('13,500원')).toBeOnTheScreen();
    expect(screen.getByRole('checkbox')).toBeOnTheScreen();
    expect(screen.getByTestId('icon-right')).toBeOnTheScreen();

    await render(<ListItem {...props} />);
    expect(screen.queryByTestId('svg-logo')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('icon-left')).not.toBeOnTheScreen();
    expect(screen.queryByText('매월 5일')).not.toBeOnTheScreen();
    expect(screen.queryByText('13,500원')).not.toBeOnTheScreen();
    expect(screen.queryByRole('checkbox')).not.toBeOnTheScreen();
    expect(screen.queryByTestId('icon-right')).not.toBeOnTheScreen();
  });

  it('iconRightAction이 있으면 오른쪽 글씨를 눌러도 onPress가 호출된다', async () => {
    const onPress = jest.fn();
    await render(
      <ListItem
        title="넷플릭스"
        cost="입력하기"
        showCost
        iconRight={IconRight}
        showIconRight
        iconRightAction={{ accessibilityLabel: '넷플릭스 입력하기', onPress }}
      />,
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByText('입력하기'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('체크박스가 없으면 행 어디를 눌러도 onPress가 호출된다', async () => {
    const onPress = jest.fn();
    await render(
      <ListItem
        title="넷플릭스"
        subtitle="결제 정보 입력 필요"
        showSubtitle
        iconRight={IconRight}
        showIconRight
        iconRightAction={{ accessibilityLabel: '넷플릭스 입력하기', onPress }}
      />,
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByText('결제 정보 입력 필요'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('체크박스가 있으면 행 가운데(제목)는 눌리지 않는다', async () => {
    const onPress = jest.fn();
    await render(
      <ListItem
        title="넷플릭스"
        cost="17,000원"
        showCost
        iconRightAction={{ accessibilityLabel: '넷플릭스 수정하기', onPress }}
        showCheckBox
      />,
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByText('넷플릭스'));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('체크박스는 오른쪽 글씨 버튼에 묶이지 않고 따로 눌린다', async () => {
    const onPress = jest.fn();
    const onCheckedChange = jest.fn();
    await render(
      <ListItem
        title="넷플릭스"
        cost="17,000원"
        showCost
        iconRightAction={{ accessibilityLabel: '넷플릭스 수정하기', onPress }}
        showCheckBox
        onCheckedChange={onCheckedChange}
      />,
    );

    const button = screen.getByRole('button', { name: '넷플릭스 수정하기' });
    expect(within(button).queryByRole('checkbox')).not.toBeOnTheScreen();

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByRole('checkbox', { name: '넷플릭스' }));

    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(onPress).not.toHaveBeenCalled();
  });
});
