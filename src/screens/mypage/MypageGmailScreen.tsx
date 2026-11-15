import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { CheckCircleIcon } from '@/assets/icons';
import { Cta } from '@/components/common/Cta';
import { Modal } from '@/components/common/Modal';
import { TopBar } from '@/components/common/TopBar';

// shortcut: Gmail OAuth 없이 고정 주소로 연결됨 표시, 연동 작업 시 OAuth 결과 주소로 교체
const SAMPLE_GMAIL = 'suum.mail@gmail.com';

// E-02 미연결 · E-03 연결됨
export const MypageGmailScreen = () => {
  const [gmail, setGmail] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="Gmail 연동"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <View className="flex-1 gap-section px-screen-x pt-stack-md">
        <View className="gap-inline-sm">
          <Text className="text-text-primary text-head1-bold">
            {gmail ? 'Gmail 연동이\n되어있어요.' : 'Gmail 연동이\n안 되어있어요.'}
          </Text>
          <Text className="text-text-primary text-body2-regular">
            {gmail ?? 'Gmail을 연결하면 결제 메일에서 구독 정보를\n불러올 수 있어요.'}
          </Text>
        </View>
        <View className="flex-row items-center gap-inline-sm">
          <CheckCircleIcon className="size-icon-list text-icon-secondary" />
          <Text className="py-[2px] text-text-secondary text-caption2-regular">
            {gmail
              ? '로그인 계정과 별도로 연결된 Gmail 계정이에요.'
              : '로그인 계정과 별도로 연결할 수 있어요.'}
          </Text>
        </View>
      </View>
      <View className="pb-safe px-screen-x">
        <Cta
          label={gmail ? 'Gmail 연결 해제하기' : 'Gmail 연결하기'}
          onPress={gmail ? () => setConfirmOpen(true) : () => setGmail(SAMPLE_GMAIL)}
          className="mb-[14px]"
        />
      </View>
      <Modal
        visible={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        buttons="both"
        title="Gmail 연결을 해제할까요?"
        description={'연결을 해제하면 새 구독 정보를 Gmail에서\n불러올 수 없어요.'}
        cancelLabel="취소"
        confirmLabel="연결 해제하기"
        onConfirm={() => setGmail(null)}
      />
    </View>
  );
};
