import { HttpResponse } from 'msw';

// 명세 공통 응답 형태 { code, message, data }
// 명세 mock data에 없어 임의로 채운 값은 `// 임의:` 주석 (grep -rn "임의:" mocks)
export const ok = (message: string, data: unknown = null, code = 200) =>
  HttpResponse.json({ code, message, data }, { status: code });

// 임의: 명세에 에러 응답 형태가 없어 성공과 같은 형태로 (백엔드 확인 필요)
export const fail = (code: number, message: string) =>
  HttpResponse.json({ code, message, data: null }, { status: code });

export const notFound = () => fail(404, '구독을 찾을 수 없어요.');
