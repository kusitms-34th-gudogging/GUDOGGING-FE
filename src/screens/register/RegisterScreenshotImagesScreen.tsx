import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AlertCircleIcon } from '@/assets/icons';
import { Cta } from '@/components/common/Cta';
import { ImageCard } from '@/components/common/ImageCard';
import { Text } from '@/components/common/Text';
import { ToastOutlet } from '@/components/common/ToastProvider';
import { TopBar } from '@/components/common/TopBar';
import { useToast } from '@/hooks/useToast';
import { getImageError } from '@/utils/imageFile';

const MAX_IMAGES = 5;

export const RegisterScreenshotImagesScreen = () => {
  const { show } = useToast();
  const [uris, setUris] = useState<string[]>([]);

  const pick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - uris.length,
    });
    if (result.canceled) return;
    const errors = result.assets.map(getImageError);
    const allowed = result.assets.filter((_, i) => !errors[i]);
    // 형식·용량이 섞여 걸리면 형식 토스트 하나만 (E-8 > E-3)
    if (errors.includes('type')) show({ type: 'error', message: 'PNG, JPG 파일만 올릴 수 있어요' });
    else if (errors.includes('size'))
      show({ type: 'error', message: '10MB 이하 이미지만 올릴 수 있어요' });
    setUris((prev) => [...prev, ...allowed.map((a) => a.uri)].slice(0, MAX_IMAGES));
  };

  return (
    <View className="pt-safe flex-1 bg-bg-default">
      <TopBar
        variant="detail"
        title="스크린샷 확인"
        onBack={() => router.back()}
        showAction1={false}
        showAction2={false}
      />
      <View className="flex-1 gap-inset-md px-screen-x pt-stack-md">
        <View className="gap-stack-md">
          <Text className="text-text-primary text-body1-semibold">추가한 스크린샷</Text>
          <View className="flex-row flex-wrap gap-inline-sm">
            {uris.map((uri, i) => (
              <ImageCard
                // 같은 사진을 두 번 고를 수 있어 순서로 구분
                key={`${uri}-${i}`}
                variant="filled"
                source={{ uri }}
                onDelete={() => setUris((prev) => prev.filter((_, j) => j !== i))}
                deleteAccessibilityLabel={`스크린샷 ${i + 1} 삭제`}
              />
            ))}
            {uris.length < MAX_IMAGES && (
              <ImageCard
                variant="add"
                testID="screenshot-images-add"
                onPress={pick}
                accessibilityLabel="스크린샷 추가"
              />
            )}
          </View>
        </View>
        <View className="flex-row gap-stack-sm">
          <View className="py-s2">
            <AlertCircleIcon className="size-icon-list text-icon-secondary" />
          </View>
          <Text className="text-text-secondary text-caption1-regular">
            {'PNG, JPG만 가능해요.\n1장당 10MB 이하로 최대 5장까지 올릴 수 있어요.'}
          </Text>
        </View>
        <ToastOutlet className="bottom-0 pb-stack-sm" />
      </View>
      <View className="pb-safe px-screen-x">
        <Cta
          testID="screenshot-images-analyze"
          label="구독 정보 불러오기"
          disabled={uris.length === 0}
          onPress={() =>
            router.push({ pathname: '/register/analyze', params: { images: JSON.stringify(uris) } })
          }
          className="mb-[14px]"
        />
      </View>
    </View>
  );
};
