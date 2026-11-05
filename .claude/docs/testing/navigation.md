# 화면 전환 테스트 (Expo Router)

> Expo SDK 58 · Jest 30 · RNTL 14에서 확인함. 버전을 올리면 해당 버전 문서와 대조해 갱신

- `expo-router/testing-library`의 `renderRouter` (RNTL 14 이상 필요). 결과는 `await`
- mock 라우트 키는 `./`·`/`·확장자 없이: `'index'`, `'profile/[id]'`, `'(tabs)/home'`
- 이동 검증은 `expect(screen).toHavePathname(...)` · `toHaveSegments` · `toHaveSearchParams`
- `userEvent`는 `expo-router/testing-library`에 없음 → `@testing-library/react-native`에서 import
- 화면 안 `useFocusEffect`(expo-router)도 `renderRouter`에서 실제로 호출됨

```tsx
// src/screens/__tests__/HomeScreen.test.tsx
import { userEvent } from '@testing-library/react-native';
import { router } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';
import { Pressable, Text } from 'react-native';

// 예시용 화면. 실제로는 @/screens의 화면을 넣음
// typed routes라 push 경로는 src/app에 실제 라우트가 있어야 typecheck 통과 (여기선 src/app/profile.tsx 필요)
const Home = () => (
  <Pressable accessibilityRole="button" onPress={() => router.push('/profile')}>
    <Text>프로필</Text>
  </Pressable>
);

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('프로필 버튼을 누르면 프로필로 이동한다', async () => {
  await renderRouter({ index: Home, profile: () => null }, { initialUrl: '/' });

  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(screen.getByRole('button', { name: '프로필' }));

  expect(screen).toHavePathname('/profile');
});
```

## 이럴 때 더 읽기

- 요소 찾기·누르기 방법이 필요할 때 → `.claude/docs/testing/rntl.md`
