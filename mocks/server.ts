import { createServer } from '@msw/serve';

import { handlers } from './handlers.ts';

const PORT = 9090;

createServer(...handlers).listen(PORT, () => {
  console.log(`목서버 http://localhost:${PORT}`);
});
