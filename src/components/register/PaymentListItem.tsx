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
    showCost
    costColor={payment ? 'text-text-primary' : 'text-text-error'}
    iconRight={ChevronRightIcon}
    showIconRight={showChevron}
    iconRightColor={payment ? 'text-icon-primary' : 'text-text-error'}
    iconRightAction={{
      accessibilityLabel: `${name} 결제 정보 ${payment ? '수정하기' : '입력하기'}`,
      onPress: onEdit,
    }}
    {...checkbox}
  />
);
