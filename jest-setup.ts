// Reanimated를 Jest에서 쓰기 위한 설정 (.claude/docs/testing/setup.md)
require('react-native-reanimated').setUpTests();
// AsyncStorage는 네이티브 모듈이라 라이브러리 공식 mock (메모리 저장)
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
