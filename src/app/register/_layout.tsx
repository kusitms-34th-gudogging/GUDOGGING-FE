import { Stack } from 'expo-router';

import { RegisterDraftProvider } from '@/hooks/useRegisterDraft';

export default function RegisterLayout() {
  return (
    <RegisterDraftProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </RegisterDraftProvider>
  );
}
