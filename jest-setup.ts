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
