import { motion } from '@tokens';
import {
  createContext,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { AccessibilityInfo, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';

import { Toast, type ToastProps } from './Toast';

const VISIBLE_MS = 2500;

interface ToastContextValue {
  show: (toast: ToastProps) => void;
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

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* shortcut: 탭바 없어 임시로 safe area 바로 위에 붙임, 탭바 생기면 하단 여백 safe area + 64 (탭바 52 + 12) */}
      <View className="pointer-events-box-none pb-safe absolute inset-x-0 bottom-0 items-center px-screen-x">
        {toast && (
          <Animated.View
            key={toast.id}
            entering={FadeIn.duration(motion.transition).easing(
              Easing.bezier(...motion['ease-enter']),
            )}
            exiting={FadeOut.duration(motion.transition).easing(
              Easing.bezier(...motion['ease-exit']),
            )}
          >
            <Toast type={toast.type} message={toast.message} />
          </Animated.View>
        )}
      </View>
    </ToastContext.Provider>
  );
};
