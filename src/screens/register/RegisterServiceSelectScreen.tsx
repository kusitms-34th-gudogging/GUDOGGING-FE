import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { CloseIcon } from '@/assets/icons';
import { Chip } from '@/components/common/Chip';
import { Cta } from '@/components/common/Cta';
import { ListItem } from '@/components/common/ListItem';
import { SearchBar } from '@/components/common/SearchBar';
import { TopBar } from '@/components/common/TopBar';
import { AddServiceRow } from '@/components/register/AddServiceRow';
import { FadeScrollView } from '@/components/register/FadeScrollView';
import { type Service, SERVICES } from '@/constants/services';
import { getFoundServiceIds, useRegisterDraft } from '@/hooks/useRegisterDraft';
import { keywordRank } from '@/utils/search';

interface RegisterServiceSelectScreenProps {
  // 불러온 구독 확인(A-09)의 구독 추가하기로 왔는지
  more?: boolean;
}

export const RegisterServiceSelectScreen = ({ more }: RegisterServiceSelectScreenProps) => {
  const [query, setQuery] = useState('');
  // 불러오기 팝업으로 이어서 등록할 수 있게 저장소에 둠
  const selectedIds = useRegisterDraft((s) => s.selectedIds);
  const setSelectedIds = useRegisterDraft((s) => s.setSelectedIds);
  // 이번에 새로 고른 것만 체크해서, 불러온 구독 확인에서 체크를 푼 구독이 다시 체크되지 않게
  const [initialIds] = useState(selectedIds);
  // 분석으로 불러온 서비스는 체크된 채로 잠금. 해제는 불러온 구독 확인에서만 (기획 답변)
  const payments = useRegisterDraft((s) => s.payments);
  const lockedIds = more ? getFoundServiceIds(payments) : [];

  const toggle = (id: string) =>
    setSelectedIds(
      selectedIds.includes(id) ? selectedIds.filter((v) => v !== id) : [...selectedIds, id],
    );
  // 칩은 선택한 순서대로
  const selected = selectedIds.flatMap((id) => SERVICES.filter((s) => s.id === id));
  const count = selected.length;
  const keyword = query.trim();
  // 이름 일치율 높은 순, 카테고리로만 맞으면 맨 아래. 같은 순위는 목록 순서 (기획 답변)
  // shortcut: 이미 등록한 서비스 제외 없음, 구독 목록 API 연동 시 제외
  const rankOf = (s: Service) =>
    keywordRank([s.name, s.nameKo], keyword) ??
    // 이름 순위(0~3)보다 아래
    (keywordRank([s.category], keyword) === undefined ? undefined : 4);
  const results = keyword
    ? SERVICES.map((s) => ({ s, rank: rankOf(s) }))
        .filter((r) => r.rank !== undefined)
        .sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
        .map((r) => r.s)
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
      {/* 목록 영역은 CTA 위 56까지 채움 (Figma 목록 주석) */}
      <View className="flex-1 gap-inset-lg px-screen-x pb-[56px] pt-stack-md">
        <View className="gap-stack-lg">
          <SearchBar value={query} onChangeText={setQuery} placeholder="검색" />
          <View className="gap-stack-sm">
            <Text className="px-s2 text-text-primary text-head4-bold">
              등록할 서비스를 모두 선택해 주세요.
            </Text>
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
        <View className="flex-1 gap-inline-xs">
          <Text className="text-text-primary text-body3-semibold">
            {keyword ? '검색 결과' : '전체'}
          </Text>
          <FadeScrollView className="flex-1" contentContainerClassName="gap-inline-xs">
            {results.map((s) => (
              <ListItem
                key={s.id}
                title={s.name}
                subtitle={s.category}
                showSubtitle
                logo={require('@/assets/images/logo_placeholder.png')}
                showLogo
                showCheckBox
                checked={selectedIds.includes(s.id) || lockedIds.includes(s.id)}
                onCheckedChange={() => toggle(s.id)}
                checkBoxLocked={lockedIds.includes(s.id)}
              />
            ))}
            {!!keyword && (
              <AddServiceRow
                label="직접 입력하기"
                onPress={() =>
                  router.push({ pathname: '/register/input', params: more ? { more: '1' } : {} })
                }
              />
            )}
          </FadeScrollView>
        </View>
      </View>
      <View className="pb-safe px-screen-x">
        <Cta
          label={`${count}개 선택 완료`}
          disabled={count === 0}
          onPress={() => {
            if (!more) return router.push('/register/selected');
            // 결제 정보 입력 없이 불러온 구독 확인으로 돌아가 확인 필요에 보임
            useRegisterDraft
              .getState()
              .addFoundChecked(selectedIds.filter((id) => !initialIds.includes(id)));
            router.back();
          }}
          className="mb-[14px]"
        />
      </View>
    </View>
  );
};
