@AGENTS.md

## Claude Code 전용

- `.claude/rules/*.md`는 frontmatter `paths`에 맞는 파일을 다룰 때 자동 로드됨. 새 파일을 만들 땐 아직 매칭되는 파일이 없을 수 있으니 문서 지도로 직접 읽는다
- 문서 지도의 `.claude/skills/{이름}/SKILL.md`는 `/{이름}`으로 호출 (`/new-screen`, `/add-test`, `/commit` 등)
- Figma 여러 화면 병렬 퍼블리싱은 `figma-publisher` 에이전트
