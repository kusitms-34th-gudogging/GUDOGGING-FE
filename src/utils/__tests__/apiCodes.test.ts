import { toCheckupCategory } from '@/constants/checkup';
import {
  CATEGORY_LABEL,
  toCategoryCode,
  toCycleUnitCode,
  toPaymentMethodCode,
} from '@/utils/apiCodes';

// API 카테고리 → 화면 이름 → 점검 카테고리. 이름이 한 글자라도 다르면 기타 문항으로 빠짐
it('API 카테고리마다 그 카테고리의 점검 문항을 고른다', () => {
  expect(
    Object.fromEntries(
      Object.entries(CATEGORY_LABEL).map(([code, label]) => [code, toCheckupCategory(label)]),
    ),
  ).toEqual({
    VIDEO_OTT: 'ott',
    MUSIC: 'music',
    SHOPPING_DELIVERY: 'shopping',
    EDUCATION: 'education',
    PRODUCTIVITY_AI: 'productivity',
    ENTERTAINMENT: 'entertainment',
    ETC: 'etc',
  });
});

describe('화면 값 → API 코드', () => {
  it('등록 화면의 쇼핑·멤버십도 쇼핑 코드로, 모르는 카테고리는 기타로', () => {
    expect(toCategoryCode('쇼핑·멤버십')).toBe('SHOPPING_DELIVERY');
    expect(toCategoryCode('쇼핑·배달 멤버십')).toBe('SHOPPING_DELIVERY');
    expect(toCategoryCode('영상·OTT')).toBe('VIDEO_OTT');
    expect(toCategoryCode('기타')).toBe('ETC');
    expect(toCategoryCode(undefined)).toBe('ETC');
  });

  it('주기 단위·결제한 곳을 코드로', () => {
    expect(['일', '주', '개월', '년'].map(toCycleUnitCode)).toEqual([
      'DAY',
      'WEEK',
      'MONTH',
      'YEAR',
    ]);
    expect(toPaymentMethodCode('appstore')).toBe('APP_STORE');
    expect(toPaymentMethodCode('playstore')).toBe('GOOGLE_PLAY');
    expect(toPaymentMethodCode('web')).toBe('WEB_DIRECT');
  });
});
