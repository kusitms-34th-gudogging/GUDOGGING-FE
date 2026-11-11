import { type LayoutChangeEvent, Pressable, Text } from 'react-native';

import { cn } from '@/utils/cn';

interface SegmentProps {
  label: string;
  // 라벨 뒤 개수. 선택되면 브랜드색 굵게 (구독 중 6)
  count?: number;
  selected: boolean;
  onSelect: () => void;
  onLayout?: (e: LayoutChangeEvent) => void;
  className?: string;
}

export const Segment = ({
  label,
  count,
  selected,
  onSelect,
  onLayout,
  className,
}: SegmentProps) => (
  <Pressable
    accessibilityRole="tab"
    accessibilityState={{ selected }}
    onPress={onSelect}
    onLayout={onLayout}
    className={cn(
      'h-control-sm min-w-[64px] max-w-[160px] items-center justify-center rounded-button px-inset-md',
      className,
    )}
  >
    <Text
      numberOfLines={1}
      className={cn(
        // Figma처럼 글자는 좌우 패딩 영역까지 쓰고 최대 128에서 말줄임 (선택 시 굵어져도 안 잘리게)
        '-mx-inset-md max-w-[128px] transition-colors',
        selected
          ? 'text-text-primary text-body3-semibold'
          : 'text-text-secondary text-body3-regular',
      )}
    >
      {label}
      {count !== undefined && (
        <Text className={cn(selected && 'text-text-brand text-body3-bold')}> {count}</Text>
      )}
    </Text>
  </Pressable>
);
