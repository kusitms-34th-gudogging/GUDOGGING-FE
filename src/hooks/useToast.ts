import { usePathname } from 'expo-router';
import { useContext } from 'react';

import { ToastContext } from '@/components/common/ToastProvider';

// 띄운 화면 경로를 붙여서 그 화면의 ToastOutlet에만 보이게 함
export const useToast = () => {
  const context = useContext(ToastContext);
  const pathname = usePathname();
  if (!context) throw new Error('useToast는 ToastProvider 안에서만 쓸 수 있어요');
  const { show } = context;
  return {
    ...context,
    show: (...[toast, options]: Parameters<typeof show>) => show(toast, { ...options, pathname }),
  };
};
