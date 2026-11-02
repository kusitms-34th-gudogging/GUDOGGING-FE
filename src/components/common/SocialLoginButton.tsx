import { cva, type VariantProps } from 'class-variance-authority';
import { Pressable, Text } from 'react-native';

import { LogoAppleColorAsset, LogoGoogleColorAsset } from '@/assets/graphics';
import { cn } from '@/utils/cn';

// 색·문구는 Apple HIG / Google 브랜드 가이드 고정값이라 토큰을 쓰지 않음
const socialLoginButtonVariants = cva(
  'h-bottom-cta w-full flex-row items-center justify-center gap-inline-sm rounded-cta px-inset-lg',
  {
    variants: {
      provider: {
        apple: 'bg-[#000000]',
        google: 'border-default border-[#747775] bg-[#FFFFFF]',
      },
    },
  },
);

const socialLoginButtonLabelVariants = cva('shrink text-body1-semibold', {
  variants: {
    provider: {
      apple: 'text-[#FFFFFF]',
      google: 'text-[#1F1F1F]',
    },
  },
});

const PROVIDERS = {
  apple: { label: 'Apple로 로그인', logo: LogoAppleColorAsset },
  google: { label: 'Google 계정으로 로그인', logo: LogoGoogleColorAsset },
} as const;

interface SocialLoginButtonProps extends VariantProps<typeof socialLoginButtonVariants> {
  provider: NonNullable<VariantProps<typeof socialLoginButtonVariants>['provider']>;
  onPress?: () => void;
  className?: string;
}

export const SocialLoginButton = ({ provider, onPress, className }: SocialLoginButtonProps) => {
  const { label, logo: Logo } = PROVIDERS[provider];

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={cn(socialLoginButtonVariants({ provider }), className)}
    >
      <Logo className="size-icon-sm" />
      <Text numberOfLines={1} className={socialLoginButtonLabelVariants({ provider })}>
        {label}
      </Text>
    </Pressable>
  );
};
