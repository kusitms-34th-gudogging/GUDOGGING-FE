import { ApiError, request } from '@/lib/request';

const mockFetch = (status: number, body?: string) =>
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(body ?? null, { status }));

describe('request', () => {
  beforeEach(() => {
    process.env.EXPO_PUBLIC_API_URL = 'https://api.test';
  });
  afterEach(() => jest.restoreAllMocks());

  it('2xx면 base URL에 경로를 붙여 요청하고 응답의 data를 돌려준다', async () => {
    const fetchSpy = mockFetch(200, '{"code":200,"message":"조회했습니다.","data":{"id":1}}');

    expect(await request('/subscriptions')).toEqual({ id: 1 });
    expect(fetchSpy.mock.calls[0][0]).toBe('https://api.test/subscriptions');
  });

  it.each([404, 500])('%i면 status와 body를 담은 ApiError를 던진다', async (status) => {
    mockFetch(status, '{"code":400,"message":"실패","data":null}');

    const error = await request('/subscriptions').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status, body: { code: 400, message: '실패', data: null } });
  });

  it('body를 넘기면 JSON 문자열로 보내고 Content-Type을 붙인다', async () => {
    const fetchSpy = mockFetch(200, '{}');

    await request('/subscriptions', { method: 'POST', body: { name: '넷플릭스' } });

    const init = fetchSpy.mock.calls[0][1];
    expect(init?.body).toBe('{"name":"넷플릭스"}');
    expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' });
  });

  it('응답 body가 비어 있으면(204) undefined를 돌려준다', async () => {
    mockFetch(204);

    expect(await request('/subscriptions/1')).toBeUndefined();
  });
});
