import type { ImagePickerAsset } from 'expo-image-picker';

import { isAllowedImage } from '@/utils/imageFile';

const asset = (a: Partial<ImagePickerAsset>): ImagePickerAsset => ({
  uri: 'file:///a.png',
  width: 100,
  height: 100,
  ...a,
});

describe('isAllowedImage', () => {
  it('PNG·JPG만 통과한다', () => {
    expect(isAllowedImage(asset({ mimeType: 'image/png' }))).toBe(true);
    expect(isAllowedImage(asset({ mimeType: 'image/jpeg' }))).toBe(true);
    expect(isAllowedImage(asset({ mimeType: 'image/heic' }))).toBe(false);
  });

  it('mimeType이 없으면 파일 확장자로 판단한다', () => {
    expect(isAllowedImage(asset({ fileName: 'shot.JPG' }))).toBe(true);
    expect(isAllowedImage(asset({ uri: 'file:///b.heic' }))).toBe(false);
  });

  it('10MB를 넘으면 막고, 크기를 모르면 통과한다', () => {
    const MB = 1024 * 1024;
    expect(isAllowedImage(asset({ mimeType: 'image/png', fileSize: 10 * MB }))).toBe(true);
    expect(isAllowedImage(asset({ mimeType: 'image/png', fileSize: 10 * MB + 1 }))).toBe(false);
    expect(isAllowedImage(asset({ mimeType: 'image/png' }))).toBe(true);
  });
});
