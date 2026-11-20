import { http } from 'msw';

import { db } from '../db.ts';
import { ok } from '../response.ts';
import { keywordRank } from '../search.ts';

// 사전 등록 서비스 (인기순)
// 임의: defaultAmount는 명세 mock에 없어 채움
const CATALOG = [
  { id: 1, name: 'Netflix', category: 'VIDEO_OTT', defaultAmount: 13500 },
  {
    id: 2,
    name: 'YouTube Premium',
    category: 'VIDEO_OTT',
    defaultAmount: 14900,
  },
  {
    id: 3,
    name: 'ChatGPT',
    category: 'PRODUCTIVITY_AI',
    defaultAmount: null,
  },
  { id: 4, name: 'Spotify', category: 'MUSIC', defaultAmount: 10900 },
  { id: 5, name: '쿠팡 와우', category: 'SHOPPING_DELIVERY', defaultAmount: 7890 },
  {
    id: 6,
    name: '디즈니+',
    category: 'VIDEO_OTT',
    defaultAmount: 9900,
  },
  { id: 7, name: '티빙', category: 'VIDEO_OTT', defaultAmount: 13900 },
];
const CATEGORY_NAMES: Record<string, string> = {
  VIDEO_OTT: '영상·OTT',
  MUSIC: '음악',
  SHOPPING_DELIVERY: '쇼핑·배달 멤버십',
  PRODUCTIVITY_AI: '생산성·AI',
};

export const services = CATALOG.map(({ id, ...s }) => ({
  serviceId: `5e1c9a07-5a4d-4e7b-9c21-${String(id).padStart(12, '0')}`,
  serviceName: s.name,
  category: s.category,
  logoUrl: `https://cdn.gudogging.com/logos/${id}.png`,
  defaultAmount: s.defaultAmount,
}));

export const serviceHandlers = [
  // 명세: 인기순. keyword가 있으면 초성·서비스명 일부·카테고리명으로 검색 (순서는 그대로 인기순)
  // 글자 비교(초성·치는 중인 글자)는 앱이 쓰던 규칙을 옮겨 옴 (mocks/search)
  // 지금 구독 중인 서비스는 검색 여부와 상관없이 뺌, 해지한 구독의 서비스는 남김 (백엔드 확인)
  http.get('/api/v1/services', ({ request }) => {
    const keyword = new URL(request.url).searchParams.get('keyword')?.trim() ?? '';
    const subscribed = new Set(
      db.subscriptions.filter((s) => s.status === 'ACTIVE').map((s) => s.serviceId),
    );
    const matches = (i: number) => {
      const s = CATALOG[i];
      return keywordRank([s.name, CATEGORY_NAMES[s.category] ?? ''], keyword) !== undefined;
    };
    return ok('서비스 목록을 조회했습니다.', {
      services: services.filter((s, i) => !subscribed.has(s.serviceId) && (!keyword || matches(i))),
    });
  }),
];
