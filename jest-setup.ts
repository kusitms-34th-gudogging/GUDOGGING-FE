// Reanimated를 Jest에서 쓰기 위한 설정 (.claude/docs/testing/setup.md)
require('react-native-reanimated').setUpTests();
// AsyncStorage는 네이티브 모듈이라 라이브러리 공식 mock (메모리 저장)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
// gesture-handler 네이티브 모듈 mock. 테스트에서 제스처는 jestUtils의 createGestureController로 발생
require('react-native-gesture-handler/jestSetup');
// shortcut: jest엔 worklets UI 런타임이 없어 import 직후 에러가 남, gesture-handler jestSetup이 이걸 막아주면 삭제
jest.mock(
  'react-native-gesture-handler/lib/module/handlers/gestures/installUIRuntimeBindings',
  () => ({ installUIRuntimeBindings: () => {} }),
);
// Google 로그인은 네이티브 모듈이라 쓰는 함수만 대신함 (로그인 화면을 그리는 테스트가 import만 해도 필요)
// 응답은 테스트에서 jest.mocked(GoogleSignin.signIn)으로 정함
jest.mock('@react-native-google-signin/google-signin', () => ({
  GoogleSignin: { configure: jest.fn(), signIn: jest.fn() },
}));
// 보안 저장소(로그인 토큰)는 네이티브 모듈이라 메모리로 대신함. 테스트 파일마다 새로 비어 있음
jest.mock('expo-secure-store', () => {
  const store = new Map<string, string>();
  return {
    getItemAsync: async (key: string) => store.get(key) ?? null,
    setItemAsync: async (key: string, value: string) => void store.set(key, value),
    deleteItemAsync: async (key: string) => void store.delete(key),
  };
});
// request()가 base URL 없으면 에러. API 테스트는 fetch를 mock해서 실제로 나가지 않음
process.env.EXPO_PUBLIC_API_URL = 'https://api.test';
// Firebase 메시징은 네이티브 모듈이라 쓰는 함수만 대신함 (홈·알림 설정 화면이 import만 해도 필요)
jest.mock('@react-native-firebase/messaging', () => ({
  getMessaging: jest.fn(),
  getToken: jest.fn(async () => 'fcm-test-token'),
}));
// Firebase Analytics도 네이티브 모듈이라 쓰는 함수만 대신함. 보낸 이벤트는 getAnalytics().logEvent로 확인
jest.mock('@react-native-firebase/analytics', () => {
  const analytics = { logEvent: jest.fn(async () => {}) };
  return { getAnalytics: () => analytics, setUserId: jest.fn(async () => {}) };
});
