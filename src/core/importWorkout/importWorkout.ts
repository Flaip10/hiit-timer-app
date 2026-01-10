import * as DocumentPicker from 'expo-document-picker';
import RNFS from 'react-native-fs';

import type { Workout } from '../entities/entities';
import {
    ARC_WORKOUT_EXTENSION,
    ARC_WORKOUT_KIND,
    type ExportedWorkoutFileV1,
} from '../exportWorkout/exportTypes';

export type ImportResult =
    | { ok: true; workout: Workout }
    | {
          ok: false;
          error:
              | 'CANCELLED'
              | 'READ_FAILED'
              | 'PARSE_FAILED'
              | 'INVALID_EXTENSION'
              | 'INVALID_KIND'
              | 'INVALID_SHAPE';
      };

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null;

const isExportedWorkoutFileV1 = (
    value: unknown
): value is ExportedWorkoutFileV1 => {
    if (!isRecord(value)) return false;

    if (value.version !== 1) return false;
    if (value.kind !== ARC_WORKOUT_KIND) return false;
    if (typeof value.exportedAt !== 'string') return false;

    if (!isRecord(value.app)) return false;
    if (typeof value.app.name !== 'string') return false;
    if (value.app.platform !== 'mobile') return false;

    if (!isRecord(value.workout)) return false;

    return true;
};

export const importWorkoutFromFile = async (): Promise<ImportResult> => {
    const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true,
    });

    if (result.canceled) {
        return { ok: false, error: 'CANCELLED' };
    }

    const asset = result.assets[0];

    const fileName = asset.name;
    if (!fileName.toLowerCase().endsWith(ARC_WORKOUT_EXTENSION)) {
        return { ok: false, error: 'INVALID_EXTENSION' };
    }

    let path = asset.uri;
    if (path.startsWith('file://')) {
        path = path.slice('file://'.length);
    }

    let contents: string;
    try {
        contents = await RNFS.readFile(path, 'utf8');
    } catch (err) {
        console.warn('READ_FAILED', err);
        return { ok: false, error: 'READ_FAILED' };
    }

    let parsedUnknown: unknown;
    try {
        parsedUnknown = JSON.parse(contents) as unknown;
    } catch (err) {
        console.warn('PARSE_FAILED', err);
        return { ok: false, error: 'PARSE_FAILED' };
    }

    if (isRecord(parsedUnknown) && 'kind' in parsedUnknown) {
        if (parsedUnknown.kind !== ARC_WORKOUT_KIND) {
            console.warn('INVALID_KIND', parsedUnknown.kind);
            return { ok: false, error: 'INVALID_KIND' };
        }
    }

    if (!isExportedWorkoutFileV1(parsedUnknown)) {
        console.warn('INVALID_SHAPE', parsedUnknown);
        return { ok: false, error: 'INVALID_SHAPE' };
    }

    return { ok: true, workout: parsedUnknown.workout };
};
