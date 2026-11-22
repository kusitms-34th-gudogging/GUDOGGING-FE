import type { ComponentProps } from 'react';

import { ChevronRightIcon } from '@/assets/icons';
import { ListItem } from '@/components/common/ListItem';
import { type PaymentInfo, serviceLogo } from '@/constants/services';
import { formatPaymentSummary, formatWon } from '@/utils/formatPayment';

type PaymentListItemProps = Pick<
  ComponentProps<typeof ListItem>,
  'showCheckBox' | 'checked' | 'onCheckedChange'
> & {
  name: string;
  // 사전 등록 서비스 로고. 없으면 기본 이미지
  logoUrl?: string;
  payment?: PaymentInfo;
  emptySubtitle: string;
  onEdit: () => void;
  // 켜면 입력 전엔 화살표만, 입력 후엔 금액만 (선택한 구독 A-04). 끄면 입력 전엔 빨간 "입력하기"
  showChevron?: boolean;
  testID?: string;
};

export const PaymentListItem = ({
  name,
  logoUrl,
  payment,
  emptySubtitle,
  onEdit,
  showChevron = false,
  testID,
  ...checkbox
}: PaymentListItemProps) => (
  <ListItem
    title={name}
    subtitle={payment ? formatPaymentSummary(payment) : emptySubtitle}
    showSubtitle
    logo={serviceLogo(logoUrl)}
    showLogo
    cost={payment ? formatWon(payment.amount) : '입력하기'}
    showCost={!!payment || !showChevron}
    costColor={payment ? 'text-text-primary' : 'text-text-error'}
    iconRight={ChevronRightIcon}
    showIconRight={showChevron && !payment}
    iconRightAction={{
      accessibilityLabel: `${name} 결제 정보 ${payment ? '수정하기' : '입력하기'}`,
      onPress: onEdit,
      testID,
    }}
    {...checkbox}
  />
);
