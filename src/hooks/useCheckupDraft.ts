import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

// 점검 중 답한 점수(1~5)를 구독별로 임시 저장. cycle은 결제 주기 구분값(다음 결제일)
interface CheckupDraftEntry {
  cycle: string;
  scores: number[];
}

interface CheckupDraft {
  drafts: Record<string, CheckupDraftEntry>;
  setScore: (id: string, cycle: string, step: number, score: number) => void;
  reset: () => void;
}

export const useCheckupDraft = create<CheckupDraft>()(
  persist(
    (set) => ({
      drafts: {},
      setScore: (id, cycle, step, score) =>
        set((s) => {
          // 결제 주기가 바뀌었으면 이전 답은 버림
          const prev = s.drafts[id]?.cycle === cycle ? s.drafts[id].scores : [];
          const scores = [...prev.slice(0, step), score];
          return { drafts: { ...s.drafts, [id]: { cycle, scores } } };
        }),
      reset: () => set({ drafts: {} }),
    }),
    { name: 'checkup-draft', storage: createJSONStorage(() => AsyncStorage) },
  ),
);

// 같은 결제 주기의 임시 저장 점수. 주기가 바뀌었으면 빈 배열 → 1/4부터
export const getCheckupScores = (id: string, cycle: string) => {
  const draft = useCheckupDraft.getState().drafts[id];
  return draft?.cycle === cycle ? draft.scores : [];
};
