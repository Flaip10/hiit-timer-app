import RNFS from 'react-native-fs';
import * as Sharing from 'expo-sharing';
import type { Workout } from '@src/core/entities';
import { ExportedWorkoutFileV1 } from '../exportWorkout/exportTypes';

export const HIIT_WORKOUT_MIME = 'application/vnd.hiittimer.workout+json';

export type ExportResult =
    | { ok: true }
    | {
          ok: false;
          error: 'SHARING_UNAVAILABLE' | 'WRITE_FAILED' | 'SHARE_FAILED';
      };

export const exportWorkoutToFile = async (
    workout: Workout
): Promise<ExportResult> => {
    const payload: ExportedWorkoutFileV1 = {
        version: 1,
        kind: 'hiit-timer/workout',
        exportedAt: new Date().toISOString(),
        app: {
            name: 'HIIT Timer',
            platform: 'mobile',
        },
        workout,
    };

    const json = JSON.stringify(payload, null, 2);
    const safeName = workout.name.replace(/[^\w\s-]/g, '').trim() || 'Workout';
    const filename = `${safeName}.hitw`;
    const filePath = `${RNFS.TemporaryDirectoryPath}/${filename}`;

    try {
        await RNFS.writeFile(filePath, json, 'utf8');
    } catch (err) {
        console.warn('Export write failed', err);
        return { ok: false, error: 'WRITE_FAILED' };
    }

    let canShare = false;
    try {
        canShare = await Sharing.isAvailableAsync();
    } catch (err) {
        console.warn('Sharing availability check failed', err);
        return { ok: false, error: 'SHARING_UNAVAILABLE' };
    }

    if (!canShare) {
        return { ok: false, error: 'SHARING_UNAVAILABLE' };
    }

    try {
        await Sharing.shareAsync(filePath, {
            mimeType: HIIT_WORKOUT_MIME,
            dialogTitle: `Share workout "${workout.name}"`,
        });

        return { ok: true };
    } catch (err) {
        console.warn('Share failed', err);
        return { ok: false, error: 'SHARE_FAILED' };
    }
};
