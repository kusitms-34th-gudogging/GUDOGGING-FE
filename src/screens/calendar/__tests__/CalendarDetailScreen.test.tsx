import { render, screen, userEvent } from '@testing-library/react-native';

import { CALENDAR_SAMPLE } from '@/constants/calendar';
import { CalendarDetailScreen } from '@/screens/calendar/CalendarDetailScreen';

const find = (id: string) => CALENDAR_SAMPLE.find((p) => p.id === id)!;

// 캘린더에서 11월 17일 결제를 눌러 들어온 상세
const renderDetail = (id: string, onDelete = jest.fn()) =>
  render(
    <CalendarDetailScreen payment={find(id)} date={new Date(2026, 10, 17)} onDelete={onDelete} />,
  );

beforeEach(() => jest.useFakeTimers());
afterEach(() => jest.useRealTimers());

it('결제 금액·연 환산과 결제 정보를 보여준다', async () => {
  await renderDetail('netflix');

  expect(screen.getByText('13,500원')).toBeOnTheScreen();
  expect(screen.getByText('연 환산 162,000원')).toBeOnTheScreen();
  expect(screen.getByText('매월')).toBeOnTheScreen();
  expect(screen.getByText('App Store')).toBeOnTheScreen();
  expect(screen.getByText('2026년 7월 17일')).toBeOnTheScreen();
});

it('다음 결제일은 고른 날짜 다음 결제일이다', async () => {
  await renderDetail('netflix');

  // 11월 17일 결제를 눌렀으니 12월 17일 (그날은 빼고 셈)
  expect(screen.getByText('12월 17일')).toBeOnTheScreen();
});

it('최근 점검이 있으면 점검 결과와 메모를 보여준다', async () => {
  await renderDetail('netflix');

  expect(screen.getByText('10월 3일 점검')).toBeOnTheScreen();
  expect(screen.getByText('유지 추천(92%)')).toBeOnTheScreen();
  expect(screen.getByDisplayValue('시즌 3 공개돼서 이번 달은 유지할 생각임')).toBeOnTheScreen();
});

it('최근 점검이 없으면 점검 영역이 없다', async () => {
  await renderDetail('youtube');

  expect(screen.queryByText('최근 점검')).not.toBeOnTheScreen();
});

it('더보기를 누르면 편집·삭제 메뉴가 보인다', async () => {
  await renderDetail('netflix');
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: '더보기' }));

  expect(screen.getByText('편집')).toBeOnTheScreen();
  expect(screen.getByText('삭제')).toBeOnTheScreen();
});

it('삭제를 누르면 확인 모달이 뜨고, 취소하면 삭제하지 않는다', async () => {
  const onDelete = jest.fn();
  await renderDetail('netflix', onDelete);
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: '더보기' }));
  await user.press(screen.getByText('삭제'));
  // 받침 없는 이름은 '를'
  expect(screen.getByText('넷플릭스를 삭제할까요?')).toBeOnTheScreen();

  await user.press(screen.getByRole('button', { name: '취소' }));
  expect(screen.queryByText('넷플릭스를 삭제할까요?')).not.toBeOnTheScreen();
  expect(onDelete).not.toHaveBeenCalled();
});

it('삭제하기를 누르면 삭제한다', async () => {
  const onDelete = jest.fn();
  await renderDetail('melon', onDelete);
  const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

  await user.press(screen.getByRole('button', { name: '더보기' }));
  await user.press(screen.getByText('삭제'));
  // 받침 있는 이름은 '을'
  expect(screen.getByText('멜론을 삭제할까요?')).toBeOnTheScreen();
  await user.press(screen.getByRole('button', { name: '삭제하기' }));

  expect(onDelete).toHaveBeenCalledTimes(1);
});
