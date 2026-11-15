import { render, screen, userEvent } from '@testing-library/react-native';

import { MypageGmailScreen } from '@/screens/mypage/MypageGmailScreen';

test('연결하기를 누르면 연결된 Gmail 주소와 해제 버튼이 보인다', async () => {
  await render(<MypageGmailScreen />);
  expect(screen.queryByText('suum.mail@gmail.com')).toBeNull();

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결하기' }));

  expect(screen.getByText('suum.mail@gmail.com')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Gmail 연결 해제하기' })).toBeOnTheScreen();
});

test('연결 해제를 확인하면 미연결 상태로, 취소하면 연결 상태 그대로다', async () => {
  await render(<MypageGmailScreen />);
  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결하기' }));

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결 해제하기' }));
  await userEvent.press(screen.getByRole('button', { name: '취소' }));
  expect(screen.getByText('suum.mail@gmail.com')).toBeOnTheScreen();

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결 해제하기' }));
  await userEvent.press(screen.getByRole('button', { name: '연결 해제하기' }));
  expect(screen.queryByText('suum.mail@gmail.com')).toBeNull();
  expect(screen.getByRole('button', { name: 'Gmail 연결하기' })).toBeOnTheScreen();
});
