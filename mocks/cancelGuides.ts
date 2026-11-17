// 결제 경로별 해지 안내 (X-01·X-03·X-04). 서버의 서비스 DB 데이터
// 임의: 서비스명 자리 표시 형식은 명세에 없어 점검 문항과 같은 {name} (앱이 조사까지 맞춰 채움, 백엔드 확인 필요)

interface Guide {
  steps: string[];
  cancelUrl: string | null;
  caution: string | null;
}

const STORE: Record<string, Guide> = {
  APP_STORE: {
    steps: [
      '아래 버튼을 눌러 App Store\n구독 관리 화면을 열어요',
      '목록에서 {name}을 선택해요',
      '‘구독 취소’를 누르면 끝!',
    ],
    cancelUrl: 'https://apps.apple.com/account/subscriptions',
    caution: '다른 Apple ID로 결제했거나 가족 공유 중인 구독은\n목록에 보이지 않을 수 있어요',
  },
  GOOGLE_PLAY: {
    steps: [
      '아래 버튼을 눌러 Google Play\n정기 결제 화면을 열어요',
      '목록에서 {name}을 선택해요',
      '‘정기 결제 취소’를 누르면 끝!',
    ],
    cancelUrl: 'https://play.google.com/store/account/subscriptions',
    caution: '다른 Google 계정으로 결제한 구독은\n목록에 보이지 않을 수 있어요',
  },
};

// 웹·직접 결제는 서비스마다. 서비스 DB에 해지 경로가 있는 서비스만 (사전 등록 서비스 id)
const WEB: Record<string, Guide> = {
  // Netflix (명세 mock)
  '5e1c9a07-5a4d-4e7b-9c21-000000000001': {
    steps: ['넷플릭스 접속', '멤버십 관리', '멤버십 해지'],
    cancelUrl: 'https://www.netflix.com/cancelplan',
    caution: '해지해도 결제 기간 끝까지 이용 가능',
  },
};

// 해지 경로 텍스트가 없을 때 (명세 문구, {서비스명} → {name})
export const DEFAULT_GUIDE =
  '{name} 앱이나 웹사이트의 내 정보 › 구독(멤버십) 관리에서 해지할 수 있어요. 통신사 결제라면 통신사 고객센터나 앱에서 해지해 주세요.';

// 없으면 해지 경로 없음 (steps 빈 배열 + guideMessage)
export const cancelGuide = (paymentMethod: string, serviceId: string | null) =>
  STORE[paymentMethod] ?? (serviceId ? WEB[serviceId] : undefined);
