import * as SecureStore from 'expo-secure-store';

// 로그인 토큰은 기기 보안 저장소에 (api-client.md: AsyncStorage에 두지 않음)
const ACCESS = 'accessToken';
const REFRESH = 'refreshToken';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export const authToken = {
  getAccess: () => SecureStore.getItemAsync(ACCESS),
  getRefresh: () => SecureStore.getItemAsync(REFRESH),
  save: ({ accessToken, refreshToken }: AuthTokens) =>
    Promise.all([
      SecureStore.setItemAsync(ACCESS, accessToken),
      SecureStore.setItemAsync(REFRESH, refreshToken),
    ]),
  clear: () =>
    Promise.all([SecureStore.deleteItemAsync(ACCESS), SecureStore.deleteItemAsync(REFRESH)]),
};
