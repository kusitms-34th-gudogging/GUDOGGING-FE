import { router } from 'expo-router';
import { View } from 'react-native';

import { Cta } from '@/components/common/Cta';
import { TopBar } from '@/components/common/TopBar';
import { AddServiceRow } from '@/components/register/AddServiceRow';
import { FadeScrollView } from '@/components/register/FadeScrollView';
import { PaymentListItem } from '@/components/register/PaymentListItem';
import { ScreenTitle } from '@/components/register/ScreenTitle';
import { useRegisterDraft, useRegisterServices } from '@/hooks/useRegisterDraft';

export const RegisterSelectedServiceScreen = () => {
  // A-02에서 고른 목록은 저장소가 원본 (구독 추가하기로 바꿔도 바로 반영)
  const serviceIds = useRegisterDraft((s) => s.selectedIds);
  const payments = useRegisterDraft((s) => s.payments);
  // 결제 정보가 없는 구독부터 (Figma 주석)
  const services = useRegisterServices(serviceIds).sort(
    (a, b) => Number(!!payments[a.id]) - Number(!!payments[b.id]),
  );
  const allEntered = services.length > 0 && services.every((s) => payments[s.id]);
  const ids = services.map((s) => s.id);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="선택한 구독"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      {/* 목록은 CTA와 56 유지 (Figma 목록 주석) */}
      <View className="flex-1 gap-section px-screen-x pb-[56px] pt-stack-md">
        {/* head 프레임 높이 108(내용 106)이라 설명 아래 2 */}
        <View className="pb-s2">
          <ScreenTitle
            title={'선택한 구독 정보를\n입력해 주세요.'}
            description="항목을 눌러 결제 금액과 다음 결제일을 입력해요."
          />
        </View>
        {/* 내용만큼 늘어나되 최대 400, 넘치면 스크롤 + 하단 페이드 */}
        <FadeScrollView className="max-h-[400px] shrink" contentContainerClassName="gap-inline-sm">
          {services.map((s) => (
            <PaymentListItem
              key={s.id}
              name={s.name}
              payment={payments[s.id]}
              emptySubtitle="결제 정보 입력 필요"
              onEdit={() => router.push({ pathname: '/register/input', params: { id: s.id } })}
              showChevron
            />
          ))}
          {/* 이어서 등록으로 바로 들어오면 앞 화면이 서비스 선택이 아니라서 경로로 이동 */}
          <AddServiceRow
            label="구독 추가하기"
            onPress={() => router.dismissTo('/register/select')}
          />
        </FadeScrollView>
      </View>
      <View className="pb-safe px-screen-x">
        {/* 모든 서비스 결제 정보 입력이 완료되면 활성화. shortcut: 등록 API 없이 완료 화면으로만 이동, API 연동 시 저장 성공 후 이동 */}
        <Cta
          label={`${services.length}개 구독 등록하기`}
          disabled={!allEntered}
          onPress={() =>
            router.push({ pathname: '/register/done', params: { ids: ids.join(',') } })
          }
          className="mb-[14px]"
        />
      </View>
    </View>
  );
};
