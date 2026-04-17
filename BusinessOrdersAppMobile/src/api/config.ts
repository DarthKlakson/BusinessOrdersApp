import { Platform } from 'react-native';

const getBaseUrl = (): string => {
  if (__DEV__) {
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:5064/api';
    }

    return 'http://localhost:5064/api';
  }

  return 'https://your-production-api.com/api';
};

export const API_BASE_URL = getBaseUrl();
