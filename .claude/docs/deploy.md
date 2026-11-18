# iOS 빌드·배포 (EAS · TestFlight)

`dev` 머지가 곧 배포. 자동화는 `.github/workflows/deploy.yml`

## dev 머지 시 자동으로 일어나는 일

`app.json`의 `runtimeVersion`이 `fingerprint`라 네이티브 지문(hash)으로 빌드가 필요한지 판단

| 머지 내용                                    | 동작                                                                                                              |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| JS만 바뀜 (화면·로직)                        | OTA(`eas update --channel production`). 설치된 앱이 다음 실행 때 받고 그다음 실행에 적용                          |
| 네이티브가 바뀜                              | EAS 빌드 → TestFlight 자동 제출 → 내부 그룹 `Team (Expo)`에 자동 배포                                             |
| 네이티브가 바뀜 + 이번 달 iOS 빌드 12회 이상 | 빌드 건너뜀 (무료 15회 중 3회는 비상용). Actions에 경고만. 직접 빌드하기 전까지는 이후 JS만 바뀐 머지도 OTA 안 됨 |

- PR(`dev` 대상)에 네이티브 변경이 있으면 github-actions가 "머지하면 빌드 1회" 댓글을 남김. 머지 = 빌드 승인
- 급하지 않은 네이티브 변경은 다른 네이티브 변경과 모아서 머지 (빌드 1회로 끝남)

## 네이티브 변경으로 잡히는 것 (빌드 1회 소모)

- 네이티브 모듈 패키지 추가·버전 변경 (patch 포함, `pnpm expo install --fix` 포함). JS 전용·개발용 패키지는 해당 없음
- `app.json` 변경, 아이콘·스플래시·폰트 파일 변경
- `package.json`의 `scripts` 변경 → `npx expo prebuild`가 `ios`·`android` 스크립트를 `expo run:*`으로 바꿈. 커밋하지 말고 `scripts` 줄만 되돌림 (`git checkout package.json`은 커밋 안 한 의존성 변경까지 지우니 의존성은 먼저 커밋)

## 직접 빌드할 때

한도에 닿았거나 자동 빌드가 실패했을 때만. `npx expo run:ios`(개발 빌드)는 EAS 횟수와 무관

```sh
npx eas-cli@latest build -p ios --profile production --auto-submit
npx eas-cli@latest account:usage kusitms-34th-gudogging   # 이번 달 사용량 (매달 1일 초기화)
npx eas-cli@latest submit -p ios --id <빌드ID>             # 빌드는 됐는데 TestFlight 제출만 실패했을 때
```

- 자동 빌드가 실패·취소되면 그 지문으로 성공한 빌드가 없는 상태 → Actions의 해당 실행을 Re-run하면 다시 빌드 (그사이 나간 OTA는 받을 앱이 없어 무해)

- 인증서·프로비저닝 프로파일·푸시 키·App Store Connect API 키는 EAS에 저장됨 → Apple 로그인 불필요
- Apple 개발자 계정이 개인(Individual)이라 인증서 재발급(만료 1년)·Apple 기능 추가(푸시 외 capability)는 계정 주인만 가능

## 빌드에서만 생기는 문제

- `EXPO_PUBLIC_*`는 `.env.local`이 아니라 EAS 환경 변수(production)에서 들어감. 새 변수는 `npx eas-cli@latest env:create --environment production --name <이름> --value <값> --visibility plaintext`
- `babel.config.js`·babel preset이 문자열로 부르는 패키지는 `package.json`에 직접 있어야 함. pnpm이라 로컬은 우연히 찾아도 EAS의 expo-updates 빌드 단계(`createUpdatesResources.js`)는 못 찾음 (`babel-preset-expo`, `@babel/plugin-transform-react-jsx`가 이 이유로 devDependencies에 있음)
- 테스터 화면에서 애니메이션이 멈춰 보이면 기기의 "동작 줄이기"(`useReducedMotion`) 확인
