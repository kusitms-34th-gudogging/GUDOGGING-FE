import { Modal as RNModal, Pressable, Text, View } from 'react-native';

interface ModalProps {
  visible: boolean;
  onClose: () => void;
  buttons?: 'none' | 'confirm' | 'both';
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
  buttons = 'none',
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
      {/* 바깥(딤)을 눌러도 닫히지 않음. 버튼으로만 닫음 (화면설계서) */}
      <View className="absolute inset-0 bg-bg-dim" />
      <View className="w-[280px] overflow-hidden rounded-card bg-surface-raised shadow-elevation-3">
        <View className="w-full gap-stack-xs px-inset-md py-s20">
          <Text numberOfLines={2} className="text-center text-text-primary text-body2-semibold">
            {title}
          </Text>
          {showDescription && description && (
            <Text
              numberOfLines={5}
              className="text-center text-text-secondary text-caption1-regular"
            >
              {description}
            </Text>
          )}
        </View>
        {buttons !== 'none' && (
          <View className="flex-row border-t-[0.5px] border-border-default">
            {buttons === 'both' && (
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  onCancel?.();
                  onClose();
                }}
                className="h-touch-target flex-1 items-center justify-center border-r-[0.5px] border-border-default px-inset-md"
              >
                <Text
                  numberOfLines={1}
                  className="max-w-[120px] text-text-secondary text-body3-semibold"
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
              className="h-touch-target flex-1 items-center justify-center px-inset-md"
            >
              <Text numberOfLines={1} className="max-w-[120px] text-text-brand text-body3-semibold">
                {confirmLabel}
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    </View>
  </RNModal>
);
