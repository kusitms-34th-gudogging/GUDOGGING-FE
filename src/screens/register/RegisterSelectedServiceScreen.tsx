import { router } from 'expo-router';
import { View } from 'react-native';

import { Cta } from '@/components/common/Cta';
import { ScreenTitle } from '@/components/common/ScreenTitle';
import { ToastOutlet } from '@/components/common/ToastProvider';
import { TopBar } from '@/components/common/TopBar';
import { AddServiceRow } from '@/components/register/AddServiceRow';
import { FadeScrollView } from '@/components/register/FadeScrollView';
import { PaymentListItem } from '@/components/register/PaymentListItem';
import { useCreateSubscriptions } from '@/hooks/useCreateSubscriptions';
import {
  readyPayment,
  useRegisterDraft,
  useRegisterServices,
  useRegisterStep,
} from '@/hooks/useRegisterDraft';
import { useToast } from '@/hooks/useToast';

export const RegisterSelectedServiceScreen = () => {
  useRegisterStep('CONFIRM_SUBSCRIPTIONS');
  // A-02에서 고른 목록은 저장소가 원본 (구독 추가하기로 바꿔도 바로 반영)
  const serviceIds = useRegisterDraft((s) => s.selectedIds);
  // 다음 결제일이 지난 결제 정보는 미입력으로 (결제 정보 입력 필요)
  const stored = useRegisterDraft((s) => s.payments);
  const payments = Object.fromEntries(
    Object.entries(stored).flatMap(([id, p]) => (readyPayment(p) ? [[id, p]] : [])),
  );
  // 결제 정보가 없는 구독부터 (Figma 주석)
  const services = useRegisterServices(serviceIds).sort(
    (a, b) => Number(!!payments[a.id]) - Number(!!payments[b.id]),
  );
  const allEntered = services.length > 0 && services.every((s) => payments[s.id]);
  const create = useCreateSubscriptions();
  const { show } = useToast();
  // 직접 입력(custom-)은 사전 등록 서비스 id 없이 이름으로
  // 실패하면(이미 구독 중 등) 하나도 저장되지 않음. 입력은 그대로 두고 안내 (설계서: 실패 시 입력 유지)
  const register = () =>
    create.mutate(
      {
        source: 'MANUAL',
        subscriptions: services.map((s) => ({
          serviceId: s.id.startsWith('custom-') ? undefined : s.id,
          name: s.name,
          payment: payments[s.id],
        })),
      },
      {
        onSuccess: () => router.push('/register/done'),
        onError: () => show({ type: 'error', message: '구독 등록에 실패했어요' }),
      },
    );

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="선택한 구독"
        // 불러오기로 바로 들어와도 서비스 선택(A-02)으로 (기획 답변)
        onBack={() => router.dismissTo('/register/select')}
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
              testID={`register-payment-${s.id}`}
              name={s.name}
              logoUrl={s.logoUrl}
              payment={payments[s.id]}
              emptySubtitle="결제 정보 입력 필요"
              onEdit={() => router.push({ pathname: '/register/input', params: { id: s.id } })}
              showChevron
            />
          ))}
          {/* 위에 서비스 선택을 쌓아 선택 완료·뒤로가기 모두 이 화면으로 돌아옴 (QA KAN-80) */}
          <AddServiceRow label="구독 추가하기" onPress={() => router.push('/register/select')} />
        </FadeScrollView>
        {/* 등록 실패 토스트는 CTA 위 8 (Figma A-07 에러처리와 통일) */}
        <ToastOutlet className="bottom-0 pb-stack-sm" />
      </View>
      <View className="pb-safe px-screen-x">
        {/* 모든 서비스 결제 정보 입력이 완료되면 활성화. 등록 성공 후 완료 화면으로 */}
        <Cta
          testID="register-submit"
          label={`${services.length}개 구독 등록하기`}
          disabled={!allEntered || create.isPending}
          onPress={register}
          className="mb-[14px]"
        />
      </View>
    </View>
  );
};
