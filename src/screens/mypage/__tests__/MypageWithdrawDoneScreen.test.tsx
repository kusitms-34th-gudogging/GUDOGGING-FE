import { act, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

import { MypageWithdrawDoneScreen } from '@/screens/mypage/MypageWithdrawDoneScreen';

// 배경 블러는 Skia 네이티브 렌더링이라 그리지 않음 (장식이라 화면 동작과 무관)
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: () => null,
  Circle: () => null,
  Blur: () => null,
  LinearGradient: () => null,
  vec: (x: number, y: number) => ({ x, y }),
}));

test('확인을 누르면 로그인 화면만 남기고 이전 계정 화면으로 돌아갈 수 없다', async () => {
  await renderRouter({
    index: () => null,
    'mypage/withdraw': () => null,
    'mypage/withdraw-done': MypageWithdrawDoneScreen,
    login: () => null,
  });
  // 실패 후 재시도로 탈퇴한 경우: 마이페이지 → 탈퇴 → 완료
  await act(() => router.push('/mypage/withdraw'));
  await act(() => router.push('/mypage/withdraw-done'));

  await userEvent.press(screen.getByRole('button', { name: '확인' }));

  expect(screen).toHavePathname('/login');
  expect(router.canGoBack()).toBe(false);
});
