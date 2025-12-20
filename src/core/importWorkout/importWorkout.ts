import * as DocumentPicker from 'expo-document-picker';
import RNFS from 'react-native-fs';
import type { ExportedWorkoutFileV1 } from '../exportWorkout/exportTypes';
import type { Workout } from '../entities/entities';

export type ImportResult =
    | { ok: true; workout: Workout }
    | {
          ok: false;
          error: 'CANCELLED' | 'READ_FAILED' | 'PARSE_FAILED' | 'INVALID_KIND';
      };

export const importWorkoutFromFile = async (): Promise<ImportResult> => {
    const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'], // you can narrow this later
        copyToCacheDirectory: true,
    });

    // User cancelled or nothing picked
    if (result.canceled || !result.assets?.[0]) {
        return { ok: false, error: 'CANCELLED' };
    }

    const asset = result.assets[0];

    // User picked invalid file
    if (!asset.name?.toLowerCase().endsWith('.hitw')) {
        return { ok: false, error: 'INVALID_KIND' };
    }

    // Convert file:// URI → path for RNFS
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

    let parsed: ExportedWorkoutFileV1;
    try {
        parsed = JSON.parse(contents) as ExportedWorkoutFileV1;
    } catch (err) {
        console.warn('PARSE_FAILED', err);
        return { ok: false, error: 'PARSE_FAILED' };
    }

    if (parsed.kind !== 'hiit-timer/workout') {
        console.warn('INVALID_KIND', parsed.kind);
        return { ok: false, error: 'INVALID_KIND' };
    }

    return { ok: true, workout: parsed.workout };
};
