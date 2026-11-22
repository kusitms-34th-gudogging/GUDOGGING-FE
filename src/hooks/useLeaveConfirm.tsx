import { router, usePreventRemove } from 'expo-router';
import { useState } from 'react';

import { Modal } from '@/components/common/Modal';

export const useLeaveConfirm = (prevent: boolean) => {
  const [open, setOpen] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const disable = usePreventRemove(prevent && !leaving, () => setOpen(true));
  const allowLeave = () => {
    setLeaving(true);
    disable();
  };

  const modal = (
    <Modal
      visible={open}
      onClose={() => setOpen(false)}
      buttons="both"
      title="등록을 그만할까요?"
      description="입력한 내용이 저장되지 않을 수 있어요."
      cancelLabel="나가기"
      // 저장하지 않은 입력값만 버리고 이전 화면으로 (설계서). 고른 서비스·임시저장은 유지
      onCancel={() => {
        allowLeave();
        router.back();
      }}
      confirmLabel="계속 작성하기"
    />
  );

  return { modal, allowLeave };
};
