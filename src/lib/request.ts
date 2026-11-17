import { authToken, type AuthTokens } from '@/lib/authToken';

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly body: unknown,
  ) {
    super(`API ${status}`);
    this.name = 'ApiError';
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

const send = async (
  path: string,
  { body, headers, ...init }: RequestOptions,
  accessToken: string | null,
) => {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) throw new Error('EXPO_PUBLIC_API_URL이 없음 → .env.local 확인');

  // 파일 업로드(FormData)는 그대로 보내고 Content-Type은 fetch가 경계값까지 붙이게 둠
  const isForm = body instanceof FormData;
  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(body !== undefined && !isForm && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
  });

  const text = await res.text();
  const json: unknown = text ? JSON.parse(text) : undefined;

  if (!res.ok) throw new ApiError(res.status, json);
  // 서버 응답은 { code, message, data }, 훅에는 data만 넘김
  return (json as { data: unknown } | undefined)?.data;
};

// 리프레시 토큰으로 새 토큰을 받아 저장. 없거나 만료면 토큰을 지우고 null (명세: 만료 시 401)
const reissue = async () => {
  const refreshToken = await authToken.getRefresh();
  if (!refreshToken) return null;
  try {
    const tokens = (await send(
      '/api/v1/auth/reissue',
      { method: 'POST', body: { refreshToken } },
      null,
    )) as AuthTokens;
    await authToken.save(tokens);
    return tokens.accessToken;
  } catch {
    await authToken.clear();
    return null;
  }
};

// 동시에 여러 요청이 401이어도 재발급은 한 번만 (재발급하면 리프레시 토큰도 바뀌어서 두 번째는 실패함)
let reissuing: Promise<string | null> | null = null;
const reissueOnce = () => {
  reissuing ??= reissue().finally(() => {
    reissuing = null;
  });
  return reissuing;
};

// 저장한 액세스 토큰을 붙여 보내고, 401이면 토큰을 재발급해 한 번만 다시 보냄
// shortcut: 재발급도 실패하면 에러만 던짐, 로그인 화면으로 보내는 건 세션 확인(S-01) 붙일 때
export const request = async <T>(path: string, options: RequestOptions = {}) => {
  try {
    return (await send(path, options, await authToken.getAccess())) as T;
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    const accessToken = await reissueOnce();
    if (!accessToken) throw error;
    return (await send(path, options, accessToken)) as T;
  }
};
