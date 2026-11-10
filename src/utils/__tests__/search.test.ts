import { matchesKeyword } from '@/utils/search';

describe('matchesKeyword', () => {
  it('일부 단어로 찾고 영문은 대소문자를 무시한다', () => {
    expect(matchesKeyword('YouTube Premium 유튜브 프리미엄', 'tube')).toBe(true);
    expect(matchesKeyword('YouTube Premium 유튜브 프리미엄', '프리')).toBe(true);
    expect(matchesKeyword('Netflix 넷플릭스', '티빙')).toBe(false);
  });

  it('초성만 입력하면 초성으로 찾는다', () => {
    expect(matchesKeyword('Netflix 넷플릭스', 'ㄴㅍㄹ')).toBe(true);
    expect(matchesKeyword('디즈니+ 디즈니 플러스', 'ㄷㅈㄴ ㅍ')).toBe(true);
    expect(matchesKeyword('Netflix 넷플릭스', 'ㅌㅂ')).toBe(false);
  });

  it('초성과 완성형이 섞이면 초성 검색을 하지 않는다', () => {
    expect(matchesKeyword('Netflix 넷플릭스', '넷ㅍ')).toBe(false);
  });
});
