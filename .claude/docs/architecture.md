# 폴더 구조 · 파일 위치 판단

SDK 55+ 기본 템플릿(`app` · `components` · `constants` · `hooks`) + Expo 팀 권장 폴더(`screens` · `utils` · `server`).
앱 코드는 전부 `src/`, 설정 파일(`app.json`, `eas.json` 등)은 루트.

```txt
tokens/            # 디자인 토큰 (루트). default-token.json 원본, tailwind-token.json 생성물, index.ts → @tokens
src/
├─ app/            # 라우트 전용. screens 컴포넌트를 반환하는 얇은 껍데기
│  ├─ api/         # +api 파일(서버 API 라우트)
│  └─ _layout.tsx  # 루트 레이아웃 (global.css, nativewindInterop import)
├─ screens/        # 화면 본체 + 그 화면에서만 쓰는 하위 컴포넌트
├─ components/     # 여러 화면에서 재사용하는 컴포넌트
├─ hooks/          # useXxx.ts
├─ constants/      # 상수, 테마 값
├─ utils/          # 순수 유틸 함수 (cn, nativewindInterop), 테스트는 옆에
├─ server/         # API 라우트에서만 쓰는 코드 (auth, db)
└─ assets/
   ├─ fonts/       # Pretendard (app.json expo-font 플러그인으로 임베드)
   ├─ icons/       # 단색 SVG 아이콘 → index.ts에서 컴포넌트로 export
   └─ images/      # 앱 아이콘·스플래시 등
```

## 어디에 둘까

| 만들 것                    | 위치                                                     |
| -------------------------- | -------------------------------------------------------- |
| 새 화면                    | `src/screens/XxxScreen.tsx` + `src/app/xxx.tsx` (껍데기) |
| 한 화면에서만 쓰는 조각    | `src/screens/` (화면이 커지면 `screens/xxxScreen/` 폴더) |
| 2곳 이상에서 쓰는 컴포넌트 | `src/components/`                                        |
| 커스텀 훅                  | `src/hooks/useXxx.ts`                                    |
| 순수 함수                  | `src/utils/`                                             |
| 서버 API                   | `src/app/api/xxx+api.ts` + 로직은 `src/server/`          |
| 여러 곳에서 공유하는 타입  | `src/types/` (그 전까진 쓰는 곳 옆)                      |

## 컴포넌트 파일 → 폴더 전환

```txt
components/ProfileCard.tsx         # 처음
components/profileCard/index.tsx   # 커지면: 본체
components/profileCard/Avatar.tsx   #          내부 조각
```

`@/components/ProfileCard` → `@/components/profileCard` 로 import 경로 대소문자가 바뀌므로 사용처 같이 수정.

## import 경로

`tsconfig.json`의 `paths`로 `@/*` → `src/*`, `@tokens` → `tokens/` (JS 토큰). Expo CLI가 바로 지원하므로 `babel-plugin-module-resolver` 불필요.
`tsconfig.json` 변경 후엔 개발 서버 재시작.
