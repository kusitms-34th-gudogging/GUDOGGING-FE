import { cva, type VariantProps } from 'class-variance-authority';
import { Image, type ImageSourcePropType, Text, View } from 'react-native';

import { cn } from '@/utils/cn';

const notificationItemVariants = cva('flex-row items-start gap-inline-md px-screen-x py-inset-sm', {
  variants: {
    state: { unread: 'bg-bg-brand-subtle', read: '', previous: '' },
  },
  defaultVariants: { state: 'unread' },
});

const notificationTitleVariants = cva('flex-1 text-body3-semibold', {
  variants: {
    state: {
      unread: 'text-text-primary',
      read: 'text-text-primary',
      previous: 'text-text-secondary',
    },
  },
  defaultVariants: { state: 'unread' },
});

const notificationDescriptionVariants = cva('text-caption1-regular', {
  variants: {
    state: {
      unread: 'text-text-secondary',
      read: 'text-text-secondary',
      previous: 'text-text-tertiary',
    },
  },
  defaultVariants: { state: 'unread' },
});

interface NotificationItemProps extends VariantProps<typeof notificationItemVariants> {
  title: string;
  description: string;
  time: string;
  logo?: ImageSourcePropType;
  showLogo?: boolean;
  className?: string;
}

export const NotificationItem = ({
  state,
  title,
  description,
  time,
  logo,
  showLogo = true,
  className,
}: NotificationItemProps) => (
  <View className={cn(notificationItemVariants({ state }), className)}>
    {showLogo && logo && <Image source={logo} className="size-logo-card" />}
    <View className="flex-1 gap-inset-2xs">
      <View className="flex-row items-start gap-inline-sm">
        <Text numberOfLines={1} className={notificationTitleVariants({ state })}>
          {title}
        </Text>
        <Text className="text-text-tertiary text-caption2-regular">{time}</Text>
      </View>
      <Text className={notificationDescriptionVariants({ state })}>{description}</Text>
    </View>
  </View>
);
