import { act, renderHook } from '@testing-library/react-native';
import * as SecureStore from 'expo-secure-store';

import { useLogin } from '@/hooks/useLogin';
import { createQueryWrapper, mockApi } from '@/lib/testing';

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

it.each([
  ['google', ['idToken']],
  ['apple', ['identityToken', 'authorizationCode']],
] as const)('%s 로그인은 명세 요청 바디 필드를 보낸다', async (provider, fields) => {
  const fetchSpy = mockApi({
    [`POST /api/v1/auth/${provider}`]: { accessToken: 'a', refreshToken: 'r', isNewUser: false },
  });
  const { result } = await renderHook(() => useLogin(), { wrapper: createQueryWrapper() });

  await act(() => result.current.mutateAsync(provider));

  expect(Object.keys(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body)))).toEqual(fields);
});
