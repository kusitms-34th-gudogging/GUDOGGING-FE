import { act, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

import { useGmailLink } from '@/hooks/useGmailLink';
import { MypageFailedScreen } from '@/screens/mypage/MypageFailedScreen';

// 배경 블러는 Skia 네이티브 렌더링이라 그리지 않음 (장식이라 화면 동작과 무관)
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: () => null,
  Circle: () => null,
  Blur: () => null,
  LinearGradient: () => null,
  vec: (x: number, y: number) => ({ x, y }),
}));

beforeEach(() => useGmailLink.setState({ gmail: null }));

const failing = () => Promise.reject(new Error('fail'));

// 직전 화면(Gmail 연동·회원 탈퇴)에서 실패 화면으로 들어온 상태
const renderFailed = async (kind: 'gmail' | 'withdraw', screenEl: React.ReactElement) => {
  await renderRouter({
    index: () => null,
    [`mypage/${kind}`]: () => null,
    [`mypage/${kind}-failed`]: () => screenEl,
    'mypage/withdraw-done': () => null,
  });
  await act(() => router.push(kind === 'gmail' ? '/mypage/gmail' : '/mypage/withdraw'));
  await act(() =>
    router.push(kind === 'gmail' ? '/mypage/gmail-failed' : '/mypage/withdraw-failed'),
  );
};

test('Gmail 다시 시도가 성공하면 연결하고 Gmail 연동 화면으로 돌아간다', async () => {
  await renderFailed(
    'gmail',
    <MypageFailedScreen kind="gmail" connectGmail={async () => 'a@gmail.com'} />,
  );

  await userEvent.press(screen.getByRole('button', { name: '다시 시도하기' }));

  expect(screen).toHavePathname('/mypage/gmail');
  expect(useGmailLink.getState().gmail).toBe('a@gmail.com');
});

test('Gmail 다시 시도가 또 실패하면 실패 화면에 남는다', async () => {
  await renderFailed('gmail', <MypageFailedScreen kind="gmail" connectGmail={failing} />);

  await userEvent.press(screen.getByRole('button', { name: '다시 시도하기' }));

  expect(screen).toHavePathname('/mypage/gmail-failed');
  expect(useGmailLink.getState().gmail).toBeNull();
});

test('탈퇴 다시 시도가 성공하면 데이터를 비우고 탈퇴 완료 화면으로 간다', async () => {
  useGmailLink.setState({ gmail: 'a@gmail.com' });
  await renderFailed('withdraw', <MypageFailedScreen kind="withdraw" withdraw={async () => {}} />);

  await userEvent.press(screen.getByRole('button', { name: '다시 시도하기' }));

  expect(screen).toHavePathname('/mypage/withdraw-done');
  expect(useGmailLink.getState().gmail).toBeNull();
});

test('탈퇴 다시 시도가 또 실패하면 데이터를 지우지 않고 실패 화면에 남는다', async () => {
  useGmailLink.setState({ gmail: 'a@gmail.com' });
  await renderFailed('withdraw', <MypageFailedScreen kind="withdraw" withdraw={failing} />);

  await userEvent.press(screen.getByRole('button', { name: '다시 시도하기' }));

  expect(screen).toHavePathname('/mypage/withdraw-failed');
  expect(useGmailLink.getState().gmail).toBe('a@gmail.com');
});

test('탈퇴 실패에서 취소하기를 누르면 회원 탈퇴 안내 화면으로 돌아간다', async () => {
  await renderFailed('withdraw', <MypageFailedScreen kind="withdraw" withdraw={failing} />);

  await userEvent.press(screen.getByRole('button', { name: '취소하기' }));

  expect(screen).toHavePathname('/mypage/withdraw');
});
