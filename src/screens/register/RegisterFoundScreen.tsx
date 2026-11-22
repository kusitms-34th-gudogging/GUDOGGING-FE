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
import type { PaymentInfo } from '@/constants/services';
import { useCreateSubscriptions } from '@/hooks/useCreateSubscriptions';
import {
  getFoundServiceIds,
  readyPayment,
  useRegisterDraft,
  useRegisterServices,
} from '@/hooks/useRegisterDraft';
import { useToast } from '@/hooks/useToast';

export const RegisterFoundScreen = () => {
  const payments = useRegisterDraft((s) => s.payments);
  const found = useRegisterDraft((s) => s.found);
  const foundSource = useRegisterDraft((s) => s.foundSource);
  const create = useCreateSubscriptions();
  const { show } = useToast();
  const foundChecked = useRegisterDraft((s) => s.foundChecked);
  const setFoundChecked = useRegisterDraft((s) => s.setFoundChecked);
  const checked = new Set(foundChecked);
  // 구독 추가하기로 추가한 구독. 결제 정보를 넣기 전엔 확인 필요에 보임. 불러온 것과 같은 서비스는 불러온 쪽만 보여 줌 (이름을 바꾼 불러온 구독은 다른 서비스로 봄)
  const added = useRegisterServices(useRegisterDraft((s) => s.selectedIds)).filter(
    (s) => !getFoundServiceIds(found, payments).includes(s.id),
  );
  const items = [
    // 수정 화면에서 저장한 값이 분석 값보다 우선. 확인 필요가 아닌 분석 값은 모든 칸이 채워져 있음
    ...found.map((f) => {
      // 수정 화면에서 바꾼 이름이 있으면 그 이름. 이름을 바꿨으면 분석이 잘못 알아본 다른 서비스로 봄
      const name = payments[f.id]?.name ?? f.name;
      return {
        id: f.id,
        serviceId: name === f.name ? f.serviceId : undefined,
        name,
        payment: readyPayment(
          payments[f.id] ?? (f.needsReview ? undefined : (f.payment as PaymentInfo)),
        ),
      };
    }),
    ...added.map((s) => ({
      id: s.id,
      // 직접 입력(custom-)은 사전 등록 서비스가 아님
      serviceId: s.id.startsWith('custom-') ? undefined : s.id,
      name: s.name,
      payment: readyPayment(payments[s.id]),
    })),
  ];
  const needCheck = items.filter((f) => !f.payment);
  const ready = items.filter((f) => f.payment);
  // 확인 필요 항목은 체크박스가 없어 입력을 마쳐 등록 가능으로 옮겨진 것만 셈 (분석 단계에서 미리 체크돼 있어도)
  const selected = ready.filter((f) => checked.has(f.id));

  const toggle = (id: string, next: boolean) =>
    setFoundChecked(next ? [...checked, id] : [...checked].filter((v) => v !== id));

  const edit = (id: string) =>
    router.push({ pathname: '/register/input', params: { id, found: '1' } });

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="불러온 구독 확인"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      {/* 목록은 최대 402(CTA 위 56까지), 넘치면 내부 스크롤 + 하단 페이드 (Figma A-13 목록 주석을 확인 필요 섹션까지 묶어 적용) */}
      <View className="flex-1 gap-section px-screen-x pb-[56px] pt-stack-md">
        <ScreenTitle
          title={'찾은 구독 정보를\n확인해 주세요.'}
          description="구독이 아닌 항목은 제외할 수 있어요."
        />
        <FadeScrollView className="max-h-[402px] shrink" contentContainerClassName="gap-stack-md">
          {needCheck.length > 0 && (
            <>
              <View className="gap-stack-md">
                <Text className="px-s2 text-text-primary text-body3-semibold">
                  확인 필요{' '}
                  <Text className="text-text-error text-body3-bold">{needCheck.length}</Text>
                </Text>
                <View className="gap-inline-sm">
                  {needCheck.map((f) => (
                    <PaymentListItem
                      key={f.id}
                      name={f.name}
                      // 스크린샷은 서비스명도 확인 대상이라 '구독 정보', Gmail은 '결제 정보' (설계서 A-09·A-13)
                      emptySubtitle={
                        foundSource === 'GMAIL' ? '결제 정보 입력 필요' : '구독 정보 입력 필요'
                      }
                      onEdit={() => edit(f.id)}
                      showChevron
                    />
                  ))}
                </View>
              </View>
              <View className="h-px bg-border-default" />
            </>
          )}
          <View className="gap-stack-md">
            <Text className="text-text-primary text-body3-semibold">
              등록 가능 <Text className="text-body3-bold">{ready.length}</Text>
            </Text>
            <View className="gap-stack-xs">
              {ready.map((f) => (
                <PaymentListItem
                  key={f.id}
                  name={f.name}
                  payment={f.payment}
                  emptySubtitle=""
                  onEdit={() => edit(f.id)}
                  showCheckBox
                  checked={checked.has(f.id)}
                  onCheckedChange={(next) => toggle(f.id, next)}
                />
              ))}
              <AddServiceRow
                label="구독 추가하기"
                onPress={() => router.push({ pathname: '/register/select', params: { more: '1' } })}
              />
            </View>
          </View>
        </FadeScrollView>
        {/* 등록 실패 토스트는 CTA 위 8 (Figma A-07 에러처리와 통일) */}
        <ToastOutlet className="bottom-0 pb-stack-sm" />
      </View>
      <View className="pb-safe px-screen-x">
        {/* 등록 가능에서 체크한 구독이 있으면 활성화 (등록 가능은 결제 정보가 다 있음). 등록 성공 후 완료 화면으로
            실패하면 입력은 그대로 두고 안내 */}
        <Cta
          testID="register-found-submit"
          label="선택한 구독 등록하기"
          disabled={selected.length === 0 || create.isPending}
          onPress={() =>
            create.mutate(
              {
                source: foundSource ?? 'SCREENSHOT',
                subscriptions: selected.map((f) => ({
                  serviceId: f.serviceId,
                  name: f.name,
                  payment: f.payment!,
                })),
              },
              {
                // 완료 화면은 등록 응답으로 그림
                onSuccess: () => router.push('/register/done'),
                onError: () => show({ type: 'error', message: '구독 등록에 실패했어요' }),
              },
            )
          }
          className="mb-[14px]"
        />
      </View>
    </View>
  );
};
