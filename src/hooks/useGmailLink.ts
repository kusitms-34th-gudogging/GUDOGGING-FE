import { create } from 'zustand';

interface GmailLink {
  // 연결된 Gmail 주소, 미연결이면 null
  gmail: string | null;
  setGmail: (gmail: string | null) => void;
}

// 마이페이지(E-01)에서 다시 들어와도 연결 상태(E-02·E-03)가 유지되게
// shortcut: 앱 메모리에만 있음, Gmail 연동 API 생기면 서버 조회로 교체
export const useGmailLink = create<GmailLink>()((set) => ({
  gmail: null,
  setGmail: (gmail) => set({ gmail }),
}));
