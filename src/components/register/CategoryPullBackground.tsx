import LottieView from 'lottie-react-native';
import { View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';

import { AnalyzeColorAsset } from '@/assets/graphics';

// 확인 중(A-08·A-13) 배경: 카테고리 에셋이 돋보기로 빨려 들어가는 Lottie 무한 반복 (동작 줄이기면 돋보기만 정지)
// 812 프레임 Lottie를 확대 없이 상태바(44) 위부터 깔아 돋보기 위치를 기기마다 유지
export const CategoryPullBackground = () => {
  const reduceMotion = useReducedMotion();

  return (
    <View
      pointerEvents="none"
      accessible={false}
      importantForAccessibility="no-hide-descendants"
      className="pt-safe absolute inset-x-0 top-0 items-center"
    >
      <View className="-mt-status-bar h-screen-height w-[480px]">
        {reduceMotion ? (
          <AnalyzeColorAsset className="absolute left-[188px] top-[316px] size-[104px]" />
        ) : (
          <LottieView
            source={require('@/assets/animations/category_pull.json')}
            autoPlay
            loop
            className="size-full"
          />
        )}
      </View>
    </View>
  );
};
