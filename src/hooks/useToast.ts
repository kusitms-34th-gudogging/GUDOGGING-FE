import { useContext } from 'react';

import { ToastContext } from '@/components/common/ToastProvider';

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast는 ToastProvider 안에서만 쓸 수 있어요');
  return context;
};
