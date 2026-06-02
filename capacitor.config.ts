import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'SmileLife',
  webDir: 'www',
  plugins: {
    LiveUpdates: {
      appId: '3299359a',
      channel: 'Production',
      autoUpdateMethod: 'background'
    }
  }
};

export default config;
