import { Pressable, Text } from 'react-native';

import { ChevronRightIcon } from '@/assets/icons';

interface SectionHeaderProps {
  title: string;
  // 더보기 화면이 있는 섹션이면 오른쪽 화살표
  showChevron?: boolean;
  // 있으면 제목·화살표 전체를 눌러 더보기로 이동 (화면설계서 '전체 보기')
  onPress?: () => void;
}

// Figma Section Header: 제목 + 화살표(20)
export const SectionHeader = ({ title, showChevron, onPress }: SectionHeaderProps) => (
  <Pressable
    accessibilityRole={onPress ? 'button' : 'header'}
    disabled={!onPress}
    onPress={onPress}
    className="flex-row items-center gap-s2 self-start pl-s2 active:opacity-pressed"
  >
    <Text className="text-text-primary text-body1-semibold">{title}</Text>
    {showChevron && (
      <ChevronRightIcon testID="section-chevron" className="size-icon-list text-icon-primary" />
    )}
  </Pressable>
);
