import type { ComponentType } from 'react';
import { View } from 'react-native';
import type { SvgProps } from 'react-native-svg';

import { Button } from '@/components/common/Button';
import { Text } from '@/components/common/Text';
import { cn } from '@/utils/cn';

interface StateCardProps {
  title: string;
  buttonLabel: string;
  // 오른쪽 아래 그래픽 (asset/* Color)
  Asset: ComponentType<SvgProps>;
  // 그래픽 가로 위치(right-*). Figma에서 카드마다 다름 (점검 유도는 오른쪽으로 넘침, 점검 완료는 안쪽)
  assetRightClassName: string;
  onPress: () => void;
  buttonTestID?: string;
}

// Figma 안쪽 그림자 + corner smoothing 80%(iOS 연속 곡선, 켜고 끄기만). NativeWind 클래스가 없어 style로 (토큰 없음)
const CARD_STYLE = {
  borderCurve: 'continuous',
  boxShadow: '0px 0px 2px 0px rgba(179, 179, 179, 0.16) inset',
} as const;

// Figma state card: 안내 문구 + 작은 버튼 + 오른쪽 아래 그래픽 (홈 점검 유도 · 점검 완료)
// radius 28은 토큰 없음
export const StateCard = ({
  title,
  buttonLabel,
  Asset,
  assetRightClassName,
  onPress,
  buttonTestID,
}: StateCardProps) => (
  <View style={CARD_STYLE} className="h-[148px] overflow-hidden rounded-[28px] bg-bg-subtle">
    {/* Figma: 아래에서 6 띄움. 카드 폭이 바뀌어도 오른쪽 기준으로 붙임 */}
    <View className={cn('absolute bottom-[6px]', assetRightClassName)}>
      <Asset className="size-[115px]" />
    </View>
    <View className="pl-[22px] pt-[20px]">
      <View className="w-[184px] items-start gap-[26px]">
        <Text className="text-text-primary text-body1-semibold">{title}</Text>
        <Button size="sm" testID={buttonTestID} label={buttonLabel} onPress={onPress} />
      </View>
    </View>
  </View>
);
