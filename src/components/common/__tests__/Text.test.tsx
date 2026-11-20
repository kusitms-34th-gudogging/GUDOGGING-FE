import { render, screen } from '@testing-library/react-native';

import { Text } from '@/components/common/Text';

describe('Text', () => {
  it('시스템 글자 크기를 따르지 않는다', async () => {
    await render(<Text>구독</Text>);

    expect(screen.getByText('구독')).toHaveProp('allowFontScaling', false);
  });
});
