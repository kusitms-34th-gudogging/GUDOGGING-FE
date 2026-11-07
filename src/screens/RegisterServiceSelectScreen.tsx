import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { CloseIcon } from '@/assets/icons';
import { Chip } from '@/components/common/Chip';
import { Cta } from '@/components/common/Cta';
import { ListItem } from '@/components/common/ListItem';
import { SearchBar } from '@/components/common/SearchBar';
import { TopBar } from '@/components/common/TopBar';

interface Service {
  id: string;
  name: string;
}

// shortcut: 하드코딩 목록, 서비스 목록 API 연동 시 props로 교체
const SERVICES: Service[] = [
  { id: 'netflix', name: 'Netflix' },
  { id: 'chatgpt', name: 'ChatGPT' },
  { id: 'youtube', name: 'YouTube Premium' },
  { id: 'spotify', name: 'Spotify' },
  { id: 'coupang', name: '쿠팡 와우' },
  { id: 'disney', name: '디즈니+' },
  { id: 'tving', name: '티빙' },
];

export const RegisterServiceSelectScreen = () => {
  const [query, setQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggle = (id: string) =>
    setSelectedIds((ids) => (ids.includes(id) ? ids.filter((v) => v !== id) : [...ids, id]));
  const selected = SERVICES.filter((s) => selectedIds.includes(s.id));
  const count = selected.length;

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="직접 등록"
        onBack={() => router.dismissTo('/register')}
        showAction1={false}
        showAction2={false}
      />
      <View className="flex-1 gap-screen-x px-screen-x pt-stack-md">
        <View className="gap-stack-lg">
          <SearchBar value={query} onChangeText={setQuery} placeholder="검색" />
          <View className="gap-stack-md">
            <View className="gap-[2px]">
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
        {/* 뷰포트에 최대 5개, 이후 스크롤 */}
        <ScrollView className="max-h-[361px]" contentContainerClassName="gap-inline-xs">
          {SERVICES.map((s) => (
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
      </View>
      <View className="pb-safe px-screen-x">
        {/* A-04 화면이 생기면 onPress 연결 */}
        <Cta label={`${count}개 선택 완료`} disabled={count === 0} className="mb-[14px]" />
      </View>
    </View>
  );
};
