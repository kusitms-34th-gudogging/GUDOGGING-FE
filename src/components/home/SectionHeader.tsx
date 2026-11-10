import { Text, View } from 'react-native';

import { ChevronRightIcon } from '@/assets/icons';

interface SectionHeaderProps {
  title: string;
  // 더보기 화면이 있는 섹션이면 오른쪽 화살표
  showChevron?: boolean;
}

// Figma Section Header: 제목 + 화살표(20)
export const SectionHeader = ({ title, showChevron }: SectionHeaderProps) => (
  <View className="flex-row items-center gap-s2 pl-s2">
    <Text accessibilityRole="header" className="text-text-primary text-body1-semibold">
      {title}
    </Text>
    {showChevron && (
      <ChevronRightIcon testID="section-chevron" className="size-icon-list text-icon-primary" />
    )}
  </View>
);
