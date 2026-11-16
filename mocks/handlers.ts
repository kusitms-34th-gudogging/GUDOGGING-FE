import { http, HttpResponse } from 'msw';

// 노션 API 명세 보고 엔드포인트별로 추가. 경로는 EXPO_PUBLIC_API_URL 뒤에 붙는 부분
export const handlers = [http.get('/health', () => HttpResponse.json({ status: 'ok' }))];
