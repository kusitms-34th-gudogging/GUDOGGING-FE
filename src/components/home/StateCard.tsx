import type { ComponentType } from 'react';
import { View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { Button } from '@/components/common/Button';
import { Text } from '@/components/common/Text';

interface StateCardProps {
  title: string;
  buttonLabel: string;
  // 오른쪽 아래 그래픽 (asset/* Color)
  Asset: ComponentType<SvgProps>;
  onPress: () => void;
  buttonTestID?: string;
}

// Figma state card: 안내 문구 + 작은 버튼 + 오른쪽 아래 그래픽 (홈 점검 유도 · 점검 완료)
export const StateCard = ({ title, buttonLabel, Asset, onPress, buttonTestID }: StateCardProps) => (
  <View className="h-[148px] overflow-hidden rounded-card bg-bg-subtle">
    <View className="absolute bottom-0 right-0">
      <Asset className="size-[115px]" />
    </View>
    <View className="px-s20 pt-s20">
      <View className="w-[184px] items-start gap-[28px]">
        <Text className="text-text-primary text-body1-semibold">{title}</Text>
        <Button size="sm" testID={buttonTestID} label={buttonLabel} onPress={onPress} />
      </View>
    </View>
  </View>
);
