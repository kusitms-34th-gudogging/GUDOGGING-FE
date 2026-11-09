import { colors } from '@tokens';
import { View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { CHECKUP_CATEGORIES, type CheckupCategory } from '@/constants/checkup';

// Figma Step ring의 링 4조각 (36×36, 12시 방향부터 시계 방향)
const RINGS = [
  'M19.976 0.10879C24.0426 0.557931 27.8349 2.37906 30.7279 5.27208C33.6209 8.1651 35.4421 11.9574 35.8912 16.024L33.9033 16.2435C33.5041 12.6288 31.8853 9.25786 29.3137 6.68629C26.7421 4.11472 23.3712 2.49594 19.7565 2.0967L19.976 0.10879Z',
  'M35.8912 19.976C35.4421 24.0426 33.6209 27.8349 30.7279 30.7279C27.8349 33.6209 24.0426 35.4421 19.976 35.8912L19.7565 33.9033C23.3712 33.5041 26.7421 31.8853 29.3137 29.3137C31.8853 26.7421 33.5041 23.3712 33.9033 19.7565L35.8912 19.976Z',
  'M16.024 35.8912C11.9574 35.4421 8.1651 33.6209 5.27208 30.7279C2.37906 27.8349 0.557931 24.0426 0.10879 19.976L2.0967 19.7565C2.49594 23.3712 4.11472 26.7421 6.68629 29.3137C9.25786 31.8853 12.6288 33.5041 16.2435 33.9033L16.024 35.8912Z',
  'M0.10879 16.024C0.557931 11.9574 2.37906 8.1651 5.27208 5.27208C8.16509 2.37906 11.9574 0.557932 16.024 0.10879L16.2435 2.0967C12.6288 2.49594 9.25786 4.11472 6.68629 6.68629C4.11472 9.25786 2.49594 12.6288 2.0967 16.2435L0.10879 16.024Z',
];

interface StepRingProps {
  category: CheckupCategory;
  step: number;
}

// 구독 점검 4단계 진행 표시: 카테고리 에셋을 링이 둘러싸고 step만큼 카테고리 색으로 채움
export const StepRing = ({ category, step }: StepRingProps) => {
  const Asset = CHECKUP_CATEGORIES[category].asset;

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: RINGS.length, now: step }}
      className="size-[36px] items-center justify-center"
    >
      <Svg width={36} height={36} viewBox="0 0 36 36" className="absolute">
        {RINGS.map((d, i) => (
          <Path
            key={d}
            d={d}
            // 링 색은 SVG fill 값이라 클래스 대신 토큰 hex
            fill={i < step ? colors.category[category].icon : colors.border.subtle}
          />
        ))}
      </Svg>
      <Asset className="size-s24" />
    </View>
  );
};
