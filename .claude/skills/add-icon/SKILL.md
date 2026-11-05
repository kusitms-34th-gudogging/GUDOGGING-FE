---
name: add-icon
description: SVG 아이콘을 추가할 때 사용. "아이콘 추가해줘" 요청 시 src/assets/icons에 컨벤션대로 파일 배치·export
---

# 아이콘 추가

규칙(파일명·색·선 굵기·사용법)은 `.claude/rules/icons.md`. 아래는 순서만

1. `.claude/rules/icons.md`를 읽음
2. 단색 SVG인지 확인. 여러 색이면 아이콘이 아니므로 `.claude/skills/add-asset/SKILL.md`로 안내하고 멈춤
3. 규칙대로 색 통일, 선 아이콘이면 `vector-effect` 추가
4. 규칙의 파일명으로 `src/assets/icons/`에 저장
5. `src/assets/icons/index.ts`에 export 추가
6. 사용자에게 `pnpm start -c`로 캐시 초기화가 필요하다고 안내
