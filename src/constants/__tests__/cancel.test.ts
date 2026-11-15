import { getCancelGuide } from '@/constants/cancel';

describe('getCancelGuide', () => {
  it('스토어 결제는 결제 경로별 안내', () => {
    expect(getCancelGuide('netflix', 'appstore').cta).toBe('App Store 구독 관리 열기');
    expect(getCancelGuide('millie', 'playstore').cta).toBe('Google Play 정기 결제 열기');
  });

  it('웹 결제는 해지 링크가 있으면 이동, 없으면 해지했어요 + 기본 안내', () => {
    expect(getCancelGuide('coupang', 'web').cta).toBe('해지 페이지로 이동');
    const noLink = getCancelGuide('melon', 'web');
    expect(noLink.cta).toBe('해지했어요');
    expect(noLink.steps).toBeUndefined();
  });
});
