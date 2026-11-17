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

// shortcut: 인증 헤더·401 재요청 없음, 로그인 API 생기면 api-client.md 규칙대로 여기에 추가
export const request = async <T>(path: string, { body, headers, ...init }: RequestOptions = {}) => {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!baseUrl) throw new Error('EXPO_PUBLIC_API_URL이 없음 → .env.local 확인');

  const res = await fetch(`${baseUrl}${path}`, {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
      ...headers,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const text = await res.text();
  const json: unknown = text ? JSON.parse(text) : undefined;

  if (!res.ok) throw new ApiError(res.status, json);
  // 서버 응답은 { code, message, data }, 훅에는 data만 넘김
  return (json as { data: T } | undefined)?.data as T;
};
