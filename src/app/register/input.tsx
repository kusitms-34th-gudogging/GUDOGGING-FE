import { useLocalSearchParams } from 'expo-router';

import { useRegisterDraft } from '@/hooks/useRegisterDraft';
import { RegisterServiceInputScreen } from '@/screens/register/RegisterServiceInputScreen';

export default function RegisterServiceInputRoute() {
  const { id, found, more, picked, reregister, edit } = useLocalSearchParams<{
    id?: string;
    found?: string;
    more?: string;
    // 구독 추가하기로 간 A-02에서 체크해 둔 서비스 id (쉼표로 이음)
    picked?: string;
    // 지난 구독 재등록(M-05)이면 그 구독 id
    reregister?: string;
    // 구독 편집이면 그 구독 id
    edit?: string;
  }>();
  // 불러온 구독 수정(A-15)은 분석 결과에서 찾음
  const foundItem = useRegisterDraft((s) => s.found.find((f) => f.id === id));
  return (
    <RegisterServiceInputScreen
      serviceId={id}
      found={found ? foundItem : undefined}
      more={!!more}
      picked={picked?.split(',').filter(Boolean)}
      reactivateId={reregister}
      editId={edit}
    />
  );
}
