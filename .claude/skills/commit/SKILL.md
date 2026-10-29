---
name: commit
description: 구도깅 커밋 컨벤션(#이슈번호 [타입] 작업내용)에 맞춰 변경사항을 커밋
disable-model-invocation: true
---

# /commit

1. `git status`, `git diff --staged`(없으면 `git diff`)로 변경 확인
2. 이슈 번호는 현재 브랜치명에서 추출: `{접두사}/#{이슈번호}-{티켓}-{작업명}` → `#` 뒤 숫자
3. 변경을 논리 단위로 나눠 커밋 (서로 무관한 변경은 따로)
4. 메시지 형식은 [convention.md](convention.md)
5. pre-commit(lint-staged)·commit-msg hook이 실패하면 원인 수정 후 **새 커밋** (`--no-verify` 금지)
6. 커밋 메시지에 `Co-Authored-By: Claude ...` 등 AI 작성자 표시를 넣지 않음
