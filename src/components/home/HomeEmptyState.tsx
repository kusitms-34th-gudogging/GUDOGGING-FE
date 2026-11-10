import { Text, View } from 'react-native';

import { Button } from '@/components/common/Button';

interface HomeEmptyStateProps {
  onRegister: () => void;
}

// H-01 등록된 구독 없음: 카드 아래 ~ 탭바 위 남은 공간의 가운데 (Figma 375×812에선 카드 아래 134)
// 부모 스크롤 내용이 화면 높이만큼 늘어나 있어야(grow) 남은 공간을 채움
export const HomeEmptyState = ({ onRegister }: HomeEmptyStateProps) => (
  // 위 섹션 간격(inset-lg 24)만큼 올려 카드 바로 아래부터, 아래는 하단 안전 영역 + 탭바(52 + 4)를 빼고 가운데를 잼
  <View className="pb-safe -mt-inset-lg flex-1">
    <View className="mb-[56px] flex-1 items-center justify-center gap-stack-md">
      <View className="items-center gap-s2">
        <Text className="text-center text-text-primary text-head3-bold">
          아직 등록된 구독이 없어요
        </Text>
        <Text className="text-center text-text-secondary text-body3-regular">
          {'구독을 등록하면 결제일과 지출을\n한눈에 확인할 수 있어요'}
        </Text>
      </View>
      <Button size="sm" label="구독 등록하기" onPress={onRegister} />
    </View>
  </View>
);
