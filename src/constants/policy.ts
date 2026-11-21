import { Linking } from 'react-native';

// 이용 약관 및 개인정보 처리방침 노션 페이지 (로그인 화면·마이페이지 공통)
export const POLICY_URL =
  'https://pear-yew-dc3.notion.site/41fe0bd8b68780fcb12fea088ac232ff?source=copy_link';

// 브라우저로 열기. 열 수 없으면 아무 일도 없음
export const openPolicy = () => void Linking.openURL(POLICY_URL).catch(() => {});
