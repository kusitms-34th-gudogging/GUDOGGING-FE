// src/lib/nativewindInterop.ts에서 cssInterop으로 연결한 className 타입
import 'lottie-react-native/lib/typescript/types';

declare module 'lottie-react-native/lib/typescript/types' {
  interface LottieViewProps {
    className?: string;
  }
}
