import { colors } from '@tokens';
import { useState } from 'react';
import { ScrollView, type ScrollViewProps, View } from 'react-native';
import Animated, { Easing, FadeIn, FadeOut } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { cn } from '@/utils/cn';

const FADE_MS = 200;

interface FadeScrollViewProps extends Omit<ScrollViewProps, 'className'> {
  className?: string;
}

// 내용이 영역을 넘으면 하단에 배경색 페이드(32)를 깔고, 맨 아래까지 내리면 숨김 (Figma 목록 스크롤 주석)
export const FadeScrollView = ({
  className,
  onLayout,
  onContentSizeChange,
  onScroll,
  ...props
}: FadeScrollViewProps) => {
  const [viewH, setViewH] = useState(0);
  const [contentH, setContentH] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  // 아래에 더 볼 내용이 남았을 때만 (내용이 짧으면 항상 거짓). 1pt 여유는 끝에서 소수점 오차로 남지 않게
  const showFade = offsetY + viewH < contentH - 1;

  return (
    <View className={cn('flex-1', className)}>
      <ScrollView
        {...props}
        className="flex-1"
        scrollEventThrottle={16}
        onLayout={(e) => {
          setViewH(e.nativeEvent.layout.height);
          onLayout?.(e);
        }}
        onContentSizeChange={(w, h) => {
          setContentH(h);
          onContentSizeChange?.(w, h);
        }}
        onScroll={(e) => {
          setOffsetY(e.nativeEvent.contentOffset.y);
          onScroll?.(e);
        }}
      />
      {showFade && (
        <Animated.View
          testID="scroll-fade"
          pointerEvents="none"
          entering={FadeIn.duration(FADE_MS).easing(Easing.out(Easing.ease))}
          exiting={FadeOut.duration(FADE_MS).easing(Easing.out(Easing.ease))}
          className="absolute inset-x-0 bottom-0 h-s32"
        >
          <Svg width="100%" height="100%">
            <Defs>
              <LinearGradient id="scroll-fade" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.bg.default} stopOpacity={0} />
                <Stop offset="1" stopColor={colors.bg.default} stopOpacity={1} />
              </LinearGradient>
            </Defs>
            <Rect width="100%" height="100%" fill="url(#scroll-fade)" />
          </Svg>
        </Animated.View>
      )}
    </View>
  );
};
