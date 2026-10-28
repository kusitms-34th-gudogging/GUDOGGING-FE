---
name: pr
description: 현재 브랜치로 dev 대상 PR을 .github/pull_request_template.md 양식에 맞춰 생성
disable-model-invocation: true
---

# /pr

1. `pnpm lint && pnpm typecheck` 통과 확인 (CI와 동일. 실패하면 PR 만들지 말고 보고)
2. `git log dev..HEAD`, `git diff dev...HEAD`로 변경 파악
3. 브랜치명 `{접두사}/#{이슈번호}-{티켓}-{작업명}`에서 이슈 번호·티켓 추출
4. 제목: 이슈 제목을 그대로 사용 — `gh issue view {이슈번호} --json title -q .title`
   (워크플로가 `[{티켓}/{타입}] 작업 내용`으로 정리해둔 제목. 임의로 만들지 않음)
5. 본문은 `.github/pull_request_template.md`를 그대로 채움
   - PR 유형 체크박스 해당 항목 `[x]`
   - `resolves #{이슈번호}`
   - 작업 사항: 변경을 bullet로 요약
   - `🤖 Generated with Claude Code` 등 AI 작성 표시를 넣지 않음
6. push 후 `gh pr create --base dev --title ... --body ...`
