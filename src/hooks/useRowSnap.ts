import { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { useAnimatedStyle } from 'react-native-reanimated';

// 스크롤 영역 아래 끝에서 행이 반쯤 잘려 보이지 않게: 맨 위에서 걸리는 행이 있으면 그만큼 아래 간격을 늘려 그 행을 숨기고,
// 스크롤이 멈출 때도 같은 끝선(viewEnd)에 행 아래 끝이 오게 맞춤 (2.5개 들어갈 자리면 2개만 보임)
// 행은 스크롤 내용 안 section > list 안에 있다고 보고 두 단계 y를 더해 위치를 구함
export const useRowSnap = (count: number) => {
  const [avail, setAvail] = useState(0);
  const [listY, setListY] = useState({ section: 0, list: 0 });
  const [rows, setRows] = useState<{ top: number; bottom: number }[]>([]);
  const base = listY.section + listY.list;
  // 날짜를 바꿔 행이 줄면 남은 옛 값은 버림
  const abs = rows.slice(0, count).map((r) => ({ top: base + r.top, bottom: base + r.bottom }));
  const cut = abs.findIndex((r) => r.top < avail && r.bottom > avail);
  const viewEnd = cut < 0 ? avail : cut > 0 ? abs[cut - 1].bottom : abs[0].top;
  const hiddenStyle = useAnimatedStyle(
    () => ({ paddingBottom: avail - viewEnd }),
    [avail, viewEnd],
  );

  return {
    hiddenStyle,
    snapOffsets: [0, ...abs.map((r) => r.bottom - viewEnd).filter((o) => o > 0)],
    onViewportLayout: (e: LayoutChangeEvent) => setAvail(e.nativeEvent.layout.height),
    // y는 updater 밖에서 꺼냄 (updater가 핸들러 반환 뒤 실행될 수 있음)
    onSectionLayout: (e: LayoutChangeEvent) => {
      const { y } = e.nativeEvent.layout;
      setListY((v) => ({ ...v, section: y }));
    },
    onListLayout: (e: LayoutChangeEvent) => {
      const { y } = e.nativeEvent.layout;
      setListY((v) => ({ ...v, list: y }));
    },
    onRowLayout: (i: number) => (e: LayoutChangeEvent) => {
      const { y, height } = e.nativeEvent.layout;
      setRows((r) => Object.assign([...r], { [i]: { top: y, bottom: y + height } }));
    },
  };
};
