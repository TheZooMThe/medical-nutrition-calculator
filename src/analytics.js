import * as Amplitude from '@amplitude/analytics-react-native';

let initialized = false;

export const initAnalytics = async () => {
  if (initialized) return;

  await Amplitude.init(
    '3e15e2e12191f4163b3b04cfcc4aaf8d',
    undefined,
    {
      serverZone: 'EU',
      disableCookies: true
    }
  );

  initialized = true;
  console.log('[Amplitude] initialized');
};

export const logEvent = (eventName, eventProperties = {}) => {
  if (!initialized) {
    console.warn('[Amplitude] not initialized');
    return;
  }

  Amplitude.track(eventName, eventProperties);
};
