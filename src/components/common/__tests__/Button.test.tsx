import { render, screen, userEvent } from '@testing-library/react-native';
import { View } from 'react-native';

import { Button } from '@/components/common/Button';

// 아이콘은 텍스트·role이 없어서 testID로 찾음
const TestIcon = () => <View testID="button-icon" />;

describe('Button', () => {
  it('누르면 onPress가 호출된다', async () => {
    const onPress = jest.fn();
    await render(<Button label="저장" onPress={onPress} />);

    await userEvent.setup().press(screen.getByRole('button', { name: '저장' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disabled면 눌러도 onPress가 호출되지 않는다', async () => {
    const onPress = jest.fn();
    await render(<Button label="저장" disabled onPress={onPress} />);

    await userEvent.setup().press(screen.getByRole('button', { name: '저장' }));

    expect(onPress).not.toHaveBeenCalled();
  });

  it('showIcon과 icon이 둘 다 있으면 아이콘이 보인다', async () => {
    await render(<Button label="저장" showIcon icon={TestIcon} />);

    expect(screen.getByTestId('button-icon')).toBeOnTheScreen();
  });

  it('icon이 있어도 showIcon이 없으면 아이콘이 보이지 않는다', async () => {
    await render(<Button label="저장" icon={TestIcon} />);

    expect(screen.queryByTestId('button-icon')).not.toBeOnTheScreen();
  });
});
