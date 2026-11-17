import { ActivityIndicator, Text, View } from 'react-native';

import { Button } from '@/components/common/Button';

interface QueryStateProps {
  isError: boolean;
  onRetry: () => void;
}

// API 화면 공통 로딩·에러 (화면 가운데)
// shortcut: 로딩·에러 디자인이 없어 기본 스피너와 다시 시도 버튼, 디자인 나오면 교체
export const QueryState = ({ isError, onRetry }: QueryStateProps) => (
  <View className="flex-1 items-center justify-center gap-stack-md px-screen-x">
    {isError ? (
      <>
        <Text className="text-center text-text-primary text-body1-semibold">
          정보를 불러오지 못했어요
        </Text>
        <Button size="sm" label="다시 시도" onPress={onRetry} />
      </>
    ) : (
      <ActivityIndicator accessibilityLabel="불러오는 중" />
    )}
  </View>
);
