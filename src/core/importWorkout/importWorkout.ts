import * as DocumentPicker from 'expo-document-picker';
import RNFS from 'react-native-fs';
import type { ExportedWorkoutFileV1 } from '../exportWorkout/exportTypes';

export const importWorkoutFromFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
        type: ['*/*'], // keep generic while debugging
        copyToCacheDirectory: true,
    });

    console.log('DocumentPicker result:', JSON.stringify(result, null, 2));

    if (result.canceled || !result.assets?.[0]) {
        return null;
    }

    const asset = result.assets[0];
    console.log('Picked asset:', asset);

    // IMPORTANT: On iOS, asset.uri is already a proper file:// URI.
    // RNFS expects a *path*, not a file:// URL.
    // On Android, sometimes you get a content:// URI instead, which RNFS cannot read directly.

    let path = asset.uri;

    if (path.startsWith('file://')) {
        path = path.replace('file://', '');
    }

    console.log('Reading path:', path);

    const contents = await RNFS.readFile(path, 'utf8');

    const parsed = JSON.parse(contents) as ExportedWorkoutFileV1;

    if (parsed.kind !== 'hiit-timer/workout') {
        throw new Error('Invalid workout file');
    }

    return parsed.workout;
};
