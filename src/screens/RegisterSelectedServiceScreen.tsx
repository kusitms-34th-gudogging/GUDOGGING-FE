import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { ChevronRightIcon, PlusIcon } from '@/assets/icons';
import { Cta } from '@/components/common/Cta';
import { ListItem } from '@/components/common/ListItem';
import { TopBar } from '@/components/common/TopBar';
import { SERVICES } from '@/constants/services';

interface RegisterSelectedServiceScreenProps {
  serviceIds: string[];
}

export const RegisterSelectedServiceScreen = ({
  serviceIds,
}: RegisterSelectedServiceScreenProps) => {
  const services = SERVICES.filter((s) => serviceIds.includes(s.id));

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="선택한 구독"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <View className="flex-1 gap-inset-lg px-screen-x pt-stack-md">
        <View className="gap-inline-sm">
          <Text className="text-text-primary text-head1-bold">
            {'선택한 구독 정보를\n입력해 주세요.'}
          </Text>
          <Text className="text-text-primary text-body2-regular">
            항목을 눌러 결제 금액과 다음 결제일을 입력해요.
          </Text>
        </View>
        {/* 구독 최대 5개 + 서비스 더 선택하기 = 434, 이후 스크롤 */}
        <ScrollView className="max-h-[434px] shrink" contentContainerClassName="gap-inline-xs">
          {services.map((s) => (
            // A-03 화면이 생기면 행 누르면 이동
            <ListItem
              key={s.id}
              title={s.name}
              subtitle="결제 정보 입력 필요"
              showSubtitle
              logo={require('@/assets/images/logo_placeholder.png')}
              showLogo
              cost="입력하기"
              showCost
              costColor="text-text-error"
              iconRight={ChevronRightIcon}
              showIconRight
              iconRightColor="text-text-error"
            />
          ))}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.back()}
            className="h-[69px] flex-row items-center gap-inline-md border-b-default border-border-default px-inline-xs active:opacity-pressed"
          >
            <PlusIcon className="size-[28px] text-icon-secondary" />
            <Text className="text-text-secondary text-body2-semibold">서비스 더 선택하기</Text>
          </Pressable>
        </ScrollView>
      </View>
      <View className="pb-safe px-screen-x">
        {/* shortcut: A-03 결제 정보 입력이 없어 항상 비활성, 연결 시 모든 구독 입력 완료면 활성화 */}
        <Cta label={`${services.length}개 구독 등록하기`} disabled className="mb-[14px]" />
      </View>
    </View>
  );
};
