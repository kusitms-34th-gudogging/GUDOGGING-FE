---
paths:
  - 'src/app/**'
---

# 라우트 규칙 (Expo Router)

- `src/app/` 안 파일은 전부 라우트로 인식됨 → 컴포넌트·유틸·스타일 파일 두지 않음
- `src/app/_layout.tsx` 필수. 라우트 루트를 다른 폴더로 바꾸는 설정은 쓰지 않음
- 라우트 파일은 `export default`, `screens/`의 컴포넌트를 반환만 하는 얇은 껍데기
- `+api` 파일은 `src/app/api/`에 모음. 거기서 쓰는 서버 로직은 `src/server/`로
- Next.js 파일명 아님: `page.tsx`→`index.tsx`·`[name].tsx`, `layout.tsx`→`_layout.tsx`. `"use client"` 없음

```tsx
// src/app/profile.tsx
import { ProfileScreen } from '@/screens/ProfileScreen';

export default function ProfileRoute() {
  return <ProfileScreen />;
}
```
