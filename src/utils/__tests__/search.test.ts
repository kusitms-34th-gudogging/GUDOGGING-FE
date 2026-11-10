import { keywordRank } from '@/utils/search';

describe('keywordRank', () => {
  it('같음 → 앞부분 일치 → 포함 순으로 높게 매긴다', () => {
    expect(keywordRank(['티빙'], '티빙')).toBe(0);
    expect(keywordRank(['티빙'], '티')).toBe(1);
    expect(keywordRank(['ChatGPT', '챗지피티'], '티')).toBe(2);
  });

  it('영문·한글 이름 중 더 잘 맞는 쪽으로 매기고, 영문은 대소문자를 무시한다', () => {
    expect(keywordRank(['YouTube Premium', '유튜브 프리미엄'], 'youtube')).toBe(1);
    expect(keywordRank(['Netflix', '넷플릭스'], '넷플릭스')).toBe(0);
  });

  it('초성만 입력하면 초성으로 찾고, 이름 일치보다 아래로 매긴다', () => {
    expect(keywordRank(['Netflix', '넷플릭스'], 'ㄴㅍㄹ')).toBe(3);
    expect(keywordRank(['디즈니+', '디즈니 플러스'], 'ㄷㅈㄴ ㅍ')).toBe(3);
  });

  it('한글을 치는 도중의 글자도 찾는다 (넷ㅍ → 넷프 → 넷플)', () => {
    expect(keywordRank(['Netflix', '넷플릭스'], '넷ㅍ')).toBe(3);
    expect(keywordRank(['Netflix', '넷플릭스'], '넷프')).toBe(3);
    expect(keywordRank(['Netflix', '넷플릭스'], '네')).toBe(3);
    expect(keywordRank(['Netflix', '넷플릭스'], '넷플')).toBe(1);
  });

  it('받침 전까지만 친 글자는 마지막 글자일 때만 인정하고, 안 맞으면 undefined', () => {
    expect(keywordRank(['Netflix', '넷플릭스'], '네플')).toBeUndefined();
    expect(keywordRank(['Netflix', '넷플릭스'], '티빙')).toBeUndefined();
    expect(keywordRank(['Netflix', '넷플릭스'], 'ㅌㅂ')).toBeUndefined();
  });
});
