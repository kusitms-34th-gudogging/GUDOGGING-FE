import { router } from 'expo-router';
import { ScrollView, View } from 'react-native';

import { Cta } from '@/components/common/Cta';
import { TopBar } from '@/components/common/TopBar';
import { AddServiceRow } from '@/components/register/AddServiceRow';
import { PaymentListItem } from '@/components/register/PaymentListItem';
import { ScreenTitle } from '@/components/register/ScreenTitle';
import { useRegisterDraft, useRegisterServices } from '@/hooks/useRegisterDraft';

interface RegisterSelectedServiceScreenProps {
  // 불러온 구독 확인에서 서비스를 더 고른 경우: 등록 대신 그 화면 목록에 추가
  more?: boolean;
}

export const RegisterSelectedServiceScreen = ({
  more = false,
}: RegisterSelectedServiceScreenProps) => {
  // A-02에서 고른 목록은 저장소가 원본 (서비스 더 선택하기로 바꿔도 바로 반영)
  const serviceIds = useRegisterDraft((s) => s.selectedIds);
  const payments = useRegisterDraft((s) => s.payments);
  const services = useRegisterServices(serviceIds);
  const allEntered = services.length > 0 && services.every((s) => payments[s.id]);
  const ids = services.map((s) => s.id);

  const addToFound = () => {
    const { foundChecked, setFoundChecked } = useRegisterDraft.getState();
    setFoundChecked([...new Set([...(foundChecked ?? []), ...ids])]);
    router.dismissTo('/register/found');
  };

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
        <ScreenTitle
          title={'선택한 구독 정보를\n입력해 주세요.'}
          description="항목을 눌러 결제 금액과 다음 결제일을 입력해요."
        />
        {/* 구독 최대 5개 + 서비스 더 선택하기 = 434, 이후 스크롤 */}
        <ScrollView className="max-h-[434px] shrink" contentContainerClassName="gap-inline-xs">
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
          <AddServiceRow onPress={() => router.dismissTo('/register/select')} />
        </ScrollView>
      </View>
      <View className="pb-safe px-screen-x">
        {/* 모든 서비스 결제 정보 입력이 완료되면 활성화. shortcut: 등록 API 없이 완료 화면으로만 이동, API 연동 시 저장 성공 후 이동 */}
        <Cta
          label={`${services.length}개 구독 ${more ? '추가하기' : '등록하기'}`}
          disabled={!allEntered}
          onPress={
            more
              ? addToFound
              : () => router.push({ pathname: '/register/done', params: { ids: ids.join(',') } })
          }
          className="mb-[14px]"
        />
      </View>
    </View>
  );
};
