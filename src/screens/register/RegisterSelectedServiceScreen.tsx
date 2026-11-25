import { router } from 'expo-router';
import { View } from 'react-native';

import { Cta } from '@/components/common/Cta';
import { ScreenTitle } from '@/components/common/ScreenTitle';
import { Text } from '@/components/common/Text';
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

// 목록은 불러온 구독 확인(A-09)과 같은 UI·선택 로직 (기획 변경: 등록 방식과 관계없이 최종 확인 화면 통일)
export const RegisterSelectedServiceScreen = () => {
  useRegisterStep('CONFIRM_SUBSCRIPTIONS');
  // A-02에서 고른 목록은 저장소가 원본 (구독 추가하기로 바꿔도 바로 반영)
  const serviceIds = useRegisterDraft((s) => s.selectedIds);
  // 다음 결제일이 지난 결제 정보는 미입력으로 (결제 정보 입력 필요)
  const stored = useRegisterDraft((s) => s.payments);
  const payments = Object.fromEntries(
    Object.entries(stored).flatMap(([id, p]) => (readyPayment(p) ? [[id, p]] : [])),
  );
  // 섹션 안은 추가한 순서 (기능명세서 A-04). 등록 요청도 이 순서라 완료 화면도 추가한 순서
  const services = useRegisterServices(serviceIds);
  const needCheck = services.filter((s) => !payments[s.id]);
  const ready = services.filter((s) => payments[s.id]);
  // 입력을 마치면 체크된 채로 등록 가능에 들어감. 체크를 푼 것만 저장 (A-09 설계서: 최초 상태는 선택)
  const unchecked = useRegisterDraft((s) => s.unchecked);
  const setUnchecked = useRegisterDraft((s) => s.setUnchecked);
  const selected = ready.filter((s) => !unchecked.includes(s.id));
  const toggle = (id: string, next: boolean) =>
    setUnchecked(next ? unchecked.filter((v) => v !== id) : [...unchecked, id]);
  const create = useCreateSubscriptions();
  const { show } = useToast();
  const edit = (id: string) => router.push({ pathname: '/register/input', params: { id } });
  // 확인 필요는 빼고 등록 가능에서 체크한 것만 등록 (A-09와 같음)
  // 직접 입력(custom-)은 사전 등록 서비스 id 없이 이름으로
  // 실패하면(이미 구독 중 등) 하나도 저장되지 않음. 입력은 그대로 두고 안내 (설계서: 실패 시 입력 유지)
  const register = () =>
    create.mutate(
      {
        source: 'MANUAL',
        subscriptions: selected.map((s) => ({
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
      {/* 목록은 최대 402(CTA 위 56까지), 넘치면 내부 스크롤 + 하단 페이드 (A-09와 같음) */}
      <View className="flex-1 gap-section px-screen-x pb-[56px] pt-stack-md">
        <ScreenTitle
          title={'선택한 구독 정보를\n입력해 주세요.'}
          description="항목을 눌러 결제 금액과 다음 결제일을 입력해요."
        />
        {/* 구분선이 화면 끝까지 가게 스크롤 영역은 화면 폭, 좌우 여백은 내용에 */}
        <FadeScrollView
          className="-mx-screen-x max-h-[402px] shrink"
          contentContainerClassName="gap-inset-lg px-screen-x"
        >
          {needCheck.length > 0 && (
            <>
              <View className="gap-stack-md">
                <Text className="px-s2 text-text-primary text-body3-semibold">
                  확인 필요{' '}
                  <Text className="text-text-error text-body3-bold">{needCheck.length}</Text>
                </Text>
                <View className="gap-inline-sm">
                  {needCheck.map((s) => (
                    <PaymentListItem
                      key={s.id}
                      testID={`register-payment-${s.id}`}
                      name={s.name}
                      logoUrl={s.logoUrl}
                      emptySubtitle="결제 정보 입력 필요"
                      onEdit={() => edit(s.id)}
                      showChevron
                    />
                  ))}
                </View>
              </View>
              {/* 구분선 0.5는 토큰 없음 (border 최소 1) */}
              <View className="-mx-screen-x h-[0.5px] bg-bg-muted" />
            </>
          )}
          <View className="gap-stack-md">
            <Text className="text-text-primary text-body3-semibold">
              등록 가능 <Text className="text-body3-bold">{ready.length}</Text>
            </Text>
            <View className="gap-stack-sm">
              {ready.map((s) => (
                <PaymentListItem
                  key={s.id}
                  testID={`register-payment-${s.id}`}
                  name={s.name}
                  logoUrl={s.logoUrl}
                  payment={payments[s.id]}
                  emptySubtitle=""
                  onEdit={() => edit(s.id)}
                  showCheckBox
                  checked={!unchecked.includes(s.id)}
                  onCheckedChange={(next) => toggle(s.id, next)}
                />
              ))}
              {/* 위에 서비스 선택을 쌓아 선택 완료·뒤로가기 모두 이 화면으로 돌아옴 (QA KAN-80) */}
              <AddServiceRow
                label="구독 추가하기"
                onPress={() => router.push('/register/select')}
              />
            </View>
          </View>
        </FadeScrollView>
        {/* 등록 실패 토스트는 CTA 위 8 (Figma A-07 에러처리와 통일) */}
        <ToastOutlet className="bottom-0 pb-stack-sm" />
      </View>
      <View className="pb-safe px-screen-x">
        {/* 등록 가능에서 체크한 구독이 있으면 활성화. 등록 성공 후 완료 화면으로 */}
        <Cta
          testID="register-submit"
          label={`${selected.length}개 구독 등록하기`}
          disabled={selected.length === 0 || create.isPending}
          onPress={register}
          className="mb-[14px]"
        />
      </View>
    </View>
  );
};
