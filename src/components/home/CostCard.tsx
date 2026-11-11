import { colors } from '@tokens';
import { Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { SaveColorAsset } from '@/assets/graphics';
import { cn } from '@/utils/cn';

interface CostCardProps {
  label: string;
  amount: string;
  yearAmount?: string;
  className?: string;
}

// Figma 안쪽 그림자 (inset 0 3 3, red/400 8%). NativeWind shadow 클래스는 inset을 버려서 RN boxShadow로 (토큰 없음)
const INNER_SHADOW = { boxShadow: `0px 3px 3px 0px ${colors.red[400]}14 inset` };

// Figma cost card: 정사각(375 기준 160), 폭은 사용처가 정함. 배경은 두 겹 원형 그라데이션 (변수 없는 값이라 팔레트 색으로), 카드 크기에 맞춰 늘어남
export const CostCard = ({ label, amount, yearAmount, className }: CostCardProps) => (
  <View className={cn('aspect-square overflow-hidden rounded-card p-inset-md', className)}>
    <View className="absolute inset-0">
      <Svg width="100%" height="100%" viewBox="0 0 160 160" preserveAspectRatio="none">
        <Defs>
          <RadialGradient
            id="cost-bottom"
            cx={0}
            cy={0}
            r={10}
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(-10.85 13.4 -5.1544 -4.1735 153 4.5)"
          >
            <Stop offset={0} stopColor={colors.warning[100]} />
            <Stop offset={1} stopColor={colors.yellow[100]} />
          </RadialGradient>
          <RadialGradient
            id="cost-top"
            cx={0}
            cy={0}
            r={10}
            gradientUnits="userSpaceOnUse"
            gradientTransform="matrix(15.35 15.9 -15.9 15.35 -19 -17.5)"
          >
            <Stop offset={0} stopColor={colors.red[100]} />
            <Stop offset={0.30288} stopColor={colors.gray[100]} stopOpacity={0.39} />
            <Stop offset={1} stopColor={colors.red[500]} stopOpacity={0.72} />
          </RadialGradient>
        </Defs>
        <Rect width={160} height={160} fill="url(#cost-bottom)" />
        <Rect width={160} height={160} fill="url(#cost-top)" />
      </Svg>
    </View>
    {/* 배경 SVG 위에 Figma 안쪽 그림자. 카드 자체에 주면 SVG에 가려서 위 층으로 */}
    <View pointerEvents="none" style={INNER_SHADOW} className="absolute inset-0 rounded-card" />
    <View className="gap-s2">
      <View>
        <Text className="text-text-primary text-label-semibold">{label}</Text>
        <Text numberOfLines={1} className="text-text-primary text-head2-bold">
          {amount}
        </Text>
      </View>
      {yearAmount && (
        <Text numberOfLines={1} className="text-text-primary text-caption1-regular">
          {yearAmount}
        </Text>
      )}
    </View>
    {/* Figma 160 카드에서 left 70 · top 86 → 오른쪽 아래 기준(오른쪽 6, 아래로 10 넘침)으로 붙여 카드가 커져도 같은 자리 */}
    <View className="absolute -bottom-[10px] right-[6px] size-[84px] opacity-pressed">
      <SaveColorAsset width="100%" height="100%" />
    </View>
  </View>
);
