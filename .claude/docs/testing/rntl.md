# 컴포넌트 테스트 (RNTL)

참고 코드: `src/components/common/__tests__/Button.test.tsx`

> Expo SDK 58 · Jest 30 · RNTL 14에서 확인함. 버전을 올리면 해당 버전 문서와 대조해 갱신

- **`render`·`renderHook`·`fireEvent`·`act`는 async** (RNTL 14~) → 항상 `await render(...)`
- 쿼리 우선순위(RNTL 공식): `*ByRole` > `*ByLabelText`·`*ByPlaceholderText`·`*ByDisplayValue` > `*ByText`·`*ByHintText` > `*ByTestId`(최후)
- 우리 컴포넌트는 `accessibilityRole` 필수라 `getByRole('button', { name: '저장' })`로 찾음
- 입력은 `userEvent` (`press`·`type`·`longPress`·`clear`). `fireEvent`는 userEvent가 지원 안 하는 상호작용만
- 하나 찾기 `getBy*`, 비동기 등장 `findBy*`, 없음 확인은 `queryBy*` + `not.toBeOnTheScreen()`
- matcher(`toBeOnTheScreen`·`toBeDisabled`·`toHaveTextContent` 등)는 RNTL import만 하면 내장. `jest-native` 설치 안 함

```tsx
// src/components/common/__tests__/Button.test.tsx
import { render, screen, userEvent } from '@testing-library/react-native';

import { Button } from '@/components/common/Button';

// userEvent.press는 실제 타이머면 내부에서 기다림 → 가짜 타이머 (.claude/rules/unit-test.md "속도")
beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('disabled면 onPress가 호출되지 않는다', async () => {
  const onPress = jest.fn();
  await render(<Button label="저장" disabled onPress={onPress} />);

  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
  await user.press(screen.getByRole('button', { name: '저장' }));

  expect(onPress).not.toHaveBeenCalled();
});
```
