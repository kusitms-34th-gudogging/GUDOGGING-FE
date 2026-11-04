# Toast · Modal

참고 코드: `src/components/common/Toast.tsx` · `src/components/common/Modal.tsx` · `src/hooks/useToast.ts`

- Toast: 전역 호출형. `src/app/_layout.tsx`에 Host 하나 두고 `useToast().show({ type, message })`로 호출 (Context + Reanimated, 라이브러리 추가 안 함)
- Modal: props형. `visible`/`onClose`로 제어. 전역 `confirm()`은 같은 확인 모달이 여러 화면에서 반복될 때 추가
- RN `<Modal>`·`presentation: 'modal'` 화면은 iOS에서 루트 Host보다 위에 그려져 Toast가 가려짐. 모달 위 토스트가 필요하면 별도 처리
