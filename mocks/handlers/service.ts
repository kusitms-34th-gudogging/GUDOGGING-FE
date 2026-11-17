import { http } from 'msw';

import { ok } from '../response.ts';

// 임의: defaultAmount는 명세 mock에 없어 채움
export const services = [
  {
    serviceId: '5e1c9a07-5a4d-4e7b-9c21-000000000001',
    serviceName: 'Netflix',
    category: 'VIDEO_OTT',
    logoUrl: 'https://cdn.gudogging.com/logos/netflix.png',
    defaultAmount: 13500,
  },
  {
    serviceId: '5e1c9a07-5a4d-4e7b-9c21-000000000002',
    serviceName: 'YouTube Premium',
    category: 'VIDEO_OTT',
    logoUrl: 'https://cdn.gudogging.com/logos/youtube-premium.png',
    defaultAmount: 14900,
  },
  {
    serviceId: '5e1c9a07-5a4d-4e7b-9c21-000000000003',
    serviceName: 'ChatGPT',
    category: 'PRODUCTIVITY_AI',
    logoUrl: 'https://cdn.gudogging.com/logos/chatgpt.png',
    defaultAmount: null,
  },
];

export const serviceHandlers = [
  // ponytail: 서비스명 부분 일치만, 초성·카테고리명 검색은 서버가 함
  http.get('/api/v1/services', ({ request }) => {
    const keyword = new URL(request.url).searchParams.get('keyword')?.toLowerCase() ?? '';
    return ok('서비스 목록을 조회했습니다.', {
      services: services.filter((s) => s.serviceName.toLowerCase().includes(keyword)),
    });
  }),
];
