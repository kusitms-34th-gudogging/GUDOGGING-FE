import { render, screen } from '@testing-library/react-native';

import { TextArea } from '@/components/common/TextArea';

describe('TextArea', () => {
  it('입력한 글자 수와 최대 글자 수를 보여준다', async () => {
    await render(<TextArea accessibilityLabel="메모" value="구독 유지" maxLength={50} />);

    expect(screen.getByText('5/50')).toBeOnTheScreen();
  });

  it('maxLength를 입력창에 넘겨 글자 수를 제한한다', async () => {
    await render(<TextArea accessibilityLabel="메모" value="" maxLength={100} />);

    expect(screen.getByLabelText('메모')).toHaveProp('maxLength', 100);
  });

  it('maxLength가 없으면 글자 수를 보여주지 않는다', async () => {
    await render(<TextArea accessibilityLabel="메모" value="구독 유지" />);

    expect(screen.queryByText(/^5\//)).not.toBeOnTheScreen();
  });
});
