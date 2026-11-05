import { render, screen } from '@testing-library/react-native';
import { View } from 'react-native';

import { AssetTile } from '@/components/common/AssetTile';

// 에셋은 텍스트·role이 없어서 testID로 찾음
const TestAsset = () => <View testID="test-asset" />;

describe('AssetTile', () => {
  it('자유 톤에 asset을 주면 그 에셋이 그려진다', async () => {
    await render(<AssetTile tone="brand" asset={TestAsset} />);

    expect(screen.getByTestId('test-asset')).toBeOnTheScreen();
  });
});
