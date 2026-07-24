module.exports = function (api) {
  // Do NOT call api.cache() here — babel-preset-expo handles caching internally,
  // and api.caller() already sets up its own invalidation.
  // Calling api.cache(true/false) alongside api.caller() throws:
  // "Caching has already been configured with .never or .forever()"

  // Expo Metro passes caller.platform = 'web' | 'ios' | 'android'
  const platform = api.caller((caller) => caller?.platform);
  const isNative = platform !== 'web';

  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // crashlytics/babel-plugin is not exported for web — skip it on web builds
      ...(isNative ? ['@react-native-firebase/crashlytics/babel-plugin'] : []),
    ],
  };
};
