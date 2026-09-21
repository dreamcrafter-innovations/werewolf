module.exports = function (api) {
  // Do NOT call api.cache(true/false) here — babel-preset-expo handles caching
  // internally and configures it via api.caller().
  //
  // History: this file used to add '@react-native-firebase/crashlytics/babel-plugin'
  // on native. That subpath was removed from @react-native-firebase/crashlytics
  // (it is no longer in the package "exports"), and requiring it made Metro fail
  // with ERR_PACKAGE_PATH_NOT_EXPORTED before a single module was bundled.
  // Crashlytics still works without it: JS errors are reported through
  // recordError() in src/utils/analytics.js.
  api.cache.using(() => process.env.BABEL_ENV || process.env.NODE_ENV || '');
  return {
    presets: ['babel-preset-expo'],
  };
};
