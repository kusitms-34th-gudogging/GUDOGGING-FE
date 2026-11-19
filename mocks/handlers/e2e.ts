import { http } from 'msw';

import { resetDb } from '../db.ts';
import { ok } from '../response.ts';

// E2E 전용. `E2E=1 pnpm mock`일 때만 등록 (handlers.ts) → Render 공용 목서버엔 없음
export const e2eHandlers = [
  http.post('/e2e/reset', () => {
    resetDb();
    return ok('목서버 상태를 초기화했습니다.');
  }),
];
