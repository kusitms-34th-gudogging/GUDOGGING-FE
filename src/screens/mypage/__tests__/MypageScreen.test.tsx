import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import MypageGmailRoute from '@/app/mypage/gmail';
import { MypageScreen } from '@/screens/mypage/MypageScreen';

test('Gmail 연동 행을 누르면 Gmail 연동 화면으로 이동한다', async () => {
  await renderRouter({ index: () => <MypageScreen />, 'mypage/gmail': MypageGmailRoute });

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연동' }));

  expect(screen).toHavePathname('/mypage/gmail');
});
