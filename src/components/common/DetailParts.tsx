import { Image, Text, View } from 'react-native';

import { Badge } from '@/components/common/Badge';

// 구독 상세(M-03 구독 중 · M-05 지난 구독)와 캘린더 상세(C-03)가 같이 쓰는 조각

const LOGO = require('@/assets/images/logo_placeholder.png');

interface ServiceHeaderProps {
  name: string;
  status: string;
  category: string;
  // 구독 중은 tonal, 지난 구독은 mono
  badgeVariant: 'tonal' | 'mono';
}

export const ServiceHeader = ({ name, status, category, badgeVariant }: ServiceHeaderProps) => (
  <View className="flex-row items-center gap-inline-xs">
    <View className="shrink flex-row items-center gap-inline-sm">
      {/* shortcut: 서비스 로고 없이 placeholder, 서비스 로고 API 연동 시 교체 */}
      <View className="size-logo-card overflow-hidden rounded-full border-default border-border-subtle">
        <Image source={LOGO} className="size-full" />
      </View>
      <Text numberOfLines={1} className="shrink text-text-primary text-body2-semibold">
        {name}
      </Text>
    </View>
    <Badge variant={badgeVariant} label={status} />
    <Badge variant={badgeVariant} label={category} />
  </View>
);

export const Divider = () => <View className="h-px bg-border-subtle" />;
