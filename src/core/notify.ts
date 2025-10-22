import * as Notifications from 'expo-notifications';
import type { NotificationBehavior } from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async (): Promise<NotificationBehavior> => ({
        // iOS foreground presentation options:
        shouldShowBanner: true, // show banner while app is in foreground
        shouldShowList: true, // show in Notification Center list
        shouldPlaySound: false,
        shouldSetBadge: false,
    }),
});

// Android: make sure the channel importance is HIGH so banners appear.
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

export const scheduleLocal = async (
    secondsFromNow: number,
    title: string,
    body?: string
): Promise<string> => {
    return Notifications.scheduleNotificationAsync({
        content: { title, body },
        trigger: { seconds: Math.max(1, secondsFromNow), channelId: 'workout' },
    });
};

export const cancelById = async (id: string): Promise<void> =>
    Notifications.cancelScheduledNotificationAsync(id);

export const cancelAll = async (): Promise<void> =>
    Notifications.cancelAllScheduledNotificationsAsync();
