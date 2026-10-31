# 폴더 구조 · 파일 위치 판단

SDK 55+ 기본 템플릿(`app` · `components` · `constants` · `hooks`) + Expo 팀 권장 폴더(`screens` · `utils` · `server`).
앱 코드는 전부 `src/`, 설정 파일(`app.json`, `eas.json` 등)은 루트.

```txt
tokens/            # 디자인 토큰 (루트). default-token.json 원본, tailwind-token.json 생성물, index.ts → @tokens
src/
├─ app/            # 라우트 전용. screens 컴포넌트를 반환하는 얇은 껍데기
│  ├─ api/         # +api 파일(서버 API 라우트)
│  └─ _layout.tsx  # 루트 레이아웃 (global.css, nativewindInterop import)
├─ screens/        # 화면 본체(XxxScreen.tsx)만
├─ components/
│  ├─ common/      # 디자인 시스템 컴포넌트 + 2개 이상 도메인에서 쓰는 컴포넌트
│  └─ {도메인}/    # 한 도메인 안에서만 쓰는 컴포넌트 (화면 만들 때 추가)
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

| 만들 것                              | 위치                                                     |
| ------------------------------------ | -------------------------------------------------------- |
| 새 화면                              | `src/screens/XxxScreen.tsx` + `src/app/xxx.tsx` (껍데기) |
| 한 도메인 안에서만 쓰는 컴포넌트     | `src/components/{도메인}/`                               |
| 디자인 시스템 / 2개 이상 도메인 공용 | `src/components/common/`                                 |
| 커스텀 훅                            | `src/hooks/useXxx.ts`                                    |
| 순수 함수                            | `src/utils/`                                             |
| 서버 API                             | `src/app/api/xxx+api.ts` + 로직은 `src/server/`          |
| 여러 곳에서 공유하는 타입            | `src/types/` (그 전까진 쓰는 곳 옆)                      |

- 도메인끼리 import 금지. 다른 도메인에서도 쓰게 되면 `common/`으로 옮김

## 컴포넌트 파일 → 폴더 전환

```txt
components/home/ProfileCard.tsx         # 처음
components/home/profileCard/index.tsx   # 커지면: 본체
components/home/profileCard/Avatar.tsx  #          내부 조각
```

`@/components/home/ProfileCard` → `@/components/home/profileCard` 로 import 경로 대소문자가 바뀌므로 사용처 같이 수정.

## import 경로

`tsconfig.json`의 `paths`로 `@/*` → `src/*`, `@tokens` → `tokens/` (JS 토큰). Expo CLI가 바로 지원하므로 `babel-plugin-module-resolver` 불필요.
`tsconfig.json` 변경 후엔 개발 서버 재시작.
