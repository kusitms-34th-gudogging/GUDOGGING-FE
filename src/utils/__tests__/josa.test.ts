import { fillName } from '@/utils/josa';

describe('fillName', () => {
  it('받침 유무에 따라 을/를을 고른다', () => {
    expect(fillName('{name}을 썼나요?', '넷플릭스')).toBe('넷플릭스를 썼나요?');
    expect(fillName('{name}을 썼나요?', '쿠팡 와우')).toBe('쿠팡 와우를 썼나요?');
    expect(fillName('{name}을 썼나요?', '밀리의 서재')).toBe('밀리의 서재를 썼나요?');
    expect(fillName('{name}을 썼나요?', '티빙')).toBe('티빙을 썼나요?');
  });

  it('ㄹ 받침은 으로 대신 로를 쓴다', () => {
    expect(fillName('{name}으로 들은', '멜론')).toBe('멜론으로 들은');
    expect(fillName('{name}으로 들은', '스포티파이')).toBe('스포티파이로 들은');
    expect(fillName('{name}으로 한 공부', 'iCloud+')).toBe('iCloud+로 한 공부');
    expect(fillName('{name}으로 들은', '키즈 몰')).toBe('키즈 몰로 들은');
  });

  it('조사가 없으면 이름만 넣는다', () => {
    expect(fillName('{name}에서 본', '넷플릭스')).toBe('넷플릭스에서 본');
  });
});
