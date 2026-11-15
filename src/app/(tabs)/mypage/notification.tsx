import { requestNotificationPermission } from '@/lib/notifications';
import { MypageNotificationScreen } from '@/screens/mypage/MypageNotificationScreen';

export default function MypageNotificationRoute() {
  return <MypageNotificationScreen onRequestPermission={requestNotificationPermission} />;
}
