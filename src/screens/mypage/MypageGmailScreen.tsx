import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { CheckCircleIcon } from '@/assets/icons';
import { Cta } from '@/components/common/Cta';
import { Modal } from '@/components/common/Modal';
import { QueryState } from '@/components/common/QueryState';
import { Text } from '@/components/common/Text';
import { ToastOutlet } from '@/components/common/ToastProvider';
import { TopBar } from '@/components/common/TopBar';
import { useConnectGmail } from '@/hooks/useConnectGmail';
import { useDisconnectGmail } from '@/hooks/useDisconnectGmail';
import { useGmailConnection } from '@/hooks/useGmailConnection';
import { useToast } from '@/hooks/useToast';
import { requestGmailAuthCode } from '@/lib/account';

interface MypageGmailScreenProps {
  requestAuthCode?: typeof requestGmailAuthCode;
}

// E-02 미연결 · E-03 연결됨 · 연결 실패 시 E-04, 해제 실패 시 E-03 유지 + 토스트
export const MypageGmailScreen = ({
  requestAuthCode = requestGmailAuthCode,
}: MypageGmailScreenProps) => {
  const { data: gmail, isError, refetch } = useGmailConnection();
  const connectGmail = useConnectGmail();
  const disconnectGmail = useDisconnectGmail();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { show } = useToast();

  const connect = async () => {
    try {
      const authCode = await requestAuthCode();
      // 취소하면 연동하지 않고 마이페이지로 (화면설계서 E-02 4-2)
      if (!authCode) return router.back();
      await connectGmail.mutateAsync(authCode);
    } catch {
      router.push('/mypage/gmail-failed');
    }
  };

  const disconnect = () =>
    disconnectGmail.mutate(undefined, {
      onSuccess: () => show({ type: 'success', message: 'Gmail 연결을 해제했어요' }),
      // 연결 상태 유지 (화면설계서 E-03b). shortcut: 안내 문구·방식 미정, 정해지면 교체
      onError: () =>
        show({ type: 'error', message: '연결을 해제하지 못했어요. 다시 시도해 주세요.' }),
    });

  const topBar = (
    <TopBar
      variant="detail"
      title="Gmail 연동"
      onBack={() => router.back()}
      showAction1={false}
      showAction2={false}
    />
  );
  if (gmail === undefined) {
    return (
      <View className="pt-safe flex-1 bg-bg-default">
        {topBar}
        <QueryState isError={isError} onRetry={refetch} />
        <ToastOutlet placement="bottom" />
      </View>
    );
  }

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      {topBar}
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
        <ToastOutlet className="bottom-0 pb-stack-sm" />
      </View>
      <View className="pb-safe px-screen-x">
        <Cta
          label={gmail ? 'Gmail 연결 해제하기' : 'Gmail 연결하기'}
          onPress={gmail ? () => setConfirmOpen(true) : connect}
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
        onConfirm={disconnect}
      />
    </View>
  );
};
