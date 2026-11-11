import { colors } from '@tokens';
import { Text, View } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { SaveColorAsset, SaveMonoAsset } from '@/assets/graphics';
import { cn } from '@/utils/cn';

interface DetailCostCardProps {
  label: string;
  amount: string;
  subText: string;
  // brand: 구독 중(M-03) · mono: 지난 구독(M-05)
  tone?: 'brand' | 'mono';
  className?: string;
}

// Figma 안쪽 그림자 (inset 0 3 3, 8%). NativeWind shadow 클래스는 inset을 버려서 RN boxShadow로 (토큰 없음)
// mono의 #8C8C8C는 팔레트에 없는 값이라 그대로
const INNER_SHADOW = {
  brand: { boxShadow: `0px 3px 3px 0px ${colors.red[400]}14 inset` },
  mono: { boxShadow: '0px 3px 3px 0px #8C8C8C14 inset' },
};

// 위쪽 원형 그라데이션 [offset, 색, 투명도]
// mono는 Figma 다단 stop이 gray/100 → gray/900 직선 보간이라 꺾이는 점만
const TOP_STOPS: Record<'brand' | 'mono', [number, string, number][]> = {
  brand: [
    [0, colors.red[100], 1],
    [0.30288, colors.gray[100], 0.39],
    [1, colors.red[500], 0.72],
  ],
  mono: [
    [0, colors.gray[200], 0.62],
    [0.42637, colors.gray[100], 0.83],
    [1, colors.gray[900], 0.88],
  ],
};

// 구독 상세 Cost 카드 (335×105 가로형). 배경은 두 겹 원형 그라데이션 (변수 없는 값이라 팔레트 색으로), 폭에 맞춰 늘어남
export const DetailCostCard = ({
  label,
  amount,
  subText,
  tone = 'brand',
  className,
}: DetailCostCardProps) => {
  const Asset = tone === 'brand' ? SaveColorAsset : SaveMonoAsset;

  return (
    <View
      className={cn('h-[105px] justify-center overflow-hidden rounded-card px-screen-x', className)}
    >
      <View className="absolute inset-0">
        <Svg width="100%" height="100%" viewBox="0 0 335 105" preserveAspectRatio="none">
          <Defs>
            <RadialGradient
              id="detail-cost-bottom"
              cx={0}
              cy={0}
              r={10}
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(-22.717 8.7938 -10.792 -2.7389 320.34 2.9531)"
            >
              <Stop offset={0} stopColor={colors.warning[100]} />
              <Stop offset={1} stopColor={colors.yellow[100]} />
            </RadialGradient>
            <RadialGradient
              id="detail-cost-top"
              cx={0}
              cy={0}
              r={10}
              gradientUnits="userSpaceOnUse"
              gradientTransform="matrix(32.139 10.434 -33.291 10.073 -39.781 -11.484)"
            >
              {TOP_STOPS[tone].map(([offset, color, opacity]) => (
                <Stop key={offset} offset={offset} stopColor={color} stopOpacity={opacity} />
              ))}
            </RadialGradient>
          </Defs>
          <Rect width={335} height={105} fill="url(#detail-cost-bottom)" />
          <Rect width={335} height={105} fill="url(#detail-cost-top)" />
        </Svg>
      </View>
      {/* 배경 SVG 위에 Figma 안쪽 그림자. 카드 자체에 주면 SVG에 가려서 위 층으로 */}
      <View
        pointerEvents="none"
        style={INNER_SHADOW[tone]}
        className="absolute inset-0 rounded-card"
      />
      <View className="gap-s2">
        <View>
          <Text className="text-text-primary text-label-semibold">{label}</Text>
          <Text numberOfLines={1} className="text-text-primary text-head2-bold">
            {amount}
          </Text>
        </View>
        {/* mono는 어두운 오른쪽 아래와 겹쳐서 흰 글자 */}
        <Text
          numberOfLines={1}
          className={cn(
            'text-caption1-regular',
            tone === 'brand' ? 'text-text-primary' : 'text-text-on-brand',
          )}
        >
          {subText}
        </Text>
      </View>
      {/* Figma left 241 · top 31.5 → 오른쪽 아래 기준(오른쪽 10, 아래로 10 넘침)으로 붙여 폭이 바뀌어도 같은 자리 */}
      <View className="absolute -bottom-[10px] right-[10px] size-[84px] opacity-pressed">
        <Asset width="100%" height="100%" />
      </View>
    </View>
  );
};
