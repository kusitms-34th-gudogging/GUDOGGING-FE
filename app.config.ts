import type { ConfigContext, ExpoConfig } from 'expo/config';

// GoogleService-Info.plist는 공개 레포라 커밋하지 않음 (.claude/docs/deploy.md)
// EAS 빌드는 EAS 파일 환경변수가 준 경로, 로컬·CI(지문 계산)는 루트에 둔 파일
export default ({ config }: ConfigContext) =>
  ({
    ...config,
    ios: {
      ...config.ios,
      googleServicesFile: process.env.GOOGLE_SERVICES_PLIST ?? './GoogleService-Info.plist',
    },
  }) as ExpoConfig;
