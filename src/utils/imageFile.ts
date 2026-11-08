import type { ImagePickerAsset } from 'expo-image-picker';

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = ['image/png', 'image/jpeg'];

// PNG·JPG, 10MB 이하만. iOS 앨범은 형식으로 거를 수 없어서 고른 뒤 검사
// mimeType·fileSize가 없을 수 있음(Expo 문서) → mimeType 없으면 파일 확장자로, 크기 모르면 통과
export const isAllowedImage = ({ mimeType, fileName, uri, fileSize }: ImagePickerAsset) => {
  const typeOk = mimeType
    ? ALLOWED_MIME.includes(mimeType)
    : /\.(png|jpe?g)$/i.test(fileName ?? uri);
  return typeOk && (fileSize === undefined || fileSize <= MAX_BYTES);
};
