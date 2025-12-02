import RNFS from 'react-native-fs';
import * as Sharing from 'expo-sharing';
import type { Workout } from '@src/core/entities';
import { ExportedWorkoutFileV1 } from '../exportWorkout/exportTypes';

export const HIIT_WORKOUT_MIME = 'application/vnd.hiittimer.workout+json';

export const exportWorkoutToFile = async (workout: Workout) => {
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

    await RNFS.writeFile(filePath, json, 'utf8');

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
        console.warn('Sharing is not available on this device');
        return;
    }

    await Sharing.shareAsync(filePath, {
        mimeType: HIIT_WORKOUT_MIME,
        dialogTitle: `Share workout "${workout.name}"`,
    });
};
