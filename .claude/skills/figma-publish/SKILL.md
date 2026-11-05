---
name: figma-publish
description: Figma 디자인(figma.com URL·노드)을 화면/컴포넌트 코드로 퍼블리싱할 때 사용. "피그마 보고 만들어줘", "이 디자인 구현해줘" 요청 시 Figma MCP로 읽어 구도깅 디자인 시스템 규칙(토큰·className·아이콘·폴더 구조)에 맞춰 변환
---

# Figma → 코드 퍼블리싱

Figma MCP 출력(React + Tailwind 웹 코드)은 **참고 자료**지 정답이 아님. 아래 규칙으로 RN + NativeWind 코드로 옮긴다.

## 1. 디자인 읽기

1. URL 파싱: `figma.com/design/:fileKey/...?node-id=1-2` → nodeId `1:2` (branch URL이면 branchKey가 fileKey)
2. `create_session`(fileKey) → 받은 sessionId를 이후 호출에 재사용
3. `/figma-design-to-code` 스킬 로드 (없으면 MCP 리소스 `skill://figma/figma-design-to-code/SKILL.md`). `get_design_context` 전에 필수
4. `get_design_context` + `get_screenshot`(원본 비교용). 노드가 커서 잘리면 `get_metadata`로 하위 노드를 나눠서 다시 요청
5. `get_variable_defs`로 쓰인 변수(색·간격·radius·폰트) 확인

## 2. 디자인 시스템 매핑 (핵심)

먼저 읽기: `.claude/docs/styling/token-classes.md`(Figma 경로 → 클래스 매핑표) · `.claude/rules/styling.md` · `.claude/rules/components.md`

**토큰**

- Figma 변수는 매핑표대로 토큰 클래스로. hex·px 값으로 직접 옮기지 않음
- 맞는 토큰이 없을 때만 arbitrary value. 쓴 곳을 모아 **"토큰 누락 목록"**으로 사용자에게 보고 (토큰 추가는 Figma 쪽에 요청)
- 값이 토큰과 1~2px 다르면 토큰으로 맞추고 보고 (디자이너 실수 가능성)

**웹 → RN 변환** (Figma MCP 출력은 웹 코드)

- `div`→`View`, 텍스트→`Text`(텍스트는 반드시 `Text` 안), `img`→`Image`, 클릭→`Pressable`, 스크롤 영역→`ScrollView`
- Figma의 absolute 좌표 배치는 flex(`flex-row`, `gap-*`, `justify-*`)로 재구성. absolute는 실제로 겹치는 요소만
- 고정 width/height는 버리고 `flex-1`·`w-full`·padding으로. 아이콘·아바타처럼 진짜 고정 크기만 `size-*`
- 웹 전용 클래스(`hover:`, `cursor-*`, `grid`, `shadow-[...]` 복잡한 값) 제거. hover는 `active:`로
- SafeArea·상태바 영역은 디자인에 그려져 있어도 직접 그리지 않음

**에셋**

- 단색 아이콘 → `/add-icon` 스킬 절차대로 `src/assets/icons/`에 추가 후 `<XxxIcon className="size-icon-md text-icon-primary" />`
- 같은 아이콘이 이미 `src/assets/icons/index.ts`에 있으면 재사용
- Figma `asset/*`·`asset-44/*` 그래픽(색 고정 SVG) → `src/assets/graphics/index.ts`에 있으면 재사용, 없으면 `/add-asset` 스킬 절차대로 추가
- Figma `Asset tile` 인스턴스 → `AssetTile` 컴포넌트 (`asset-44/*`는 `tone="brand-bgx"`·`"mono-bgx"`)
- 그 외 여러 색 이미지 → `src/assets/images/` (`download_assets`로 받기). localhost 에셋 URL을 코드에 남기지 않음

**컴포넌트 · 위치**

- 먼저 `src/components/common/`·해당 도메인 폴더에 같은 역할 컴포넌트가 있는지 확인 → 있으면 재사용/확장
- 새로 만들면 위치는 `.claude/docs/architecture.md`, 화면이면 `.claude/skills/new-screen/SKILL.md` 절차
- 텍스트·리스트 데이터는 하드코딩 상수로 두되 props로 받을 수 있게 (API 연동은 이번 범위 아님)

## 공통 컴포넌트 모드

Figma "공통 컴포넌트" 섹션(component set)을 `src/components/common/`에 만들 때. property → props 대응은 `.claude/docs/components/figma-props.md`, variant 스타일은 `.claude/docs/styling/cva.md`

1. `get_metadata`로 component set의 variant 목록 전체 확인
2. `get_design_context`로 property 정의 확인. boolean·instance swap 빠뜨리지 않음
3. 구현 전에 **Figma property ↔ props 대응표** 작성
4. variant 조합 전부 구현 후 `get_screenshot`과 비교
5. 최종 보고에 대응표 포함

## 3. 검증

1. `pnpm check`
2. `get_screenshot` 원본과 구조·간격·색 비교 (실행이 가능하면 앱 화면과도)
3. 사용자에게 보고: 만든 파일, **토큰 누락 목록**, 디자인과 다르게 처리한 부분(그 이유)
