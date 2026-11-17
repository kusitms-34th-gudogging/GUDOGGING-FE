import { HttpResponse } from 'msw';

// 명세 공통 응답 형태 { code, message, data }
// 명세 mock data에 없어 임의로 채운 값은 `// 임의:` 주석 (grep -rn "임의:" mocks)
export const ok = (message: string, data: unknown = null, code = 200) =>
  HttpResponse.json({ code, message, data }, { status: code });

export const SUBSCRIPTION_ID = '3f2b8c1e-5a4d-4e7b-9c21-000000000001';
export const CHECKUP_ID = 'b1d7a2c4-5a4d-4e7b-9c21-000000000001';
