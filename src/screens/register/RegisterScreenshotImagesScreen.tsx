import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { AlertCircleIcon } from '@/assets/icons';
import { Cta } from '@/components/common/Cta';
import { ImageCard } from '@/components/common/ImageCard';
import { ToastOutlet } from '@/components/common/ToastProvider';
import { TopBar } from '@/components/common/TopBar';
import { useToast } from '@/hooks/useToast';
import { isAllowedImage } from '@/utils/imageFile';

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
    const allowed = result.assets.filter(isAllowedImage);
    if (allowed.length < result.assets.length)
      // 앨범에서 PNG·JPG만 고를 수 있어 걸러지는 건 사실상 용량 초과뿐
      show({ type: 'error', message: '10MB를 넘는 사진은 추가할 수 없어요.' });
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
              <ImageCard variant="add" onPress={pick} accessibilityLabel="스크린샷 추가" />
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
          label="구독 정보 불러오기"
          disabled={uris.length === 0}
          onPress={() => router.push('/register/analyze')}
          className="mb-[14px]"
        />
      </View>
    </View>
  );
};
