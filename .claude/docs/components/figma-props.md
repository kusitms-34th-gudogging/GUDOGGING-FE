# Figma property → props

| Figma                                  | props                                          | 비고                                       |
| -------------------------------------- | ---------------------------------------------- | ------------------------------------------ |
| `Type=Primary/Dark/Tonal`              | `variant` (cva)                                | 값은 소문자 유니온                         |
| `Size=L/M/S`                           | `size` (cva)                                   | `'lg' \| 'md' \| 'sm'`                     |
| `State=Pressed`                        | props 없음                                     | `Pressable` + `active:` 클래스             |
| `State=Focused`                        | props 없음                                     | 내부 상태 (`onFocus`/`onBlur`)             |
| `State=Disabled`                       | `disabled?: boolean`                           |                                            |
| `State=Error`                          | `error?: boolean` 또는 `errorMessage?: string` |                                            |
| `On/Off`·`Checked`·`Selected`·`Active` | 제어 컴포넌트                                  | 아래 이름 통일                             |
| boolean property                       | **전부 boolean prop으로**                      | 하나도 빠뜨리지 않음                       |
| instance swap (아이콘)                 | `icon?: ComponentType<SvgProps>`               | `@/assets/icons` 컴포넌트를 그대로 받음    |
| instance swap (그래픽 에셋)            | `asset: ComponentType<SvgProps>`               | `@/assets/graphics` 컴포넌트를 그대로 받음 |
| 그 외 (`Provider`, `Menu`, `Buttons`)  | 의미에 맞는 이름의 유니온                      | 예: `provider: 'apple' \| 'google'`        |

- 상태 props 이름: 켜짐 `value`/`onValueChange`, 체크 `checked`/`onCheckedChange`, 선택 `selected`/`onSelect`
- 라벨·문구는 하드코딩하지 않고 props로
- Figma에 component set이 있으면 variant·boolean property 전부 구현
- variant 스타일 작성법(cva)은 `.claude/docs/styling/cva.md`

## 이럴 때 더 읽기

- variant 스타일(cva)을 작성할 때 → `.claude/docs/styling/cva.md`
