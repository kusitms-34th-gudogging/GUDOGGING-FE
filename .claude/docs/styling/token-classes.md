# 토큰 → 클래스 매핑

## Figma 경로 → 클래스

`primary`/`semantic`/`styles` 세트를 아래처럼 Tailwind theme 키로 옮긴다 (`sd-tokens-config.mjs`의 `MAPPINGS`).

| Figma 경로                                                  | theme 키                                       | 사용 예                                                                                                              |
| ----------------------------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `primary.spacing.16`                                        | `spacing.s16` (**`s` 접두사**)                 | `p-s16`, `gap-s8`                                                                                                    |
| `semantic.spacing.*`, `primary.layout.*`                    | `spacing.*`                                    | `px-screen-x`, `gap-stack-md`, `h-bottom-cta`, `gap-gutter`                                                          |
| `primary.radius.*`, `semantic.radius.*`                     | `borderRadius` (S/L 라벨은 `sm`/`lg`로)        | `rounded-md`, `rounded-card`, `rounded-button`                                                                       |
| `primary.color.*`, `semantic.color.*`                       | `colors.*`                                     | `text-text-primary`, `bg-bg-default`, `bg-action-primary`, `border-border-default`, `text-icon-brand`, `bg-gray-100` |
| `styles.typography.Display.Bold`                            | `typography.display-bold` (플러그인 유틸)      | `text-display-bold`, `text-body1-regular`                                                                            |
| `primary.size.*`, `semantic.size.*` (펼침)                  | `width`·`height`·`size`·`minWidth`·`minHeight` | `size-icon-md`, `h-button-lg`, `min-h-touch-target`                                                                  |
| `primary.border`, `semantic.border`                         | `borderWidth`                                  | `border-default`, `border-focus`                                                                                     |
| `semantic.opacity`                                          | `opacity`                                      | `opacity-disabled`, `opacity-pressed`                                                                                |
| `styles.shadow.*`                                           | `boxShadow`                                    | `shadow-elevation-1`                                                                                                 |
| `primary/semantic.motion`, `styles.gradient`, `styles.grid` | `@tokens`                                      | `motion.press`, `gradient[100]`, `grid['ios-375-4col']`                                                              |

- 실제 키 목록은 `tokens/tailwind-token.json`에서 확인
- typography는 폰트·크기·행간·자간·굵기를 한 클래스로 지정 (`text-{name}`). `fontSize`(`text-16`)·`fontWeight`(`font-bold`) 키도 있음

## JS 토큰 (`@tokens`)

className으로 표현할 수 없는 토큰만 `tokens/index.ts`에서 export.

```ts
import { gradient, motion } from '@tokens';

withTiming(1, { duration: motion.press, easing: Easing.bezier(...motion['ease-move']) });
<LinearGradient colors={gradient[100].colors} locations={gradient[100].locations} start={...} end={...} />
```

- duration은 ms 숫자, easing은 bezier 4튜플
- gradient는 `expo-linear-gradient` props 형태 (`{ colors, locations }`). 방향은 토큰에 없어 `start`/`end` 직접 지정
