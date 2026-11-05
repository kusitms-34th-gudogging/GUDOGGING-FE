# 상태 전환 (transition)

참고 코드: `src/components/common/Toggle.tsx` · `src/components/common/SegmentedControl.tsx`

- 상태(`active:`·선택·disabled·포커스)에 따라 색이 바뀌는 요소엔 `transition-colors` (기본 150ms)
- 예외: 선택 표시가 칸 사이를 옮겨 다니는 것은 칸마다 배경을 두지 않고 `useSlidingIndicator`(`src/hooks/useSlidingIndicator.ts`)로 표시 하나를 미끄러뜨림. 칸마다 색 전환하면 두 칸이 동시에 깜빡여 어색함
- 색이 바뀌는 요소마다 각각 붙임. `Pressable`에만 붙이면 배경만 부드럽고 안쪽 `<Text>` 글자색은 팍 바뀜
- 예외: SVG 아이콘엔 붙이지 않음. 색이 `color` prop으로 넘어가서 transition을 붙이면 엉뚱한 색으로 고정됨
- 예외: TextButton·IconButton(컴포넌트 전체)과 입력 포커스 테두리(TextField·Dropdown)는 붙이지 않음. 늦게 반응하거나 깜빡여 보임
- 조건부 `shadow-*`는 반대쪽에 `shadow-none`. 렌더 도중 그림자가 생기면 에러
- 위치 이동은 `transition-transform` (`value ? 'translate-x-[20px]' : 'translate-x-0'`)
- duration은 Tailwind 기본 스케일 (`duration-200`). 누름 피드백은 기본값 그대로
- transition 클래스는 조건 없이 항상 붙임. 렌더 도중 붙으면 컴포넌트가 다시 마운트됨
