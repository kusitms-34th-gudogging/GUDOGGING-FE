import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { userEvent } from '@testing-library/react-native';
import { renderRouter, screen } from 'expo-router/testing-library';

import { mockGmailAuthCode } from '@/lib/testing';
import { RegisterGmailGuideScreen } from '@/screens/register/RegisterGmailGuideScreen';

const renderGuide = () =>
  renderRouter(
    {
      'register/gmail': () => <RegisterGmailGuideScreen />,
      'register/analyze': () => null,
      'register/failed': () => null,
    },
    { initialUrl: '/register/gmail' },
  );
const connect = () => userEvent.press(screen.getByRole('button', { name: 'Gmail 연동하기' }));

afterEach(() => jest.restoreAllMocks());

it('Google 계정을 고르면 받은 인증 코드로 결제 메일 확인(A-12)으로 간다', async () => {
  mockGmailAuthCode('google-auth-code');
  await renderGuide();

  await connect();

  expect(screen).toHavePathname('/register/analyze');
  expect(screen).toHaveSearchParams({ source: 'gmail', authCode: 'google-auth-code' });
});

it('계정 선택·권한 동의를 취소하면 이 화면에 그대로 있다', async () => {
  mockGmailAuthCode(null);
  await renderGuide();

  await connect();

  expect(screen).toHavePathname('/register/gmail');
});

it('인증 코드를 받지 못하면 분석 실패(A-12e)로 간다', async () => {
  jest.mocked(GoogleSignin.signIn).mockRejectedValue(new Error('PLAY_SERVICES'));
  await renderGuide();

  await connect();

  expect(screen).toHavePathname('/register/failed');
  expect(screen).toHaveSearchParams({ source: 'gmail' });
});
