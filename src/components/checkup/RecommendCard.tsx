import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { Badge } from '@/components/common/Badge';
import type { CheckupRecommendation } from '@/constants/checkup';
import { formatWon } from '@/utils/formatPayment';

interface RecommendCardProps {
  recommendation: CheckupRecommendation;
}

// K-80 "같은 {서비스명}, 더 싸게" 가로 스크롤 카드
export const RecommendCard = ({
  recommendation: { title, subtitle, tags, saving, upTo, current, condition },
}: RecommendCardProps) => {
  // 절감 막대: 지금 내는 금액 중 아끼는 비율. 비율은 데이터마다 달라 클래스 대신 여기서 줌
  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.min(100, (saving / current) * 100)}%`,
  }));

  return (
    <View className="w-[252px] gap-stack-xs rounded-card border-[0.5px] border-border-subtle bg-bg-default p-inset-md">
      <View className="gap-stack-md">
        <View>
          <Text numberOfLines={1} className="text-text-primary text-body1-bold">
            {title}
          </Text>
          <Text numberOfLines={1} className="text-text-secondary text-caption1-regular">
            {subtitle}
          </Text>
        </View>
        <View className="flex-row gap-stack-xs">
          {tags.map((tag) => (
            <Badge key={tag} variant="mono" label={tag} />
          ))}
        </View>
      </View>
      <View className="h-s16" />
      <View className="gap-s2">
        <View className="gap-stack-xs">
          <View className="flex-row items-baseline gap-stack-xs">
            <Text className="text-text-secondary text-caption1-regular">
              {upTo ? '최대' : '월'}
            </Text>
            <Text className="text-text-brand text-head2-bold">{formatWon(saving)}</Text>
          </View>
          <View className="h-s4 overflow-hidden rounded-[2px] bg-bg-muted">
            <Animated.View style={fillStyle} className="h-full rounded-[2px] bg-icon-brand" />
          </View>
        </View>
        <Text numberOfLines={1} className="text-text-secondary text-caption1-regular">
          {condition ?? `월 ${formatWon(current - saving)}에 이용`}
        </Text>
      </View>
    </View>
  );
};
