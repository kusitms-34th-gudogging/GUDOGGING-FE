import { HttpResponse } from 'msw';

// 명세 공통 응답 형태 { code, message, data }
// 명세 mock data에 없어 임의로 채운 값은 `// 임의:` 주석 (grep -rn "임의:" mocks)
export const ok = (message: string, data: unknown = null, code = 200) =>
  HttpResponse.json({ code, message, data }, { status: code });

// 에러도 같은 형태, code는 명세 오류 코드 (예: 404 → 40404)
export const fail = (status: number, code: number, message: string) =>
  HttpResponse.json({ code, message, data: null }, { status });

export const notFound = () => fail(404, 40404, '구독을 찾을 수 없습니다.');
