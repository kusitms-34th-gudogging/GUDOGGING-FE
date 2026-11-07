import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';

import { ChevronRightIcon } from '@/assets/icons';
import { Cta } from '@/components/common/Cta';
import { ListItem } from '@/components/common/ListItem';
import { TopBar } from '@/components/common/TopBar';
import { AddServiceRow } from '@/components/register/AddServiceRow';
import { useRegisterDraft, useRegisterServices } from '@/hooks/useRegisterDraft';
import { formatPaymentSummary, formatWon } from '@/utils/formatPayment';

export const RegisterSelectedServiceScreen = () => {
  // A-02에서 고른 목록은 저장소가 원본 (서비스 더 선택하기로 바꿔도 바로 반영)
  const serviceIds = useRegisterDraft((s) => s.selectedIds);
  const payments = useRegisterDraft((s) => s.payments);
  const services = useRegisterServices(serviceIds);
  const allEntered = services.length > 0 && services.every((s) => payments[s.id]);

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
          {services.map((s) => {
            const payment = payments[s.id];
            return (
              <ListItem
                key={s.id}
                title={s.name}
                subtitle={payment ? formatPaymentSummary(payment) : '결제 정보 입력 필요'}
                showSubtitle
                logo={require('@/assets/images/logo_placeholder.png')}
                showLogo
                cost={payment ? formatWon(payment.amount) : '입력하기'}
                showCost
                costColor={payment ? 'text-text-primary' : 'text-text-error'}
                iconRight={ChevronRightIcon}
                showIconRight
                iconRightColor={payment ? 'text-icon-primary' : 'text-text-error'}
                iconRightAction={{
                  accessibilityLabel: `${s.name} 결제 정보 ${payment ? '수정하기' : '입력하기'}`,
                  onPress: () => router.push({ pathname: '/register/input', params: { id: s.id } }),
                }}
              />
            );
          })}
          <AddServiceRow onPress={() => router.back()} />
        </ScrollView>
      </View>
      <View className="pb-safe px-screen-x">
        {/* 모든 서비스 결제 정보 입력이 완료되면 활성화. shortcut: 등록 API 없이 완료 화면으로만 이동, API 연동 시 저장 성공 후 이동 */}
        <Cta
          label={`${services.length}개 구독 등록하기`}
          disabled={!allEntered}
          onPress={() =>
            router.push({
              pathname: '/register/done',
              params: { ids: services.map((s) => s.id).join(',') },
            })
          }
          className="mb-[14px]"
        />
      </View>
    </View>
  );
};
