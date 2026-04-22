import type { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId: 'com.occalisthenics.app',
  appName: 'OC-CLUB',
  webDir: 'dist',
  android: {
    path: 'mobile/android',
  },
  ios: {
    path: 'mobile/ios',
  },
  server: {
    androidScheme: 'https',
    iosScheme: 'https',
  },
}

export default config

