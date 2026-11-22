import type { ComponentType } from 'react';
import type { SvgProps } from 'react-native-svg';

import {
  EducationColorAsset,
  EntertainmentColorAsset,
  EtcColorAsset,
  MusicColorAsset,
  OttColorAsset,
  ProductivityColorAsset,
  ShoppingColorAsset,
} from '@/assets/graphics';

export type CheckupCategory =
  'ott' | 'music' | 'shopping' | 'education' | 'productivity' | 'entertainment' | 'etc';

// 문항 1개 (서버가 카테고리에 맞춰 서비스명·조사·금액·날짜를 채운 완성 문장으로 줌)
export interface CheckupQuestion {
  title: string;
  hint: string;
  options: string[];
}

// 카테고리별로 앱이 갖는 것: 진행 링 그래픽과 해지 이유 문구 (문항·메모 예시는 서버 응답)
interface CheckupCategoryConfig {
  asset: ComponentType<SvgProps>;
  // 해지 이유(K-90): 잘 안 씀 · 구독료 부담 · [카테고리별 부족한 점] · 다른 서비스로 옮김 · [목적 달성]
  // 순서가 해지 이유 코드(RARELY_USED~GOAL_ACHIEVED) 순서 (hooks/useDecideCheckup)
  cancelReasons: string[];
}

const cancel = ([unused, lacking, done]: string[]) => [
  unused,
  '구독료가 부담돼요',
  lacking,
  '다른 서비스로 옮겨요',
  done,
];

// Figma 06 구독 점검 화면 설계서(CHK-009, K-90) 해지 이유 문구
export const CHECKUP_CATEGORIES: Record<CheckupCategory, CheckupCategoryConfig> = {
  ott: {
    asset: OttColorAsset,
    cancelReasons: cancel([
      '요즘 잘 안 봐요',
      '볼 만한 콘텐츠가 없어요',
      '보고 싶던 작품을 다 봤어요',
    ]),
  },
  music: {
    asset: MusicColorAsset,
    cancelReasons: cancel(['요즘 잘 안 들어요', '듣고 싶은 곡이 없어요', '무료로도 충분해요']),
  },
  shopping: {
    asset: ShoppingColorAsset,
    cancelReasons: cancel([
      '주문을 잘 안 해요',
      '혜택이 기대보다 적어요',
      '필요한 쇼핑을 다 했어요',
    ]),
  },
  education: {
    asset: EducationColorAsset,
    cancelReasons: cancel([
      '요즘 공부를 못 해요',
      '원하는 강의·콘텐츠가 없어요',
      '목표를 달성했어요',
    ]),
  },
  productivity: {
    asset: ProductivityColorAsset,
    cancelReasons: cancel(['요즘 잘 안 써요', '무료 버전으로도 충분해요', '하던 작업이 끝났어요']),
  },
  entertainment: {
    asset: EntertainmentColorAsset,
    cancelReasons: cancel(['요즘 잘 안 써요', '즐길 콘텐츠가 없어요', '보고 싶던 걸 다 봤어요']),
  },
  etc: {
    asset: EtcColorAsset,
    cancelReasons: cancel(['요즘 잘 안 써요', '기대한 기능이 없어요', '더 이상 필요 없어요']),
  },
};

// 등록 화면의 카테고리 이름 → 점검 카테고리. 미지정·직접 입력은 기타
const BY_LABEL: Record<string, CheckupCategory> = {
  '영상·OTT': 'ott',
  음악: 'music',
  '쇼핑·배달 멤버십': 'shopping',
  '교육·학습': 'education',
  '생산성·AI': 'productivity',
  엔터테인먼트: 'entertainment',
};
export const toCheckupCategory = (label?: string): CheckupCategory =>
  (label && BY_LABEL[label]) || 'etc';

export interface CheckupSubscription {
  id: string;
  name: string;
  category?: string;
  amount: number;
  nextDate: Date;
}

// K-80 "같은 {서비스명}, 더 싸게" 추천 카드
export interface CheckupRecommendation {
  id: string;
  title: string;
  // 포함 내용 (예: 넷플릭스 + 유튜브 프리미엄)
  subtitle: string;
  // 제공사 유형 · 핵심 조건
  tags: [string, string];
  // FIXED '월 N원'(확정 절약) · MAX '최대 N원'(카드) · BENEFIT 큰 숫자 대신 tags[1](통신 요금제)
  priceType: 'FIXED' | 'MAX' | 'BENEFIT';
  // 월 절감액. BENEFIT이면 null
  saving: number | null;
  // 절감 막대 % (0~100). BENEFIT이면 null
  rate: number | null;
  // 상품 월 가격 (FIXED '월 N원에 이용', BENEFIT '요금제 월 N원'). MAX면 null
  price: number | null;
}
