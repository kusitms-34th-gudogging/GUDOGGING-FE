import type { ImagePickerAsset } from 'expo-image-picker';

import { getImageError } from '@/utils/imageFile';

const asset = (a: Partial<ImagePickerAsset>): ImagePickerAsset => ({
  uri: 'file:///a.png',
  width: 100,
  height: 100,
  ...a,
});

const MB = 1024 * 1024;

describe('getImageError', () => {
  it('PNG·JPG만 통과하고 나머지는 형식 오류', () => {
    expect(getImageError(asset({ mimeType: 'image/png' }))).toBeNull();
    expect(getImageError(asset({ mimeType: 'image/jpeg' }))).toBeNull();
    expect(getImageError(asset({ mimeType: 'image/heic' }))).toBe('type');
    expect(getImageError(asset({ mimeType: 'image/gif' }))).toBe('type');
    expect(getImageError(asset({ mimeType: 'image/webp' }))).toBe('type');
  });

  it('mimeType이 없으면 파일 확장자로 판단한다', () => {
    expect(getImageError(asset({ fileName: 'shot.JPG' }))).toBeNull();
    expect(getImageError(asset({ uri: 'file:///b.heic' }))).toBe('type');
  });

  it('10MB를 넘으면 용량 오류, 크기를 모르면 통과한다', () => {
    expect(getImageError(asset({ mimeType: 'image/png', fileSize: 10 * MB }))).toBeNull();
    expect(getImageError(asset({ mimeType: 'image/png', fileSize: 10 * MB + 1 }))).toBe('size');
    expect(getImageError(asset({ mimeType: 'image/png' }))).toBeNull();
  });

  it('형식과 용량이 둘 다 틀리면 형식 오류', () => {
    expect(getImageError(asset({ mimeType: 'image/heic', fileSize: 20 * MB }))).toBe('type');
  });
});
