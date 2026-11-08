import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { CloseIcon, PlusIcon } from '@/assets/icons';
import { Chip } from '@/components/common/Chip';
import { Cta } from '@/components/common/Cta';
import { ListItem } from '@/components/common/ListItem';
import { SearchBar } from '@/components/common/SearchBar';
import { TopBar } from '@/components/common/TopBar';
import { SERVICES } from '@/constants/services';
import { useLeaveConfirm } from '@/hooks/useLeaveConfirm';
import { hasRegisterDraft, useRegisterDraft } from '@/hooks/useRegisterDraft';

interface RegisterServiceSelectScreenProps {
  // 불러온 구독 확인(A-09)의 서비스 더 선택하기로 왔으면 흐름 안 이동이라 이탈 팝업 없음
  more?: boolean;
}

export const RegisterServiceSelectScreen = ({ more }: RegisterServiceSelectScreenProps) => {
  const [query, setQuery] = useState('');
  // 불러오기 팝업으로 이어서 등록할 수 있게 저장소에 둠
  const selectedIds = useRegisterDraft((s) => s.selectedIds);
  const setSelectedIds = useRegisterDraft((s) => s.setSelectedIds);
  const hasDraft = useRegisterDraft(hasRegisterDraft);
  // 직접 등록의 첫 화면: 등록 중이던 값이 있으면 나갈 때 이탈 팝업
  const { modal: leaveModal } = useLeaveConfirm(!more && hasDraft);

  const toggle = (id: string) =>
    setSelectedIds(
      selectedIds.includes(id) ? selectedIds.filter((v) => v !== id) : [...selectedIds, id],
    );
  const selected = SERVICES.filter((s) => selectedIds.includes(s.id));
  const count = selected.length;
  // shortcut: 영문·한글 이름 부분 일치만
  const keyword = query.trim().toLowerCase();
  const results = keyword
    ? SERVICES.filter((s) => `${s.name} ${s.nameKo}`.toLowerCase().includes(keyword))
    : SERVICES;

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="직접 등록"
        // 추가 선택은 불러온 구독 확인에서 들어오므로 그 화면으로만 돌아감
        onBack={() => (more ? router.back() : router.dismissTo('/register'))}
        showAction1={false}
        showAction2={false}
      />
      <View className="flex-1 gap-screen-x px-screen-x pt-stack-md">
        <View className="gap-stack-lg">
          <SearchBar value={query} onChangeText={setQuery} placeholder="검색" />
          <View className="gap-stack-md">
            <View className="gap-s2">
              <Text className="text-text-primary text-head4-bold">
                등록할 서비스를 모두 선택해 주세요.
              </Text>
              {count > 0 && (
                <Text className="text-text-secondary text-caption1-regular">
                  선택한 서비스 {count}
                </Text>
              )}
            </View>
            {count > 0 && (
              // 화면 끝까지 스크롤되게 좌우 여백을 상쇄하고 안쪽에서 다시 줌
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-screen-x"
                contentContainerClassName="gap-stack-sm px-screen-x"
              >
                {selected.map((s) => (
                  <Chip
                    key={s.id}
                    label={s.name}
                    icon={CloseIcon}
                    selected={false}
                    onSelect={() => toggle(s.id)}
                  />
                ))}
              </ScrollView>
            )}
          </View>
        </View>
        {/* 화면이 작으면 리스트가 줄어들도록 shrink */}
        <View className="shrink gap-inline-sm">
          {!!keyword && <Text className="text-text-primary text-body3-regular">검색 결과</Text>}
          <View className="shrink gap-inline-xs">
            {/* 뷰포트에 최대 5개, 이후 스크롤 */}
            <ScrollView className="max-h-[361px] shrink" contentContainerClassName="gap-inline-xs">
              {results.map((s) => (
                <ListItem
                  key={s.id}
                  title={s.name}
                  logo={require('@/assets/images/logo_placeholder.png')}
                  showLogo
                  showCheckBox
                  checked={selectedIds.includes(s.id)}
                  onCheckedChange={() => toggle(s.id)}
                />
              ))}
            </ScrollView>
            {!!keyword && (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.push('/register/input')}
                className="h-[69px] flex-row items-center gap-inline-md border-b-default border-border-default px-inline-xs active:opacity-pressed"
              >
                <PlusIcon className="size-[28px] text-icon-secondary" />
                <Text className="text-text-secondary text-body2-semibold">직접 입력하기</Text>
              </Pressable>
            )}
          </View>
        </View>
      </View>
      <View className="pb-safe px-screen-x">
        <Cta
          label={`${count}개 선택 완료`}
          disabled={count === 0}
          onPress={() => router.push('/register/selected')}
          className="mb-[14px]"
        />
      </View>
      {leaveModal}
    </View>
  );
};
