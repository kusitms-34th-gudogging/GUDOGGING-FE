import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { AccessibilityInfo, View } from 'react-native';

import { Button } from '@/components/common/Button';
import { ShakingAlertIcon } from '@/components/common/ShakingAlertIcon';
import { StatusBlurBackground } from '@/components/common/StatusBlurBackground';
import { Text } from '@/components/common/Text';
import { ToastOutlet } from '@/components/common/ToastProvider';
import { TopBar } from '@/components/common/TopBar';
import { useConnectGmail } from '@/hooks/useConnectGmail';
import { useWithdraw } from '@/hooks/useWithdraw';
import { requestGmailAuthCode } from '@/lib/account';

// E-04 Gmail 연동 실패 · E-10 회원 탈퇴 실패: 배치·모션은 같고 문구·버튼만 다름
// 취소(확인·취소하기)는 직전 화면(E-02·E-07)으로, 다시 시도하기는 같은 요청을 다시 보냄
const COPY = {
  gmail: { header: 'Gmail 연동', title: 'Gmail을 연결하지 못했어요.', cancelLabel: '확인' },
  withdraw: { header: '회원 탈퇴', title: '회원 탈퇴에 실패했어요.', cancelLabel: '취소하기' },
};

interface MypageFailedScreenProps {
  kind: keyof typeof COPY;
}

export const MypageFailedScreen = ({ kind }: MypageFailedScreenProps) => {
  const { header, title, cancelLabel } = COPY[kind];
  const connectGmail = useConnectGmail();
  const withdraw = useWithdraw();
  const [retrying, setRetrying] = useState(false);

  useEffect(() => {
    AccessibilityInfo.announceForAccessibility(title);
  }, [title]);

  // 성공하면 다음 화면으로, 실패하면 이 화면을 다시 보여 줌 (안내 다시 읽기)
  const retry = async () => {
    setRetrying(true);
    try {
      if (kind === 'gmail') {
        const authCode = await requestGmailAuthCode();
        // 연결되면 E-03, 계정 선택을 취소하면 E-02 (둘 다 직전 Gmail 연동 화면이 상태대로 보여 줌)
        if (authCode) await connectGmail.mutateAsync(authCode);
        router.back();
      } else {
        await withdraw.mutateAsync();
        router.replace('/mypage/withdraw-done');
      }
    } catch {
      AccessibilityInfo.announceForAccessibility(title);
    } finally {
      setRetrying(false);
    }
  };

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <StatusBlurBackground />
      <TopBar
        variant="detail"
        title={header}
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      {/* 아이콘 y 316 (상태바 44 + Top bar 56 기준), 블러 흰 영역과 같은 자리 */}
      <View className="flex-1 items-center gap-screen-x pt-[216px]">
        <ShakingAlertIcon />
        <Text className="text-center text-text-primary text-head3-bold">{title}</Text>
      </View>
      <ToastOutlet placement="aboveCta" />
      <View className="pb-safe px-screen-x">
        <View className="mb-[14px] flex-row gap-inline-sm">
          <Button
            variant="tonal"
            label={cancelLabel}
            onPress={() => router.back()}
            className="flex-1"
          />
          {/* 요청 중 다시 눌러 두 번 보내지 않게 */}
          <Button label="다시 시도하기" disabled={retrying} onPress={retry} className="flex-1" />
        </View>
      </View>
    </View>
  );
};
