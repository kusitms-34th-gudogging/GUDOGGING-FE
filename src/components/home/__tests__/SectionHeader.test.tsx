import { render, screen } from '@testing-library/react-native';

import { SectionHeader } from '@/components/home/SectionHeader';

describe('SectionHeader', () => {
  it('showChevron이면 제목 옆에 화살표가 보인다', async () => {
    await render(<SectionHeader title="다가오는 결제" showChevron />);

    expect(screen.getByTestId('section-chevron')).toBeOnTheScreen();
  });

  it('showChevron이 없으면 화살표가 보이지 않는다', async () => {
    await render(<SectionHeader title="내 구독 정보" />);

    expect(screen.queryByTestId('section-chevron')).not.toBeOnTheScreen();
  });
});
