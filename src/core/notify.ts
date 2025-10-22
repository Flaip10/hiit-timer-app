import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { NotificationBehavior } from 'expo-notifications';

// Foreground behavior (what happens when a notification fires while the app is in foreground)
Notifications.setNotificationHandler({
    handleNotification: async (): Promise<NotificationBehavior> => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        // iOS extras (required by types in recent SDKs)
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// Android: ensure a channel exists (called once on app start)
export const ensureAndroidChannel = async (): Promise<void> => {
    if (Platform.OS !== 'android') return;
    await Notifications.setNotificationChannelAsync('workout', {
        name: 'Workout',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [150, 100, 150],
        lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
    });
};

export const requestPermissions = async (): Promise<boolean> => {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
};

// NOTE: scheduleNotificationAsync does NOT accept a fixed identifier field.
// It RETURNS an identifier. Don’t pass { identifier: ... } in.
export const scheduleLocal = async (
    secondsFromNow: number,
    title: string,
    body?: string
): Promise<string> => {
    const id = await Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: { seconds: Math.max(1, secondsFromNow), channelId: 'workout' },
    });
    return id;
};

export const cancelById = async (id: string): Promise<void> =>
    Notifications.cancelScheduledNotificationAsync(id);

export const cancelAll = async (): Promise<void> =>
    Notifications.cancelAllScheduledNotificationsAsync();
