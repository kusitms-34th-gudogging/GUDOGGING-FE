import { userEvent } from '@testing-library/react-native';
import * as ImagePicker from 'expo-image-picker';
import { Slot } from 'expo-router';
import { renderRouter, screen } from 'expo-router/testing-library';

import { ToastProvider } from '@/components/common/ToastProvider';
import { RegisterScreenshotImagesScreen } from '@/screens/register/RegisterScreenshotImagesScreen';

// 사진 보관함은 네이티브 모듈이라 고른 결과만 흉내 냄
jest.mock('expo-image-picker', () => ({ launchImageLibraryAsync: jest.fn() }));
const pickMock = jest.mocked(ImagePicker.launchImageLibraryAsync);

const png = (name: string) =>
  ({
    uri: `file:///${name}.png`,
    mimeType: 'image/png',
    fileSize: 1000,
  }) as ImagePicker.ImagePickerAsset;
const gif = {
  uri: 'file:///a.gif',
  mimeType: 'image/gif',
  fileSize: 1000,
} as ImagePicker.ImagePickerAsset;
const picked = (assets: ImagePicker.ImagePickerAsset[]) =>
  pickMock.mockResolvedValueOnce({ canceled: false, assets });

const renderImages = async () => {
  await renderRouter(
    {
      _layout: () => (
        <ToastProvider>
          <Slot />
        </ToastProvider>
      ),
      'register/images': () => <RegisterScreenshotImagesScreen />,
      'register/analyze': () => null,
    },
    { initialUrl: '/register/images' },
  );
  return userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
};

beforeEach(() => {
  jest.useFakeTimers();
  pickMock.mockReset();
});
afterEach(() => jest.useRealTimers());

describe('RegisterScreenshotImagesScreen', () => {
  it('PNG·JPG가 아닌 파일은 빼고 알려 주며, 남은 사진만 추가한다', async () => {
    picked([png('a'), gif]);
    const user = await renderImages();

    await user.press(screen.getByRole('button', { name: '스크린샷 추가' }));

    expect(screen.getByText('10MB를 넘는 사진은 추가할 수 없어요.')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: '스크린샷 1 삭제' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: '스크린샷 2 삭제' })).not.toBeOnTheScreen();
  });

  it('추가할 수 있는 사진이 없으면 불러오기를 누를 수 없다', async () => {
    picked([gif]);
    const user = await renderImages();

    await user.press(screen.getByRole('button', { name: '스크린샷 추가' }));

    expect(screen.getByRole('button', { name: '구독 정보 불러오기' })).toBeDisabled();
  });

  it('이미 추가한 만큼 빼고 남은 장수만 고를 수 있게 연다', async () => {
    picked([png('a'), png('b')]);
    const user = await renderImages();

    await user.press(screen.getByRole('button', { name: '스크린샷 추가' }));
    picked([]);
    await user.press(screen.getByRole('button', { name: '스크린샷 추가' }));

    expect(pickMock).toHaveBeenLastCalledWith(expect.objectContaining({ selectionLimit: 3 }));
  });

  it('5장을 넘게 골라도 5장까지만 추가하고, 추가 버튼을 숨긴다', async () => {
    picked(['a', 'b', 'c', 'd', 'e', 'f'].map(png));
    const user = await renderImages();

    await user.press(screen.getByRole('button', { name: '스크린샷 추가' }));

    expect(screen.getByRole('button', { name: '스크린샷 5 삭제' })).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: '스크린샷 6 삭제' })).not.toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: '스크린샷 추가' })).not.toBeOnTheScreen();
  });
});
