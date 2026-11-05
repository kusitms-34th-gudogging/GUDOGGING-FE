// Reanimated·Worklets 공식 Jest resolver를 pnpm 경로에 맞게 다시 씀 (.claude/docs/testing/setup.md)
// 공식 resolver는 basedir.includes('react-native-worklets')로 판단하는데, pnpm은 Reanimated도
// .pnpm/react-native-reanimated@x_react-native-worklets@y/ 경로에 둬서 Reanimated 전체가 웹 구현으로 풀림
// → 실제 패키지 폴더(/node_modules/{이름}/)로 판단. 나머지는 jest-expo(RN) resolver 그대로
const rnResolver = require(require('jest-expo/jest-preset').resolver);

// react-native-reanimated/jest/resolver.js의 WEB_ONLY_IN_JEST와 같게 유지 (Reanimated 올릴 때 대조)
const REANIMATED_WEB_ONLY = [
  'initializers',
  'mutables',
  'mappers',
  'ConfigHelper',
  'UpdateLayoutAnimations',
  'useAnimatedRef',
  'useAnimatedStyle',
  'WorkletEventHandler',
  'JSPropsUpdater',
  'updateProps',
  'util',
  'css/component/AnimatedComponent',
];

const isWorklets = (request, basedir) =>
  basedir.includes('/node_modules/react-native-worklets/') ||
  request === 'react-native-worklets' ||
  request.startsWith('react-native-worklets/');

const isReanimatedWebOnly = (request, basedir) => {
  if (!request.startsWith('.') || !basedir.includes('/node_modules/react-native-reanimated/')) {
    return false;
  }
  const basename = request.split('/').pop();
  return REANIMATED_WEB_ONLY.some((entry) =>
    entry.includes('/') ? request.endsWith(entry) : basename === entry,
  );
};

/** @type {import('jest-resolve').SyncResolver} */
module.exports = (request, options) => {
  const webOnly =
    isWorklets(request, options.basedir) || isReanimatedWebOnly(request, options.basedir);
  return rnResolver(
    request,
    webOnly
      ? { ...options, extensions: options.extensions?.filter((ext) => !ext.includes('native')) }
      : options,
  );
};
