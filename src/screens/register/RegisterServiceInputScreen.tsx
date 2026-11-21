import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Keyboard, Pressable, View } from 'react-native';

import { ImageColorAsset, ImageMonoAsset } from '@/assets/graphics';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Cta } from '@/components/common/Cta';
import { Dial } from '@/components/common/Dial';
import { Dropdown } from '@/components/common/Dropdown';
import { OptionCard } from '@/components/common/OptionCard';
import { QueryState } from '@/components/common/QueryState';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { Text } from '@/components/common/Text';
import { TextField } from '@/components/common/TextField';
import { TopBar } from '@/components/common/TopBar';
import { FadeScrollView } from '@/components/register/FadeScrollView';
import type { SubscriptionDetail } from '@/constants/manage';
import { type FoundSubscription, PAID_AT, type PaidAt, type Service } from '@/constants/services';
import { useLeaveConfirm } from '@/hooks/useLeaveConfirm';
import { useReactivateSubscription } from '@/hooks/useReactivateSubscription';
import { useRegisterDraft, useRegisterStep } from '@/hooks/useRegisterDraft';
import { useServices } from '@/hooks/useServices';
import { useSubscription } from '@/hooks/useSubscriptions';
import { useUpdateSubscription } from '@/hooks/useUpdateSubscription';

const CATEGORIES = [
  '영상·OTT',
  '음악',
  '쇼핑·멤버십',
  '엔터테인먼트',
  '교육·학습',
  '생산성·AI',
  '기타',
];
const CYCLE_UNITS = [
  { unit: '일', example: 'ex) 20일마다 결제돼요' },
  { unit: '주', example: 'ex) 2주마다 결제돼요' },
  { unit: '개월', example: 'ex) 1개월마다 결제돼요' },
  { unit: '년', example: 'ex) 1년마다 결제돼요' },
];

const formatDate = (d: Date) =>
  `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
const startOfToday = () => new Date(new Date().setHours(0, 0, 0, 0));

interface RegisterServiceInputScreenProps {
  // 없으면 직접 입력으로 새 구독 추가 (A-02 직접 입력하기)
  serviceId?: string;
  // 불러온 구독 수정 (A-15): 분석 값으로 채우고 서비스명도 수정 가능
  found?: FoundSubscription;
  // 불러온 구독 확인의 구독 추가하기에서 직접 입력으로 왔으면 그 화면으로 바로 돌아감
  more?: boolean;
  // 지난 구독 재등록(M-05): 그 구독 정보로 채우고 고친 정보로 재등록 (명세: 필드는 구독 정보 수정과 같음)
  reactivateId?: string;
  // 구독 편집(M-03 더보기 > 편집): 그 구독 정보로 채우고 수정해 저장
  editId?: string;
}

// 사전 등록 서비스의 카테고리·기본 금액이 입력란 초기값이라, 서비스 목록을 받은 뒤에 그림
export const RegisterServiceInputScreen = (props: RegisterServiceInputScreenProps) => {
  const services = useServices();
  // 재등록·편집이면 그 구독 정보도 받은 뒤에 그림
  const existingId = props.reactivateId ?? props.editId;
  const prev = useSubscription(existingId);
  const waiting = existingId && services.data ? prev : services;
  if (!services.data || (existingId && !prev.data)) {
    return (
      <View className="pt-safe flex-1 bg-bg-default">
        <QueryState isError={waiting.isError} onRetry={waiting.refetch} />
      </View>
    );
  }
  return (
    <ServiceInputForm
      {...props}
      service={services.data.find((s) => s.id === props.serviceId)}
      reactivate={props.reactivateId ? prev.data : undefined}
      edit={props.editId ? prev.data : undefined}
    />
  );
};

const ServiceInputForm = ({
  serviceId,
  service,
  found,
  more = false,
  reactivate,
  edit,
}: RegisterServiceInputScreenProps & {
  service?: Service;
  reactivate?: SubscriptionDetail;
  edit?: SubscriptionDetail;
}) => {
  // 직접 등록 임시저장 대상만 기록 (구독 편집·재등록·불러온 구독 수정은 직접 등록 흐름이 아님)
  useRegisterStep(edit || reactivate || found ? undefined : 'INPUT_SUBSCRIPTION', serviceId);
  // 사전 등록 서비스(A-03)만 서비스명 잠금, 직접 입력·불러온 구독은 서비스명도 입력·수정
  const isCustom = !service;
  const payments = useRegisterDraft((s) => s.payments);
  const setPayment = useRegisterDraft((s) => s.setPayment);
  // 이미 저장한 값이 있으면 이어서 수정
  const saved = serviceId ? payments[serviceId] : undefined;
  const existing = reactivate ?? edit;
  const init = saved ?? found?.payment ?? existing;
  const [name, setName] = useState(saved?.name ?? existing?.name ?? '');
  const reactivateSubscription = useReactivateSubscription(reactivate?.id ?? '');
  const updateSubscription = useUpdateSubscription(edit?.id ?? '');
  const [category, setCategory] = useState<string | undefined>(
    init?.category ?? (found ? undefined : (service?.category ?? '기타')),
  );
  // 값이 없으면 사전 등록 요금제 기본 금액 (서비스 목록 defaultAmount)
  const [amount, setAmount] = useState(() => {
    const value = init?.amount ?? service?.defaultAmount;
    return value ? String(value) : '';
  });
  // 값이 없으면(분석이 못 읽은 불러온 구독 포함) 기본값: 1개월 · 오늘 · 웹·직접 결제
  const [cycle, setCycle] = useState(String(init?.cycle ?? 1));
  const [unit, setUnit] = useState(init?.unit ?? '개월');
  // 재등록은 다음 결제일을 새로 정해야 해서 비워 두고 고르게 함
  const [nextDate, setNextDate] = useState<Date | undefined>(
    reactivate
      ? undefined
      : (saved?.nextDate ?? found?.payment.nextDate ?? edit?.nextDate ?? startOfToday()),
  );
  const [paidAt, setPaidAt] = useState<PaidAt>(init?.paidAt ?? 'web');
  // 확인 필요(결제 정보 입력 필요)로 들어오면 금액 에러를 켜 두고, 금액을 고치면 끔 (Figma A-15)
  const [amountChecked, setAmountChecked] = useState(!!saved || !found?.needsReview);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [unitSheet, setUnitSheet] = useState(false);
  const [draftUnit, setDraftUnit] = useState<string>();
  const [dateSheet, setDateSheet] = useState(false);
  const [draftDate, setDraftDate] = useState(startOfToday);
  // 처음 값에서 바뀐 게 있으면 뒤로가기·스와이프로 나갈 때 이탈 팝업(A-03c)
  const form = JSON.stringify({ name, category, amount, cycle, unit, nextDate, paidAt });
  const [initialForm] = useState(form);
  const { modal: leaveModal, allowLeave } = useLeaveConfirm(form !== initialForm);

  const cycleNum = Number(cycle);
  const nameValid = !isCustom || !!found || (name.trim().length >= 1 && name.trim().length <= 30);
  // 금액 에러 표시는 안내일 뿐, 금액이 있으면 그대로 저장 가능 (화면설계서 A-15)
  const valid =
    nameValid && !!category && Number(amount) > 0 && cycleNum >= 1 && cycleNum <= 31 && !!nextDate;
  const closeMenu = () => setCategoryOpen(false);
  // 입력칸이 아닌 곳(빈 곳·드롭다운·결제한 곳)을 누르면 키보드도 내림. 숫자 키패드는 완료 키가 없음
  // 다른 입력칸을 누를 땐 키보드가 그 칸으로 넘어가야 해서 입력칸 onFocus는 closeMenu만
  const closeMenuAndKeyboard = () => {
    closeMenu();
    Keyboard.dismiss();
  };
  // shortcut: 직접 입력한 구독은 서비스명 수정 가능(명세)인데 상세 응답에 구분 값이 없어 편집은 모두 이름 고정, 응답에 생기면 직접 입력만 입력란으로
  const headerName = existing?.name ?? (found ? undefined : service?.name);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title={edit ? '구독 정보 편집' : found ? '구독 정보 수정' : '구독 정보 입력'}
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      {/* 입력 영역은 CTA 위 56까지, 넘치면 내부 스크롤 + 하단 페이드 (Figma 주석) */}
      <View className="flex-1 px-screen-x pb-[56px] pt-stack-md">
        <FadeScrollView
          className="flex-1"
          contentContainerClassName="grow"
          keyboardShouldPersistTaps="handled"
        >
          {/* 빈 곳을 누르면 드롭다운 메뉴를 닫고 키보드도 내림. 안쪽 버튼·입력칸은 각자 터치를 가져감 */}
          <Pressable
            accessible={false}
            onPress={closeMenuAndKeyboard}
            className="grow gap-screen-x"
          >
            {/* 편집·재등록도 사전 등록 서비스(A-03)처럼 서비스명은 보여 주기만 함 */}
            {headerName && (
              <View className="flex-row items-center gap-inline-sm">
                <Image
                  source={require('@/assets/images/logo_placeholder.png')}
                  className="size-logo-card rounded-full"
                />
                <Text className="text-text-primary text-body2-semibold">{headerName}</Text>
              </View>
            )}
            <View className="gap-stack-lg">
              {(isCustom || found) && !existing && (
                <TextField
                  testID="register-input-name"
                  label="서비스명"
                  // 불러온 구독은 찾은 이름을 흐리게 보여 주고, 비워 두면 그 이름으로 저장 (Figma A-15)
                  placeholder={found?.name ?? '서비스명을 입력해 주세요'}
                  maxLength={30}
                  value={name}
                  onChangeText={setName}
                  onFocus={closeMenu}
                />
              )}
              <Dropdown
                testID="register-input-category"
                label="카테고리"
                placeholder="카테고리를 선택해 주세요"
                value={category}
                open={categoryOpen}
                onPress={() => {
                  Keyboard.dismiss();
                  setCategoryOpen((o) => !o);
                }}
                options={CATEGORIES}
                onSelect={(v) => {
                  setCategory(v);
                  closeMenu();
                }}
              />
              <TextField
                testID="register-input-amount"
                label="결제 금액"
                placeholder="결제 금액을 입력해 주세요"
                keyboardType="number-pad"
                value={amount.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                onChangeText={(t) => {
                  setAmount(t.replace(/\D/g, ''));
                  setAmountChecked(true);
                }}
                error={!amountChecked}
                helper="금액을 정확히 읽지 못했어요. 실제 결제 금액을 확인해 주세요."
                showHelper={!amountChecked}
                onFocus={closeMenu}
              />
              <View className="flex-row items-end gap-inset-xs">
                <TextField
                  label="결제 주기"
                  keyboardType="number-pad"
                  maxLength={2}
                  value={cycle}
                  onChangeText={(t) => setCycle(t.replace(/\D/g, ''))}
                  error={cycle !== '' && (cycleNum < 1 || cycleNum > 31)}
                  onFocus={closeMenu}
                  className="flex-1"
                />
                <Dropdown
                  label="결제 주기 단위"
                  showLabel={false}
                  placeholder="단위"
                  value={unit}
                  onPress={() => {
                    closeMenuAndKeyboard();
                    setDraftUnit(undefined);
                    setUnitSheet(true);
                  }}
                  className="w-[127px]"
                />
              </View>
              <Dropdown
                testID="register-input-date"
                label="다음 결제일"
                placeholder="다음 결제일을 선택해 주세요"
                value={nextDate && formatDate(nextDate)}
                showIcon={false}
                onPress={() => {
                  closeMenuAndKeyboard();
                  setDraftDate(nextDate ?? startOfToday());
                  setDateSheet(true);
                }}
              />
              <View className="gap-inset-xs">
                <Text className="text-text-primary text-body3-regular">결제한 곳</Text>
                <SegmentedControl
                  options={PAID_AT}
                  selected={paidAt}
                  onSelect={(v) => {
                    setPaidAt(v);
                    closeMenuAndKeyboard();
                  }}
                />
                <Text className="text-text-tertiary text-caption1-regular">
                  {
                    "서비스 홈페이지나 앱에서 카드로 직접 결제했다면\n'웹·직접 결제'를 골라 주세요. 해지 방법 안내에 쓰여요."
                  }
                </Text>
              </View>
            </View>
          </Pressable>
        </FadeScrollView>
      </View>
      <View className="pb-safe px-screen-x">
        <Cta
          testID="register-input-save"
          label={found ? '수정 완료' : '저장하기'}
          disabled={!valid || reactivateSubscription.isPending || updateSubscription.isPending}
          onPress={() => {
            if (!category || !nextDate) return;
            // 재등록·편집: 저장하면 상세로 돌아가 구독 중(M-03)·바뀐 정보를 보여 줌
            // shortcut: 실패 안내는 디자인에 없어 화면에 남음
            if (existing) {
              const input = {
                name,
                category,
                amount: Number(amount),
                cycle: cycleNum,
                unit,
                nextDate,
                paidAt,
              };
              const back = {
                onSuccess: () => {
                  allowLeave();
                  router.back();
                },
              };
              return reactivate
                ? reactivateSubscription.mutate(input, back)
                : updateSubscription.mutate(input, back);
            }
            const id = serviceId ?? `custom-${Date.now()}`;
            setPayment(id, {
              name: found ? name.trim() || found.name : isCustom ? name.trim() : undefined,
              category,
              amount: Number(amount),
              cycle: cycleNum,
              unit,
              nextDate,
              paidAt,
            });
            allowLeave();
            // 기존 항목 수정은 앞 화면으로. 새 직접 입력은 A-02 자리를 A-04로 바꿔 목록에 합류,
            // 불러온 구독 확인에서 왔으면 그 화면으로 돌아가 등록 가능에 체크된 채로 보임
            if (serviceId) router.back();
            else if (more) {
              useRegisterDraft.getState().addFoundChecked([id]);
              router.dismissTo('/register/found');
            } else router.replace('/register/selected');
          }}
          className="mb-[14px]"
        />
      </View>
      <BottomSheet
        visible={unitSheet}
        onClose={() => setUnitSheet(false)}
        title="결제 주기 단위를 선택해 주세요"
        confirmLabel="확인"
        confirmDisabled={!draftUnit}
        onConfirm={() => draftUnit && setUnit(draftUnit)}
      >
        <View className="gap-[6px]">
          {CYCLE_UNITS.map((c) => (
            <OptionCard
              key={c.unit}
              title={c.unit}
              description={c.example}
              asset={ImageColorAsset}
              monoAsset={ImageMonoAsset}
              selected={draftUnit === c.unit}
              onSelect={() => setDraftUnit(c.unit)}
            />
          ))}
        </View>
      </BottomSheet>
      <BottomSheet
        visible={dateSheet}
        onClose={() => setDateSheet(false)}
        title="다음 결제일을 선택해 주세요"
        description="카드 결제 내역이나 앱 구독 화면에서 확인할 수 있어요."
        confirmLabel="확인"
        // 과거 결제일은 허용하지 않음 (명세)
        confirmDisabled={draftDate < startOfToday()}
        onConfirm={() => setNextDate(draftDate)}
        confirmTestID="register-date-confirm"
      >
        <Dial value={draftDate} onValueChange={setDraftDate} />
      </BottomSheet>
      {leaveModal}
    </View>
  );
};
