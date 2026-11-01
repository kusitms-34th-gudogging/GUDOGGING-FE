import { cva, type VariantProps } from 'class-variance-authority';
import { Modal as RNModal, Pressable, Text, View } from 'react-native';

const modalTextVariants = cva('w-full gap-stack-sm px-inset-lg', {
  variants: {
    buttons: {
      none: 'py-section',
      confirm: 'pb-inset-lg pt-section',
      both: 'pb-inset-lg pt-section',
    },
  },
  defaultVariants: { buttons: 'none' },
});

interface ModalProps extends VariantProps<typeof modalTextVariants> {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  showDescription?: boolean;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export const Modal = ({
  visible,
  onClose,
  buttons,
  title,
  description,
  showDescription = true,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: ModalProps) => (
  <RNModal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
    <View className="flex-1 items-center justify-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="닫기"
        onPress={onClose}
        className="absolute inset-0 bg-bg-dim"
      />
      <View className="w-[311px] overflow-hidden rounded-modal bg-surface-raised shadow-elevation-3">
        <View className={modalTextVariants({ buttons })}>
          <Text numberOfLines={2} className="text-center text-text-primary text-head4-bold">
            {title}
          </Text>
          {showDescription && description && (
            <Text numberOfLines={5} className="text-center text-text-secondary text-body2-regular">
              {description}
            </Text>
          )}
        </View>
        {buttons && buttons !== 'none' && (
          <View className="flex-row border-t-default border-border-default">
            {buttons === 'both' && (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onCancel?.();
                  onClose();
                }}
                className="h-bottom-cta flex-1 items-center justify-center border-r-default border-border-default px-inset-md"
              >
                <Text
                  numberOfLines={1}
                  className="max-w-[120px] text-text-secondary text-body1-semibold"
                >
                  {cancelLabel}
                </Text>
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                onConfirm?.();
                onClose();
              }}
              className="h-bottom-cta flex-1 items-center justify-center px-inset-md"
            >
              <Text numberOfLines={1} className="max-w-[120px] text-text-brand text-body1-semibold">
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  </RNModal>
);
