# Toast · Modal

참고 코드: `src/components/common/Toast.tsx` · `src/components/common/ToastProvider.tsx` · `src/components/common/Modal.tsx` · `src/hooks/useToast.ts`

- Toast: 전역 호출형. `src/app/_layout.tsx`에서 `ToastProvider`로 한 번 감싸고 `useToast().show({ type, message })`로 호출 (Context + Reanimated, 라이브러리 추가 안 함). 위치는 화면마다 달라서 쓰는 화면이 `ToastOutlet`을 원하는 자리에 둠. Outlet이 없는 화면에선 토스트가 안 보임
  - 노출 시간: 모든 토스트 2초로 통일 (기디 요청. 화면설계서의 1초보다 우선). `ToastProvider`의 `VISIBLE_MS` 한 곳에서 관리하고 화면별로 바꾸지 않음
  - CTA·버튼 위: 버튼 위 8 (Figma A-07 스크린샷 등록 에러처리와 통일). CTA 바로 위 본문 영역 끝에 `bottom-0 pb-stack-sm` (예: `RegisterScreenshotImagesScreen`)
  - 탭바 위: 탭바 위 12 (Figma M-02.2.1 구독 관리 삭제 후 토스트와 통일). 탭바는 하단 안전 영역 + 4 + 52라서 `pb-safe absolute inset-x-0 bottom-0` 안에 `mb-[68px]`인 높이 0 기준점을 두고 `bottom-0` (예: `ManageScreen`). + 버튼과 겹치면 토스트가 위에 오게 `z-10`
  - `pb-safe` 있는 View 안에서 `bottom-full`은 패딩만큼 어긋남 → 높이 0 기준점 + `bottom-0`으로
- Modal: props형. `visible`/`onClose`로 제어. 전역 `confirm()`은 같은 확인 모달이 여러 화면에서 반복될 때 추가
- RN `<Modal>`·`presentation: 'modal'` 화면은 iOS에서 화면 안 `ToastOutlet`보다 위에 그려져 Toast가 가려짐. 모달 위 토스트가 필요하면 별도 처리
