import type { ExpoConfig } from 'expo/config';

const VARIANTS = ['development', 'preview', 'production'] as const;
type Variant = (typeof VARIANTS)[number];

const rawVariant = process.env.APP_VARIANT ?? 'production';
if (!VARIANTS.includes(rawVariant as Variant)) {
    throw new Error(
        `[app.config] Invalid APP_VARIANT="${rawVariant}". Expected one of: ${VARIANTS.join(', ')}.`,
    );
}
const variant = rawVariant as Variant;

type AndroidConfig = NonNullable<ExpoConfig['android']> & {
    predictiveBackGestureEnabled?: boolean;
};
type Config = Omit<ExpoConfig, 'android'> & {
    android: AndroidConfig;
    newArchEnabled?: boolean;
};

const baseId = 'dev.filipemendes.arctimer';
const bundleId =
    variant === 'development'
        ? `${baseId}.dev`
        : variant === 'preview'
          ? `${baseId}.preview`
          : baseId;

const name =
    variant === 'development'
        ? 'Arc Timer (Dev)'
        : variant === 'preview'
          ? 'Arc Timer (Preview)'
          : 'Arc Timer';

const scheme =
    variant === 'development'
        ? 'arctimer-dev'
        : variant === 'preview'
          ? 'arctimer-preview'
          : 'arctimer';

const config: Config = {
    name,
    slug: 'arc-timer',
    version: '1.0.1',
    orientation: 'portrait',
    icon: './assets/generated/classic/icon-light.png',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    scheme,
    ios: {
        icon: {
            light: './assets/generated/classic/icon-light.png',
            dark: './assets/generated/classic/icon-dark.png',
            tinted: './assets/generated/classic/icon-tinted.png',
        },
        bundleIdentifier: bundleId,
        buildNumber: '2',
        supportsTablet: false,
        infoPlist: {
            ITSAppUsesNonExemptEncryption: false,
        },
    },
    android: {
        icon: './assets/generated/classic/icon-light.png',
        package: bundleId,
        versionCode: 2,
        adaptiveIcon: {
            foregroundImage:
                './assets/generated/classic/adaptive-foreground.png',
            monochromeImage:
                './assets/generated/classic/adaptive-monochrome.png',
            backgroundColor: '#ffffff',
        },
        blockedPermissions: [
            'android.permission.RECORD_AUDIO',
            'android.permission.SYSTEM_ALERT_WINDOW',
        ],
        predictiveBackGestureEnabled: false,
    },
    web: {
        favicon: './assets/favicon.png',
    },
    plugins: [
        'expo-router',
        [
            'expo-audio',
            { microphonePermission: false, recordAudioAndroid: false },
        ],
        'expo-font',
        'expo-localization',
        'expo-asset',
        [
            'expo-splash-screen',
            {
                image: './assets/generated/classic/splash-light.png',
                imageWidth: 200,
                resizeMode: 'contain',
                backgroundColor: '#F6F3EB',
                dark: {
                    image: './assets/generated/classic/splash-dark.png',
                    backgroundColor: '#000000',
                },
            },
        ],
        'expo-sqlite',
    ],
};

export default config;
