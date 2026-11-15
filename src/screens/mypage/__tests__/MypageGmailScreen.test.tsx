import { act, render, userEvent } from '@testing-library/react-native';
import { router, Slot } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

import { ToastProvider } from '@/components/common/ToastProvider';
import { useGmailLink } from '@/hooks/useGmailLink';
import { MypageGmailScreen } from '@/screens/mypage/MypageGmailScreen';

// 연결 상태가 화면 밖(스토어)에 남으므로 테스트마다 미연결로 시작
beforeEach(() => useGmailLink.setState({ gmail: null }));

const failing = () => Promise.reject(new Error('fail'));

// 해제 실패 토스트용 (앱에선 루트 레이아웃이 감쌈)
const ToastLayout = () => (
  <ToastProvider>
    <Slot />
  </ToastProvider>
);
const wrapper = { wrapper: ToastProvider };

// 마이페이지(index) → Gmail 연동 화면으로 들어온 상태
const renderFromMypage = async (props: Parameters<typeof MypageGmailScreen>[0] = {}) => {
  await renderRouter({
    _layout: ToastLayout,
    index: () => null,
    'mypage/gmail': () => <MypageGmailScreen {...props} />,
    'mypage/gmail-failed': () => null,
  });
  await act(() => router.push('/mypage/gmail'));
};

test('연결하기를 누르면 연결된 Gmail 주소와 해제 버튼이 보인다', async () => {
  await render(<MypageGmailScreen />, wrapper);
  expect(screen.queryByText('suum.mail@gmail.com')).toBeNull();

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결하기' }));

  expect(screen.getByText('suum.mail@gmail.com')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Gmail 연결 해제하기' })).toBeOnTheScreen();
});

test('연결된 상태로 다시 들어오면 연결됨 화면이 보인다', async () => {
  useGmailLink.setState({ gmail: 'other@gmail.com' });
  await render(<MypageGmailScreen />, wrapper);

  expect(screen.getByText('other@gmail.com')).toBeOnTheScreen();
  expect(screen.getByRole('button', { name: 'Gmail 연결 해제하기' })).toBeOnTheScreen();
});

test('Google 계정 선택을 취소하면 연동하지 않고 마이페이지로 돌아간다', async () => {
  await renderFromMypage({ connectGmail: async () => null });

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결하기' }));

  expect(screen).toHavePathname('/');
  expect(useGmailLink.getState().gmail).toBeNull();
});

test('연결이 실패하면 연동 실패 화면으로 이동한다', async () => {
  await renderFromMypage({ connectGmail: failing });

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결하기' }));

  expect(screen).toHavePathname('/mypage/gmail-failed');
});

test('연결 해제를 확인하면 미연결 상태로, 취소하면 연결 상태 그대로다', async () => {
  await render(<MypageGmailScreen />, wrapper);
  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결하기' }));

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결 해제하기' }));
  await userEvent.press(screen.getByRole('button', { name: '취소' }));
  expect(screen.getByText('suum.mail@gmail.com')).toBeOnTheScreen();

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결 해제하기' }));
  await userEvent.press(screen.getByRole('button', { name: '연결 해제하기' }));
  expect(screen.queryByText('suum.mail@gmail.com')).toBeNull();
  expect(screen.getByRole('button', { name: 'Gmail 연결하기' })).toBeOnTheScreen();
});

test('연결 해제가 실패하면 연결 상태를 유지하고 오류를 알린다', async () => {
  useGmailLink.setState({ gmail: 'suum.mail@gmail.com' });
  await render(<MypageGmailScreen disconnectGmail={failing} />, wrapper);

  await userEvent.press(screen.getByRole('button', { name: 'Gmail 연결 해제하기' }));
  await userEvent.press(screen.getByRole('button', { name: '연결 해제하기' }));

  expect(screen.getByText('연결을 해제하지 못했어요. 다시 시도해 주세요.')).toBeOnTheScreen();
  expect(screen.getByText('suum.mail@gmail.com')).toBeOnTheScreen();
  expect(useGmailLink.getState().gmail).toBe('suum.mail@gmail.com');
});
