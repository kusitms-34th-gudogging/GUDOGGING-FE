import { keepPreviousData, useQuery } from '@tanstack/react-query';

import type { Service } from '@/constants/services';
import { request } from '@/lib/request';
import { type ApiCategory, CATEGORY_LABEL } from '@/utils/apiCodes';

interface ServicesResponse {
  services: {
    serviceId: string;
    serviceName: string;
    category: ApiCategory;
    logoUrl: string;
    defaultAmount: number | null;
  }[];
}

export const serviceKeys = {
  all: ['services'] as const,
  list: (keyword: string) => [...serviceKeys.all, { keyword }] as const,
};

// 사전 등록 서비스 (A-02). 인기순, keyword가 있으면 서버가 초성·서비스명·카테고리명으로 검색 (명세)
// 검색어를 바꾸는 동안 이전 결과를 유지해 목록이 깜빡이지 않게
export const useServices = (keyword = '') =>
  useQuery({
    queryKey: serviceKeys.list(keyword),
    queryFn: ({ signal }) =>
      request<ServicesResponse>(
        `/api/v1/services${keyword ? `?keyword=${encodeURIComponent(keyword)}` : ''}`,
        { signal },
      ),
    placeholderData: keepPreviousData,
    select: (data): Service[] =>
      data.services.map((s) => ({
        id: s.serviceId,
        name: s.serviceName,
        category: CATEGORY_LABEL[s.category],
        defaultAmount: s.defaultAmount ?? undefined,
      })),
  });
