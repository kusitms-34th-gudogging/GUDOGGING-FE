import { router } from 'expo-router';
import { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';

import { ImageColorAsset, ImageMonoAsset } from '@/assets/graphics';
import { BottomSheet } from '@/components/common/BottomSheet';
import { Cta } from '@/components/common/Cta';
import { Dial } from '@/components/common/Dial';
import { Dropdown } from '@/components/common/Dropdown';
import { OptionCard } from '@/components/common/OptionCard';
import { SegmentedControl } from '@/components/common/SegmentedControl';
import { TextField } from '@/components/common/TextField';
import { TopBar } from '@/components/common/TopBar';
import { FadeScrollView } from '@/components/register/FadeScrollView';
import { type FoundSubscription, PAID_AT, type PaidAt, SERVICES } from '@/constants/services';
import { useLeaveConfirm } from '@/hooks/useLeaveConfirm';
import { useRegisterDraft } from '@/hooks/useRegisterDraft';

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
}

export const RegisterServiceInputScreen = ({
  serviceId,
  found,
  more = false,
}: RegisterServiceInputScreenProps) => {
  const service = SERVICES.find((s) => s.id === serviceId);
  // 사전 등록 서비스(A-03)만 서비스명 잠금, 직접 입력·불러온 구독은 서비스명도 입력·수정
  const isCustom = !service;
  const payments = useRegisterDraft((s) => s.payments);
  const setPayment = useRegisterDraft((s) => s.setPayment);
  // 이미 저장한 값이 있으면 이어서 수정
  const saved = serviceId ? payments[serviceId] : undefined;
  const init = saved ?? found?.payment;
  const [name, setName] = useState(saved?.name ?? '');
  const [category, setCategory] = useState<string | undefined>(
    init?.category ?? (found ? undefined : isCustom ? '기타' : CATEGORIES[0]),
  );
  const [amount, setAmount] = useState(init?.amount ? String(init.amount) : '');
  // 값이 없으면(분석이 못 읽은 불러온 구독 포함) 기본값: 1개월 · 오늘 · 웹·직접 결제
  const [cycle, setCycle] = useState(String(init?.cycle ?? 1));
  const [unit, setUnit] = useState(init?.unit ?? '개월');
  const [nextDate, setNextDate] = useState(init?.nextDate ?? startOfToday());
  const [paidAt, setPaidAt] = useState<PaidAt>(init?.paidAt ?? 'web');
  // 확인 필요(결제 정보 입력 필요)로 들어오면 금액 에러를 켜 두고, 금액을 고치면 끔 (Figma A-15)
  const [amountChecked, setAmountChecked] = useState(!!saved || !found?.issue);
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
  const valid =
    nameValid &&
    !!category &&
    amountChecked &&
    Number(amount) > 0 &&
    cycleNum >= 1 &&
    cycleNum <= 31;
  const closeMenu = () => setCategoryOpen(false);

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title={found ? '구독 정보 수정' : '구독 정보 입력'}
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
          {/* 드롭다운 메뉴 바깥(빈 곳)을 누르면 닫힘. 안쪽 버튼·입력칸은 각자 터치를 가져감 */}
          <Pressable accessible={false} onPress={closeMenu} className="grow gap-screen-x">
            {service && !found && (
              <View className="flex-row items-center gap-inline-sm">
                <Image
                  source={require('@/assets/images/logo_placeholder.png')}
                  className="size-logo-card rounded-full"
                />
                <Text className="text-text-primary text-body2-semibold">{service.name}</Text>
              </View>
            )}
            <View className="gap-stack-lg">
              {(isCustom || found) && (
                <TextField
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
                label="카테고리"
                placeholder="카테고리를 선택해 주세요"
                value={category}
                open={categoryOpen}
                onPress={() => setCategoryOpen((o) => !o)}
                options={CATEGORIES}
                onSelect={(v) => {
                  setCategory(v);
                  closeMenu();
                }}
              />
              <TextField
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
                    closeMenu();
                    setDraftUnit(undefined);
                    setUnitSheet(true);
                  }}
                  className="w-[127px]"
                />
              </View>
              <Dropdown
                label="다음 결제일"
                placeholder="다음 결제일을 선택해 주세요"
                value={formatDate(nextDate)}
                showIcon={false}
                onPress={() => {
                  closeMenu();
                  setDraftDate(nextDate);
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
                    closeMenu();
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
          label={found ? '수정 완료' : '저장하기'}
          disabled={!valid}
          onPress={() => {
            if (!category) return;
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
      >
        <Dial value={draftDate} onValueChange={setDraftDate} />
      </BottomSheet>
      {leaveModal}
    </View>
  );
};
