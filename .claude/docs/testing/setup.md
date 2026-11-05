# 테스트 설정

참고 코드: 설정 원본은 `package.json`의 `"jest"`·`tsconfig.json`

> Expo SDK 58 · Jest 30 · RNTL 14에서 확인함. 버전을 올리면 해당 버전 문서와 대조해 갱신

이미 설정됨. 설정이 깨졌거나 Expo·Jest·RNTL 버전을 올릴 때만 읽음

```sh
pnpm expo install jest-expo jest @types/jest @testing-library/react-native test-renderer --dev
```

- `test-renderer`는 RNTL 14의 peer dependency (`react-test-renderer`는 React 19 미지원으로 deprecated)
- `tsconfig.json`의 `compilerOptions.types`에 `"jest"` (없으면 typecheck에서 `it`·`expect` 에러)
- Jest 설정은 `package.json`의 `"jest"` 키 (별도 `jest.config.js` 만들지 않음). Expo 문서의 pnpm 패턴에 **`standard-navigation` 추가 필수** (expo-router 58의 ESM 의존성, 없으면 `expo-router` import하는 테스트가 `Must use import to load ES Module`로 실패)
- `moduleNameMapper`로 `.svg`를 `react-native-svg` 기본 export(`Svg`)에 연결. 없으면 jest-expo가 svg를 이미지 에셋(객체)으로 불러와 아이콘을 그리는 컴포넌트가 `Element type is invalid ... got: object`로 실패
- Reanimated 4는 [공식 테스트 가이드](https://docs.swmansion.com/react-native-reanimated/docs/guides/testing/)대로 resolver + `setUpTests()`. 없으면 Reanimated를 쓰는 컴포넌트가 import 단계에서 `setCSSEventHandler is not available`로 실패
  - `resolver`는 공식 `react-native-reanimated/jest/resolver` 대신 루트 `jest-resolver.js`. 공식 resolver는 경로에 `react-native-worklets`가 들어 있는지로 판단하는데, pnpm은 Reanimated를 `.pnpm/react-native-reanimated@x_react-native-worklets@y/`에 둬서 Reanimated 전체가 웹 구현으로 풀림(`window.matchMedia is not a function`). Reanimated를 올리면 `jest-resolver.js`의 목록을 공식 resolver와 대조
  - `setupFilesAfterEnv`의 루트 `jest-setup.ts`에서 `setUpTests()` 호출

```json
"jest": {
  "preset": "jest-expo",
  "resolver": "<rootDir>/jest-resolver.js",
  "setupFilesAfterEnv": ["<rootDir>/jest-setup.ts"],
  "moduleNameMapper": {
    "\\.svg$": "react-native-svg"
  },
  "transformIgnorePatterns": [
    "node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|standard-navigation))"
  ]
}
```
