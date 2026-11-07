import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import {
  CheckColorAsset,
  CheckMonoAsset,
  ImageColorAsset,
  ImageMonoAsset,
  MailColorAsset,
  MailMonoAsset,
} from '@/assets/graphics';
import { OptionCard } from '@/components/common/OptionCard';
import { TopBar } from '@/components/common/TopBar';

export type RegisterMethod = 'screenshot' | 'gmail' | 'manual';

const METHODS = [
  {
    method: 'screenshot',
    title: '스크린샷으로 등록',
    description: '구독 목록을 캡처해 한 번에 불러와요.',
    asset: ImageColorAsset,
    monoAsset: ImageMonoAsset,
  },
  {
    method: 'gmail',
    title: 'Gmail에서 불러오기',
    description: '결제 메일에서 구독 정보를 찾아요.',
    asset: MailColorAsset,
    monoAsset: MailMonoAsset,
  },
  {
    method: 'manual',
    title: '직접 등록하기',
    description: '서비스와 결제 정보를 직접 입력해요.',
    asset: CheckColorAsset,
    monoAsset: CheckMonoAsset,
  },
] as const;

// 스크린샷·Gmail 첫 화면은 아직 없음
const FIRST_SCREEN: Partial<Record<RegisterMethod, '/register/select'>> = {
  manual: '/register/select',
};

export const RegisterSubscriptionScreen = () => {
  const [selected, setSelected] = useState<RegisterMethod>();

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="구독 추가"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <View className="gap-inset-lg px-screen-x pt-stack-md">
        <View className="gap-inline-sm">
          <Text className="text-text-primary text-head1-bold">
            {'어떤 방법으로\n구독을 등록할까요?'}
          </Text>
          <Text className="text-text-primary text-body2-regular">편한 방법을 선택해 주세요.</Text>
        </View>
        <View className="gap-stack-md">
          {METHODS.map(({ method, ...card }) => (
            <OptionCard
              key={method}
              {...card}
              selected={selected === method}
              onSelect={() => {
                setSelected(method);
                const next = FIRST_SCREEN[method];
                if (next) router.push(next);
              }}
            />
          ))}
        </View>
      </View>
    </View>
  );
};
