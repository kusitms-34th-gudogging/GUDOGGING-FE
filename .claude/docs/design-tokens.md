# 디자인 토큰 흐름

```txt
Figma (Tokens Studio) ── 디자이너 푸시
   ▼
design-token 브랜치: tokens/default-token.json   ← 원본, 손으로 안 고침
   │ GitHub Actions(design-token.yml): dev 머지 → pnpm tokens:build → 커밋 → dev 대상 PR 생성/갱신
   ▼
tokens/tailwind-token.json                       ← 생성 파일, 손으로 안 고침
   ├─ tailwind.config.js (theme.extend에 JSON을 require + typography 플러그인. CSS @theme 아님) → className
   └─ tokens/index.ts → `@tokens` (motion·gradient·grid)
```

- 빌드: `pnpm tokens:build` (`tokens/sd-tokens-config.mjs`, Style Dictionary v5)
- CI가 `tailwind-token.json`이 빌드 결과와 다르면 실패 → 빌드 설정을 바꿨으면 생성 결과도 같이 커밋
- `design-token` 브랜치는 토큰 업데이트 전용. dev가 갱신되면 `design-token-sync.yml`이 자동 머지
- 토큰 수정은 Figma에서. 코드에서 토큰이 필요하면 디자이너에게 요청

## 빌드 설정 규칙

- radius 키가 Tailwind 방향 유틸(`rounded-t`, `rounded-l`, `rounded-ee` 등)과 겹치면 빌드 실패
- 서로 다른 Figma 경로가 같은 theme 키로 가면 빌드 실패 (키 중복)
- RN 대응 변환: 자간 `%` → px, 그림자 → `box-shadow` 문자열, duration `'150ms'` → `150`
- 지금은 tailwind-merge를 쓰지 않음. 도입하면 토큰 카테고리 추가마다 `extendTailwindMerge` 갱신

## 폰트

- Pretendard Regular/SemiBold/Bold를 `app.json`의 `expo-font` config plugin으로 임베드 (`useFonts` 불필요)
- 네이티브 임베드라 **Expo Go에서는 적용 안 됨** → 개발 빌드(`npx expo run:ios|android`)로 확인

## 이럴 때 더 읽기

- Figma 경로가 어떤 클래스로 가는지·`@tokens` 쓰는 법 → `.claude/docs/styling/token-classes.md`
- 어떤 토큰을 고를지(우선순위) 정할 때 → `.claude/rules/styling.md` "디자인 토큰 고르기"
