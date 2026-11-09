import type { ComponentProps } from 'react';

import { ChevronRightIcon } from '@/assets/icons';
import { ListItem } from '@/components/common/ListItem';
import type { PaymentInfo } from '@/constants/services';
import { formatPaymentSummary, formatWon } from '@/utils/formatPayment';

type PaymentListItemProps = Pick<
  ComponentProps<typeof ListItem>,
  'showCheckBox' | 'checked' | 'onCheckedChange'
> & {
  name: string;
  payment?: PaymentInfo;
  emptySubtitle: string;
  onEdit: () => void;
  // 켜면 입력 전엔 화살표만, 입력 후엔 금액만 (선택한 구독 A-04). 끄면 입력 전엔 빨간 "입력하기"
  showChevron?: boolean;
};

export const PaymentListItem = ({
  name,
  payment,
  emptySubtitle,
  onEdit,
  showChevron = false,
  ...checkbox
}: PaymentListItemProps) => (
  <ListItem
    title={name}
    subtitle={payment ? formatPaymentSummary(payment) : emptySubtitle}
    showSubtitle
    logo={require('@/assets/images/logo_placeholder.png')}
    showLogo
    cost={payment ? formatWon(payment.amount) : '입력하기'}
    showCost={!!payment || !showChevron}
    costColor={payment ? 'text-text-primary' : 'text-text-error'}
    iconRight={ChevronRightIcon}
    showIconRight={showChevron && !payment}
    iconRightAction={{
      accessibilityLabel: `${name} 결제 정보 ${payment ? '수정하기' : '입력하기'}`,
      onPress: onEdit,
    }}
    {...checkbox}
  />
);
