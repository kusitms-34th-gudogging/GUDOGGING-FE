import { motion } from '@tokens';
import { useIsFocused, usePathname } from 'expo-router';
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

// 기디 요청으로 2초 노출 (화면설계서는 1초)
const VISIBLE_MS = 2000;

interface ShowOptions {
  // 화면을 떠나면서 띄울 때. 떠나는 화면엔 안 그리고 다음에 포커스되는 화면에서 띄움
  nextScreen?: boolean;
  // 띄운 화면 경로. useToast가 채움
  pathname?: string;
}

type ShownToast = ToastProps & { id: number; pathname?: string };

interface ToastContextValue {
  show: (toast: ToastProps, options?: ShowOptions) => void;
  toast: ShownToast | null;
  // 다음 화면용으로 맡겨 둔 토스트를 꺼냄 (ToastOutlet이 포커스될 때)
  takePending: () => ToastProps | null;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toast, setToast] = useState<ShownToast | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // expo-router는 뒤로 가기·이동을 다음 렌더 뒤에 처리해서, 바로 띄우면 떠나는 화면에 먼저 보임
  const pending = useRef<{ toast: ToastProps; at: number } | null>(null);

  const show = useCallback((next: ToastProps, options?: ShowOptions) => {
    if (options?.nextScreen) {
      pending.current = { toast: next, at: Date.now() };
      return;
    }
    pending.current = null;
    clearTimeout(timer.current);
    setToast({ ...next, id: Date.now(), pathname: options?.pathname });
    AccessibilityInfo.announceForAccessibility(next.message);
    timer.current = setTimeout(() => setToast(null), VISIBLE_MS);
  }, []);

  // 도착 화면에 Outlet이 없으면 맡긴 토스트가 남아 나중 화면에 뜨지 않게 노출 시간 안에서만 꺼냄
  const takePending = useCallback(() => {
    const p = pending.current;
    pending.current = null;
    return p && Date.now() - p.at < VISIBLE_MS ? p.toast : null;
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  const value = useMemo(() => ({ show, toast, takePending }), [show, toast, takePending]);

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

interface ToastOutletProps {
  // 화면마다 위치가 달라서 쓰는 곳이 정함 (예: CTA 위 본문 영역 끝에 bottom-0 pb-stack-sm)
  className?: string;
}

// 토스트가 그려지는 자리. 이걸 둔 화면에서만 토스트가 보임
// 포커스된 화면에서만 그림: 뒤로 가면서 띄우면 떠나는 화면에도 잠깐 보였다가 도착 화면에서 또 떠 두 번처럼 보임
export const ToastOutlet = ({ className }: ToastOutletProps) => {
  const { toast, show, takePending } = useContext(ToastContext) ?? {};
  const focused = useIsFocused();
  const pathname = usePathname();

  // 이 화면이 포커스되는 순간(돌아오거나 처음 열릴 때) 이전 화면이 맡긴 토스트를 띄움.
  // show·takePending은 바뀌지 않아서 포커스가 바뀔 때만 돎
  useEffect(() => {
    const next = focused && takePending?.();
    if (next) show?.(next, { pathname });
  }, [focused, pathname, show, takePending]);

  return (
    <View
      className={cn(
        'pointer-events-box-none absolute inset-x-0 items-center px-screen-x',
        className,
      )}
    >
      {/* 띄운 화면의 토스트만. 떠 있는 동안 뒤로 가거나 다른 화면에 가면 그 화면엔 또 뜨지 않게 */}
      {toast && focused && (!toast.pathname || toast.pathname === pathname) && (
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
