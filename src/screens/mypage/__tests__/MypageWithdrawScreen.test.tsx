import { onlineManager } from '@tanstack/react-query';
import { act, userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { apiError, createQueryWrapper, mockApi } from '@/lib/testing';
import { MypageWithdrawScreen } from '@/screens/mypage/MypageWithdrawScreen';

const WITHDRAW = 'DELETE /api/v1/users/me';

const renderFromMypage = async (response: unknown = null) => {
  mockApi({ [WITHDRAW]: response });
  await renderRouter(
    {
      index: () => null,
      'mypage/withdraw': () => <MypageWithdrawScreen />,
      'mypage/withdraw-failed': () => null,
      'mypage/withdraw-done': () => null,
    },
    { initialUrl: '/', wrapper: createQueryWrapper() },
  );
  await act(() => router.push('/mypage/withdraw'));
};
const withdrawCalls = () =>
  jest.mocked(globalThis.fetch).mock.calls.filter(([, i]) => i?.method === 'DELETE').length;
// 팝업의 탈퇴하기 (화면 버튼과 이름이 같아 마지막 것)
const confirmWithdraw = async () => {
  await userEvent.press(screen.getByRole('button', { name: '탈퇴하기' }));
  await userEvent.press(screen.getAllByRole('button', { name: '탈퇴하기' }).at(-1)!);
};

beforeEach(() => useRegisterDraft.setState({ selectedIds: ['netflix'] }));
afterEach(() => jest.restoreAllMocks());

test('최종 확인에서 탈퇴하기를 누르면 탈퇴하고 기기 데이터를 비운 뒤 탈퇴 완료 화면으로 간다', async () => {
  await renderFromMypage();

  await confirmWithdraw();

  expect(screen).toHavePathname('/mypage/withdraw-done');
  expect(withdrawCalls()).toBe(1);
  expect(useRegisterDraft.getState().selectedIds).toEqual([]);
});

test('취소를 누르면 탈퇴하지 않고 마이페이지로 돌아간다', async () => {
  await renderFromMypage();

  await userEvent.press(screen.getByRole('button', { name: '취소' }));

  expect(screen).toHavePathname('/');
  expect(withdrawCalls()).toBe(0);
});

test('최종 확인에서 계속 이용하기를 누르면 탈퇴하지 않고 화면에 남는다', async () => {
  await renderFromMypage();

  await userEvent.press(screen.getByRole('button', { name: '탈퇴하기' }));
  await userEvent.press(screen.getByRole('button', { name: '계속 이용하기' }));

  expect(screen).toHavePathname('/mypage/withdraw');
  expect(withdrawCalls()).toBe(0);
});

test('탈퇴가 실패하면 데이터를 지우지 않고 탈퇴 실패 화면으로 간다', async () => {
  await renderFromMypage(apiError(500));

  await confirmWithdraw();

  expect(screen).toHavePathname('/mypage/withdraw-failed');
  expect(useRegisterDraft.getState().selectedIds).toEqual(['netflix']);
});

// QA KAN-82: 오프라인이면 E-07에 멈춰 있다가 재연결 때 저절로 탈퇴됐음
test('네트워크가 끊긴 채 탈퇴하면 바로 탈퇴 실패 화면으로 가고, 다시 연결돼도 저절로 탈퇴하지 않는다', async () => {
  await renderFromMypage();
  jest.mocked(globalThis.fetch).mockRejectedValue(new TypeError('Network request failed'));
  await act(() => onlineManager.setOnline(false));

  await confirmWithdraw();
  expect(screen).toHavePathname('/mypage/withdraw-failed');

  await act(() => onlineManager.setOnline(true));
  expect(screen).toHavePathname('/mypage/withdraw-failed');
  expect(withdrawCalls()).toBe(1);
  expect(useRegisterDraft.getState().selectedIds).toEqual(['netflix']);
});
