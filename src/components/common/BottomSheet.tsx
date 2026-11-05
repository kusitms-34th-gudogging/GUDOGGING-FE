import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  type BottomSheetBackgroundProps,
  BottomSheetModal,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { colors } from '@tokens';
import { type ReactNode, useEffect, useRef, useState } from 'react';
import { ScrollView, Text, useWindowDimensions, View } from 'react-native';

import { Cta } from './Cta';

// gorhom 기본 손잡이·배경은 style prop으로만 바뀌어서 className으로 그린 걸 넘김
const Handle = () => (
  <View className="items-center py-s20">
    <View className="h-[5px] w-[54px] rounded-full bg-icon-secondary" />
  </View>
);

// style에 시트 위치 애니메이션이 들어 있어서 그대로 넘겨야 함
const Background = ({ style, pointerEvents }: BottomSheetBackgroundProps) => (
  <View pointerEvents={pointerEvents} style={style} className="rounded-t-sheet bg-bg-default" />
);

// 딤은 style로만 색을 받음. bg-dim이 이미 반투명이라 opacity는 1
const backdropStyle = { backgroundColor: colors.bg.dim };

const Backdrop = (props: BottomSheetBackdropProps) => (
  <BottomSheetBackdrop
    {...props}
    appearsOnIndex={0}
    disappearsOnIndex={-1}
    opacity={1}
    accessibilityLabel="닫기"
    style={[props.style, backdropStyle]}
  />
);

interface BottomSheetProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  showDescription?: boolean;
  confirmLabel: string;
  confirmDisabled?: boolean;
  onConfirm: () => void;
  children: ReactNode;
}

// 높이는 내용에 맞추되(Figma Hug) 내용이 길면 제목·확인 버튼은 두고 children만 스크롤. 내용 스크롤(Dial)과 겹치지 않게 손잡이로만 끌어서 닫음
const CONTENT_MAX_RATIO = 0.4;
export const BottomSheet = ({
  visible,
  onClose,
  title,
  description,
  showDescription = true,
  confirmLabel,
  confirmDisabled,
  onConfirm,
  children,
}: BottomSheetProps) => {
  const ref = useRef<BottomSheetModal>(null);
  const presented = useRef(false);
  // 내용이 짧을 땐 ScrollView를 쓰지 않음. 안쪽 Dial의 세로 스크롤을 바깥 스크롤이 가져가고,
  // 시트 높이 측정도 ScrollView 안에서는 어긋남(CTA가 잘림). 최대 높이는 화면 비율 (className으로는 못 씀)
  const [tall, setTall] = useState(false);
  const maxHeight = useWindowDimensions().height * CONTENT_MAX_RATIO;
  const contentStyle = { height: maxHeight };

  // 딤 탭·드래그로 닫히면 시트가 이미 정리된 뒤 onClose가 불림. 그때 dismiss()를 또 부르면
  // gorhom 내부 상태가 '닫는 중'에 멈춰 다음 present()가 무시됨 → 열려 있을 때만 dismiss
  useEffect(() => {
    if (visible === presented.current) return;
    presented.current = visible;
    if (visible) ref.current?.present();
    else ref.current?.dismiss();
  }, [visible]);

  return (
    <BottomSheetModal
      ref={ref}
      onDismiss={() => {
        presented.current = false;
        onClose();
      }}
      enableContentPanningGesture={false}
      handleComponent={Handle}
      backgroundComponent={Background}
      backdropComponent={Backdrop}
    >
      <BottomSheetView>
        <View className="pb-safe">
          <View className="gap-s20 px-screen-x pb-s8">
            <View className="gap-s2">
              <Text accessibilityRole="header" className="text-text-primary text-head4-bold">
                {title}
              </Text>
              {showDescription && description && (
                <Text className="text-text-secondary text-caption1-regular">{description}</Text>
              )}
            </View>
            {tall ? (
              <ScrollView bounces={false} nestedScrollEnabled style={contentStyle}>
                {children}
              </ScrollView>
            ) : (
              <View onLayout={(e) => setTall(e.nativeEvent.layout.height > maxHeight)}>
                {children}
              </View>
            )}
            <Cta
              label={confirmLabel}
              disabled={confirmDisabled}
              onPress={() => {
                onConfirm();
                ref.current?.dismiss();
              }}
            />
          </View>
        </View>
      </BottomSheetView>
    </BottomSheetModal>
  );
};
