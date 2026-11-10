import { render, screen } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Badge } from '@/components/common/Badge';

// 어느 쪽 아이콘이 그려졌는지 보이게 글자로 그리는 테스트용 아이콘
const LeftIcon = () => <Text>왼쪽 아이콘</Text>;
const RightIcon = () => <Text>오른쪽 아이콘</Text>;

describe('Badge', () => {
  it('아이콘은 기본으로 보이지 않는다', async () => {
    await render(<Badge label="확인" iconLeft={LeftIcon} iconRight={RightIcon} />);

    expect(screen.queryByText('왼쪽 아이콘')).not.toBeOnTheScreen();
    expect(screen.queryByText('오른쪽 아이콘')).not.toBeOnTheScreen();
  });

  it('showIconLeft면 왼쪽 아이콘만 보인다', async () => {
    await render(<Badge label="확인" iconLeft={LeftIcon} iconRight={RightIcon} showIconLeft />);

    expect(screen.getByText('왼쪽 아이콘')).toBeOnTheScreen();
    expect(screen.queryByText('오른쪽 아이콘')).not.toBeOnTheScreen();
  });

  it('showIconRight면 오른쪽 아이콘만 보인다', async () => {
    await render(<Badge label="확인" iconLeft={LeftIcon} iconRight={RightIcon} showIconRight />);

    expect(screen.queryByText('왼쪽 아이콘')).not.toBeOnTheScreen();
    expect(screen.getByText('오른쪽 아이콘')).toBeOnTheScreen();
  });
});
