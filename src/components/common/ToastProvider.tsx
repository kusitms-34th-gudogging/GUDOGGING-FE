import { motion } from '@tokens';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AccessibilityInfo, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';

import { cn } from '@/utils/cn';

import { Toast, type ToastProps } from './Toast';

const VISIBLE_MS = 2500;

interface ToastContextValue {
  show: (toast: ToastProps) => void;
  toast: (ToastProps & { id: number }) | null;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toast, setToast] = useState<(ToastProps & { id: number }) | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const show = useCallback((next: ToastProps) => {
    clearTimeout(timer.current);
    setToast({ ...next, id: Date.now() });
    AccessibilityInfo.announceForAccessibility(next.message);
    timer.current = setTimeout(() => setToast(null), VISIBLE_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(() => ({ show, toast }), [show, toast]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

interface ToastOutletProps {
  // 화면마다 위치가 달라서 쓰는 곳이 정함 (예: CTA 위 본문 영역 끝에 bottom-0 pb-stack-sm)
  className?: string;
}

// 토스트가 그려지는 자리. 이걸 둔 화면에서만 토스트가 보임
export const ToastOutlet = ({ className }: ToastOutletProps) => {
  const toast = useContext(ToastContext)?.toast;

  return (
    <View
      className={cn(
        'pointer-events-box-none absolute inset-x-0 items-center px-screen-x',
        className,
      )}
    >
      {toast && (
        <Animated.View
          key={toast.id}
          entering={FadeIn.duration(motion.transition).easing(
            Easing.bezier(...motion['ease-enter']),
          )}
          exiting={FadeOut.duration(motion.transition).easing(
            Easing.bezier(...motion['ease-exit']),
          )}
          // Figma 인스턴스는 최대 폭 335까지 채움
          className="w-full max-w-[335px]"
        >
          <Toast type={toast.type} message={toast.message} />
        </Animated.View>
      )}
    </View>
  );
};
