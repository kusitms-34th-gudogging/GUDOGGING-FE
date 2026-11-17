import { toCheckupCategory } from '@/constants/checkup';
import { CATEGORY_LABEL } from '@/utils/apiCodes';

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
