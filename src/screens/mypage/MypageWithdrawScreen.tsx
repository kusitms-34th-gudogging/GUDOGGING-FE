import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AlertCircleIcon } from '@/assets/icons';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { TopBar } from '@/components/common/TopBar';
import { useCheckupDraft } from '@/hooks/useCheckupDraft';
import { useGmailLink } from '@/hooks/useGmailLink';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useRegisterDraft } from '@/hooks/useRegisterDraft';

// shortcut: 탈퇴 API 없음, 기기에 남은 계정 데이터만 비우고 로그인 화면으로. 인증 연동 시 탈퇴 요청·토큰 삭제 추가
const withdraw = () => {
  useGmailLink.getState().setGmail(null);
  useRegisterDraft.getState().reset();
  useCheckupDraft.getState().reset();
  useNotificationSettings.getState().setCheckupReminder(false);
  router.replace('/login');
};

// E-07 회원 탈퇴 안내 · E-08 최종 확인 팝업
export const MypageWithdrawScreen = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="회원 탈퇴"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <View className="flex-1 gap-section px-screen-x pt-stack-md">
        <View className="gap-inline-sm">
          <Text className="text-text-primary text-head1-bold">정말 탈퇴하시겠어요?</Text>
          <Text className="text-text-primary text-body2-regular">
            탈퇴하면 계정과 등록한 구독 데이터가 삭제됩니다.
          </Text>
        </View>
        <View className="flex-row items-center gap-inline-sm">
          <AlertCircleIcon className="size-icon-list text-icon-secondary" />
          <Text className="py-[2px] text-text-secondary text-caption2-regular">
            외부 서비스의 구독은 자동으로 해지되지 않습니다.
          </Text>
        </View>
      </View>
      <View className="pb-safe px-screen-x">
        <View className="mb-[14px] flex-row gap-inline-sm">
          <Button variant="tonal" label="취소" onPress={() => router.back()} className="flex-1" />
          <Button label="탈퇴하기" onPress={() => setConfirmOpen(true)} className="flex-1" />
        </View>
      </View>
      {/* 강조색 버튼이 머무르는 쪽(계속 이용하기), 탈퇴는 회색 왼쪽 (Figma E-08) */}
      <Modal
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        buttons="both"
        title="회원 탈퇴를 진행할까요?"
        description="계정과 구독 데이터를 삭제합니다."
        cancelLabel="탈퇴하기"
        onCancel={withdraw}
        confirmLabel="계속 이용하기"
      />
    </View>
  );
};
