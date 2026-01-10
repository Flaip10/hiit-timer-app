import RNFS from 'react-native-fs';
import * as Sharing from 'expo-sharing';

import type { Workout } from '@src/core/entities/entities';
import type { ExportedWorkoutFileV1 } from './exportTypes';

export const ARC_WORKOUT_MIME = 'application/vnd.arctimer.workout+json';

export type ExportResult =
    | { ok: true }
    | {
          ok: false;
          error: 'SHARING_UNAVAILABLE' | 'WRITE_FAILED' | 'SHARE_FAILED';
      };

const toFileUri = (path: string): string =>
    path.startsWith('file://') ? path : `file://${path}`;

const sanitizeFilename = (name: string): string => {
    const safe = name
        .replace(/[^\w\s-]/g, '')
        .trim()
        .slice(0, 60);
    return safe.length > 0 ? safe : 'Workout';
};

export const exportWorkoutToFile = async (
    workout: Workout
): Promise<ExportResult> => {
    const payload: ExportedWorkoutFileV1 = {
        version: 1,
        kind: 'arc-timer/workout',
        exportedAt: new Date().toISOString(),
        app: {
            name: 'ARC Timer',
            platform: 'mobile',
        },
        workout,
    };

    const json = JSON.stringify(payload, null, 2);

    const safeName = sanitizeFilename(workout.name);
    const filename = `${safeName}.arcw`;
    const filePath = `${RNFS.TemporaryDirectoryPath}/${filename}`;
    const fileUri = toFileUri(filePath);

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
        await Sharing.shareAsync(fileUri, {
            mimeType: ARC_WORKOUT_MIME,
            dialogTitle: `Share workout "${workout.name}"`,
        });

        return { ok: true };
    } catch (err) {
        console.warn('Share failed', err);
        return { ok: false, error: 'SHARE_FAILED' };
    }
};
