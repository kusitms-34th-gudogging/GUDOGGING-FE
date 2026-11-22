import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { act, renderHook } from '@testing-library/react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as SecureStore from 'expo-secure-store';

import { LoginCanceledError, useLogin } from '@/hooks/useLogin';
import { createQueryWrapper, mockApi } from '@/lib/testing';

// 네이티브 로그인 창은 테스트에서 못 띄움 → SDK 응답만 흉내 (mock은 jest-setup.ts)
beforeEach(() => {
  jest.mocked(GoogleSignin.signIn).mockResolvedValue({
    type: 'success',
    data: {
      idToken: 'google-id-token',
      serverAuthCode: null,
      scopes: [],
      user: { id: '1', email: 'a@b.c', name: null, givenName: null, familyName: null, photo: null },
    },
  });
});

jest.mock('expo-apple-authentication', () => ({
  ...jest.requireActual('expo-apple-authentication'),
  signInAsync: jest.fn(),
  formatFullName: jest.fn(),
}));
afterEach(() => jest.restoreAllMocks());

const mockAppleSignIn = (fullName: AppleAuthentication.AppleAuthenticationFullName | null) =>
  jest.mocked(AppleAuthentication.signInAsync).mockResolvedValue({
    user: 'apple-user',
    identityToken: 'identity',
    authorizationCode: 'code',
    fullName,
    email: null,
    realUserStatus: 1,
    state: null,
  });

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
  mockAppleSignIn(null);
  const fetchSpy = mockApi({
    [`POST /api/v1/auth/${provider}`]: { accessToken: 'a', refreshToken: 'r', isNewUser: false },
  });
  const { result } = await renderHook(() => useLogin(), { wrapper: createQueryWrapper() });

  await act(() => result.current.mutateAsync(provider));

  expect(Object.keys(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body)))).toEqual(fields);
});

it('Google 로그인은 SDK가 준 idToken을 보낸다', async () => {
  const fetchSpy = mockApi({
    'POST /api/v1/auth/google': { accessToken: 'a', refreshToken: 'r', isNewUser: false },
  });
  const { result } = await renderHook(() => useLogin(), { wrapper: createQueryWrapper() });

  await act(() => result.current.mutateAsync('google'));

  expect(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body))).toEqual({
    idToken: 'google-id-token',
  });
});

it('Google 로그인 창을 닫으면 서버에 요청하지 않고 취소로 끝난다', async () => {
  jest.mocked(GoogleSignin.signIn).mockResolvedValue({ type: 'cancelled', data: null });
  const fetchSpy = mockApi({});
  const { result } = await renderHook(() => useLogin(), { wrapper: createQueryWrapper() });

  const error = await result.current.mutateAsync('google').catch((e: unknown) => e);

  expect(error).toBeInstanceOf(LoginCanceledError);
  expect(fetchSpy).not.toHaveBeenCalled();
});

it('Apple이 이름을 주면(첫 인가) SDK 값과 이름을 함께 보낸다', async () => {
  mockAppleSignIn({
    givenName: '구독',
    familyName: '김',
    middleName: null,
    namePrefix: null,
    nameSuffix: null,
    nickname: null,
  });
  jest.mocked(AppleAuthentication.formatFullName).mockReturnValue('김구독');
  const fetchSpy = mockApi({
    'POST /api/v1/auth/apple': { accessToken: 'a', refreshToken: 'r', isNewUser: true },
  });
  const { result } = await renderHook(() => useLogin(), { wrapper: createQueryWrapper() });

  await act(() => result.current.mutateAsync('apple'));

  expect(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body))).toEqual({
    identityToken: 'identity',
    authorizationCode: 'code',
    name: '김구독',
  });
});

it('Apple 로그인 창을 닫으면 서버에 요청하지 않고 취소로 끝난다', async () => {
  jest
    .mocked(AppleAuthentication.signInAsync)
    .mockRejectedValue(Object.assign(new Error('canceled'), { code: 'ERR_REQUEST_CANCELED' }));
  const fetchSpy = mockApi({});
  const { result } = await renderHook(() => useLogin(), { wrapper: createQueryWrapper() });

  const error = await result.current.mutateAsync('apple').catch((e: unknown) => e);

  expect(error).toBeInstanceOf(LoginCanceledError);
  expect(fetchSpy).not.toHaveBeenCalled();
});
