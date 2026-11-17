import { act, renderHook } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

import { useLogin } from '@/hooks/useLogin';
import { createQueryWrapper, mockApi } from '@/lib/testing';

// 보안 저장소는 네이티브 모듈이라 메모리로 대신함
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: async (key: string) => store.get(key) ?? null,
    setItemAsync: async (key: string, value: string) => void store.set(key, value),
    deleteItemAsync: async (key: string) => void store.delete(key),
  };
});

afterEach(() => jest.restoreAllMocks());

it.each([true, false])(
  '고른 소셜 계정으로 로그인해 토큰을 저장하고, 처음 가입인지(%s) 돌려준다',
  async (isNewUser) => {
    mockApi({
      'POST /api/v1/auth/google': { accessToken: 'access', refreshToken: 'refresh', isNewUser },
    });
    const { result } = await renderHook(() => useLogin(), { wrapper: createQueryWrapper() });

    let returned: boolean | undefined;
    await act(async () => {
      returned = await result.current.mutateAsync('google');
    });

    expect(returned).toBe(isNewUser);
    expect(await SecureStore.getItemAsync('accessToken')).toBe('access');
    expect(await SecureStore.getItemAsync('refreshToken')).toBe('refresh');
  },
);
