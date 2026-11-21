import { authToken } from '@/lib/authToken';
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

  it('FormData는 그대로 보내고 Content-Type을 붙이지 않는다 (multipart 경계값은 fetch가 정함)', async () => {
    const fetchSpy = mockFetch(200, '{}');
    const form = new FormData();
    form.append('images', 'a');

    await request('/upload', { method: 'POST', body: form });

    const init = fetchSpy.mock.calls[0][1];
    expect(init?.body).toBe(form);
    expect(init?.headers).not.toHaveProperty('Content-Type');
  });

  it('응답 body가 비어 있으면(204) undefined를 돌려준다', async () => {
    mockFetch(204);

    expect(await request('/subscriptions/1')).toBeUndefined();
  });
});

const json = (status: number, data: unknown) =>
  new Response(JSON.stringify({ code: status, message: '', data }), { status });
// 경로별 응답. /auth/reissue가 아니면 요청한 토큰이 new-access일 때만 성공
const mockServer = (reissue: () => Response) =>
  jest.spyOn(globalThis, 'fetch').mockImplementation(async (url, init) => {
    if (String(url).endsWith('/api/v1/auth/reissue')) return reissue();
    const auth = (init?.headers as Record<string, string>).Authorization;
    return auth === 'Bearer new-access' ? json(200, { ok: true }) : json(401, null);
  });
const calls = () =>
  jest.mocked(globalThis.fetch).mock.calls.map(([url, init]) => ({
    path: new URL(String(url)).pathname,
    auth: (init?.headers as Record<string, string>).Authorization,
    body: init?.body ? JSON.parse(String(init.body)) : undefined,
  }));

describe('request 인증', () => {
  beforeEach(() => authToken.save({ accessToken: 'old-access', refreshToken: 'old-refresh' }));
  afterEach(async () => {
    jest.restoreAllMocks();
    await authToken.clear();
  });

  it('저장한 액세스 토큰을 붙이고, 401이면 재발급한 토큰을 저장해 한 번 더 보낸다', async () => {
    mockServer(() => json(200, { accessToken: 'new-access', refreshToken: 'new-refresh' }));

    expect(await request('/api/v1/home')).toEqual({ ok: true });

    expect(calls()).toEqual([
      { path: '/api/v1/home', auth: 'Bearer old-access', body: undefined },
      { path: '/api/v1/auth/reissue', auth: undefined, body: { refreshToken: 'old-refresh' } },
      { path: '/api/v1/home', auth: 'Bearer new-access', body: undefined },
    ]);
    expect(await authToken.getRefresh()).toBe('new-refresh');
  });

  it('재발급도 실패하면(리프레시 만료) 토큰을 지우고 처음 401을 던진다', async () => {
    mockServer(() => json(401, null));

    const error = await request('/api/v1/home').catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 401 });
    expect(await authToken.getAccess()).toBeNull();
    expect(await authToken.getRefresh()).toBeNull();
  });

  it('재발급이 5xx로 실패하면 토큰을 남기고 그 에러를 던진다 (로그아웃되지 않음)', async () => {
    mockServer(() => json(502, null));

    const error = await request('/api/v1/home').catch((e: unknown) => e);

    expect(error).toMatchObject({ status: 502 });
    expect(await authToken.getRefresh()).toBe('old-refresh');
  });

  it('동시에 여러 요청이 401이어도 재발급은 한 번만 한다', async () => {
    mockServer(() => json(200, { accessToken: 'new-access', refreshToken: 'new-refresh' }));

    await Promise.all([request('/api/v1/home'), request('/api/v1/subscriptions')]);

    expect(calls().filter((c) => c.path === '/api/v1/auth/reissue')).toHaveLength(1);
  });
});
