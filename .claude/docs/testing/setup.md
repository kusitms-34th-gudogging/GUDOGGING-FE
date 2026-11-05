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

```json
"jest": {
  "preset": "jest-expo",
  "moduleNameMapper": {
    "\\.svg$": "react-native-svg"
  },
  "transformIgnorePatterns": [
    "node_modules/(?!(.pnpm|(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|standard-navigation))"
  ]
}
```
