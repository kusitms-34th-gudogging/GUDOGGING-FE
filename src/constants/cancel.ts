import type { PaidAt } from '@/constants/services';

// 해지 안내(X-01·X-03·X-04·X-05). 문구의 {name}은 서비스명으로 채움 (fillName)
export interface CancelGuide {
  payment: string;
  // 없으면 기본 안내 문구(DEFAULT_WEB_GUIDE)
  steps?: string[];
  notice?: string;
  // 없으면 '해지했어요' 버튼 (X-05)
  url?: string;
  cta: string;
}

export const DEFAULT_WEB_GUIDE =
  '{name} 앱이나 웹사이트의 내 정보 › 구독(멤버십) 관리에서 해지할 수 있어요. 통신사 결제라면 통신사 고객센터나 앱에서 해지해 주세요.';

const STORE_GUIDES: Record<Exclude<PaidAt, 'web'>, CancelGuide> = {
  appstore: {
    payment: 'App Store 결제',
    steps: [
      '아래 버튼을 눌러 App Store\n구독 관리 화면을 열어요',
      '목록에서 {name}을 선택해요',
      '‘구독 취소’를 누르면 끝!',
    ],
    notice: '다른 Apple ID로 결제했거나 가족 공유 중인 구독은\n목록에 보이지 않을 수 있어요',
    url: 'https://apps.apple.com/account/subscriptions',
    cta: 'App Store 구독 관리 열기',
  },
  playstore: {
    payment: 'Google Play 결제',
    steps: [
      '아래 버튼을 눌러 Google Play\n정기 결제 화면을 열어요',
      '목록에서 {name}을 선택해요',
      '‘정기 결제 취소’를 누르면 끝!',
    ],
    notice: '다른 Google 계정으로 결제한 구독은\n목록에 보이지 않을 수 있어요',
    url: 'https://play.google.com/store/account/subscriptions',
    cta: 'Google Play 정기 결제 열기',
  },
};

// shortcut: 서비스 DB 없이 샘플, 서비스 API 연동 시 응답의 해지 경로·링크로 교체
const WEB_GUIDES: Record<string, Pick<CancelGuide, 'steps' | 'notice' | 'url'>> = {
  coupang: {
    steps: [
      '쿠팡 앱/웹에 로그인해요',
      '마이쿠팡 › 와우 멤버십 › 해지 신청',
      '혜택 안내를 넘기고 ‘해지’ 확인',
    ],
    notice: '해지해도 남은 기간까지는 혜택을 쓸 수 있어요',
    url: 'https://www.coupang.com',
  },
};

export const getCancelGuide = (serviceId: string, paidAt: PaidAt): CancelGuide => {
  if (paidAt !== 'web') return STORE_GUIDES[paidAt];
  const web = WEB_GUIDES[serviceId];
  return {
    payment: '웹·직접 결제',
    ...web,
    cta: web?.url ? '해지 페이지로 이동' : '해지했어요',
  };
};
