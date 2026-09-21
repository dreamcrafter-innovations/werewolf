// Dynamic wrapper around app.json.
//
// Why: google-services.json and GoogleService-Info.plist are (correctly) git-ignored, so
// an EAS cloud build never sees a file path hard-coded in app.json. EAS supplies secret
// files as "file" environment variables whose value is the path of the uploaded file, so we
// read those first and fall back to a local file for `eas build --local` / dev.
//
// The Firebase config plugins throw at prebuild if their file is missing, so they are only
// registered for a platform whose file is actually available. A production build with no
// Firebase files at all fails here with a clear message instead of deep inside Gradle.
const fs = require('fs');

const FIREBASE_PLUGINS = ['@react-native-firebase/app', '@react-native-firebase/crashlytics'];

function pick(envName, localPath) {
  const fromEnv = process.env[envName];
  if (fromEnv) return fromEnv;
  return fs.existsSync(localPath) ? localPath : undefined;
}

module.exports = ({ config }) => {
  const androidFile = pick('GOOGLE_SERVICES_JSON', './google-services.json');
  const iosFile = pick('GOOGLE_SERVICE_INFO_PLIST', './GoogleService-Info.plist');
  const hasFirebase = Boolean(androidFile || iosFile);

  if (!hasFirebase && process.env.EAS_BUILD_PROFILE === 'production') {
    throw new Error(
      'Nightfall production build needs Firebase config: set the GOOGLE_SERVICES_JSON and ' +
        'GOOGLE_SERVICE_INFO_PLIST EAS file environment variables (or place the files in the ' +
        'project root). To ship without Firebase instead, remove the Firebase plugins and ' +
        '@react-native-firebase/* dependencies.',
    );
  }

  const plugins = (config.plugins || []).filter((p) => !FIREBASE_PLUGINS.includes(Array.isArray(p) ? p[0] : p));
  if (hasFirebase) plugins.unshift(...FIREBASE_PLUGINS);

  return {
    ...config,
    ios: {
      ...config.ios,
      googleServicesFile: iosFile,
      // Only standard/exempt encryption (HTTPS via Firebase). Avoids the export-compliance
      // prompt on every App Store Connect upload. Owner: confirm this declaration is accurate.
      infoPlist: { ...(config.ios && config.ios.infoPlist), ITSAppUsesNonExemptEncryption: false },
    },
    android: { ...config.android, googleServicesFile: androidFile },
    plugins,
  };
};
