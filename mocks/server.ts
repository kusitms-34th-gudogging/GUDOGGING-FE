import { createServer } from '@msw/serve';

import { handlers } from './handlers.ts';

// 배포처(Render 등)는 PORT 환경변수로 포트를 줌
const PORT = Number(process.env.PORT ?? 9090);

createServer(...handlers).listen(PORT, () => {
  console.log(`목서버 http://localhost:${PORT}`);
});
