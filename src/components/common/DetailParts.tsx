import { Image, View } from 'react-native';

import { Badge } from '@/components/common/Badge';
import { Text } from '@/components/common/Text';
import { serviceLogo } from '@/constants/services';

// 구독 상세(M-03 구독 중 · M-05 지난 구독)와 캘린더 상세(C-03)가 같이 쓰는 조각

interface ServiceHeaderProps {
  name: string;
  // 없으면 기본 이미지 (직접 입력한 구독)
  logoUrl?: string;
  status: string;
  category: string;
  // 구독 중은 tonal, 지난 구독은 mono
  badgeVariant: 'tonal' | 'mono';
}

export const ServiceHeader = ({
  name,
  logoUrl,
  status,
  category,
  badgeVariant,
}: ServiceHeaderProps) => (
  <View className="flex-row items-center gap-inline-xs">
    <View className="shrink flex-row items-center gap-inline-sm">
      <View className="size-logo-card overflow-hidden rounded-full">
        <Image source={serviceLogo(logoUrl)} className="size-full" />
      </View>
      <Text numberOfLines={1} className="shrink text-text-primary text-body2-semibold">
        {name}
      </Text>
    </View>
    <Badge variant={badgeVariant} label={status} />
    <Badge variant={badgeVariant} label={category} />
  </View>
);

// Figma 구분선 0.6 (토큰 없음, border 최소 1)
export const Divider = () => <View className="h-[0.6px] bg-border-subtle" />;
