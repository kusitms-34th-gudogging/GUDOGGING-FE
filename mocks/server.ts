import { createServer } from '@msw/serve';

import { handlers } from './handlers.ts';

// 배포처(Render 등)는 PORT 환경변수로 포트를 줌
const PORT = Number(process.env.PORT ?? 9090);

const server = createServer(...handlers);
// 요청마다 한 줄 로그 (앱에서 뭐가 왔는지 확인용): 상태 메서드 경로 Content-Type
// Node 타입 패키지가 없어 쓰는 모양만 적음
interface Req {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
}
interface Res {
  statusCode: number;
  on: (event: 'finish', listener: () => void) => void;
}
server.on('request', (req: Req, res: Res) => {
  res.on('finish', () =>
    console.log(res.statusCode, req.method, req.url, req.headers['content-type'] ?? ''),
  );
});
server.listen(PORT, () => {
  console.log(`목서버 http://localhost:${PORT}`);
});
