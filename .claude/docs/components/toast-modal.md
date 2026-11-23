# Toast · Modal

참고 코드: `src/components/common/Toast.tsx` · `src/components/common/ToastProvider.tsx` · `src/components/common/Modal.tsx` · `src/hooks/useToast.ts`

- Toast: 전역 호출형. `src/app/_layout.tsx`에서 `ToastProvider`로 한 번 감싸고 `useToast().show({ type, message })`로 호출 (Context + Reanimated, 라이브러리 추가 안 함). 위치는 화면마다 달라서 쓰는 화면이 `ToastOutlet`을 원하는 자리에 둠. Outlet이 없는 화면에선 토스트가 안 보임
  - 노출 시간: 모든 토스트 2초로 통일 (기디 요청. 화면설계서의 1초보다 우선). `ToastProvider`의 `VISIBLE_MS` 한 곳에서 관리하고 화면별로 바꾸지 않음
  - 인터넷 연결 안내(E-2)가 모든 화면에 떠야 해서 **모든 화면(로딩·에러 상태 포함)에 Outlet 하나**. 새 화면을 만들면 같이 둠
  - CTA·버튼 위 8 (Figma A-07 스크린샷 등록 에러처리와 통일): 하단 CTA 영역 바로 앞에 `<ToastOutlet placement="aboveCta" />`. 본문 영역 끝에 `className="bottom-0 pb-stack-sm"`로 둔 기존 화면도 같은 위치 (예: `RegisterScreenshotImagesScreen`)
  - 탭바 위 12 (Figma M-02.2.1과 통일): `<ToastOutlet placement="aboveTabBar" />` → 하단 안전 영역 위 68. 다른 요소와 겹치면 토스트가 위
  - 버튼도 탭바도 없는 화면: `<ToastOutlet placement="bottom" />` → 하단 안전 영역 위 6. 다른 요소와 겹치면 토스트가 위
  - 직접 위치를 잡을 땐 `pb-safe` 있는 View 안에서 `bottom-full`이 패딩만큼 어긋남 → 높이 0 기준점 + `bottom-0`으로
  - Outlet은 포커스된 화면, 그리고 `show`를 부른 화면 경로에서만 그림 (`useToast`가 경로를 붙임). 토스트가 떠 있는 동안 뒤로 가거나 다른 화면에 가도 거기엔 다시 안 뜸. 화면을 떠나면서 띄우는 토스트(삭제 후 뒤로, 저장 후 상세로)는 `show(toast, { nextScreen: true })` → 다음에 포커스되는 화면의 Outlet이 띄움. expo-router가 이동을 다음 렌더 뒤에 처리해서 그냥 `show`하면 떠나는 화면에 먼저 보였다가 도착 화면에서 또 뜸
- Modal: props형. `visible`/`onClose`로 제어. 전역 `confirm()`은 같은 확인 모달이 여러 화면에서 반복될 때 추가
- RN `<Modal>`·`presentation: 'modal'` 화면은 iOS에서 화면 안 `ToastOutlet`보다 위에 그려져 Toast가 가려짐. 모달 위 토스트가 필요하면 별도 처리
