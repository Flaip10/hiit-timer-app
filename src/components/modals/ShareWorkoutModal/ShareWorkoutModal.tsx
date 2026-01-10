import React, { useRef } from 'react';
import { View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

import { Modal } from '../Modal';
import { Button } from '@src/components/ui/Button/Button';
import {
    ShareWorkoutCard,
    type ShareRunStats,
} from '@src/screens/WorkoutRunScreen/components/ShareWorkoutCard/ShareWorkoutCard';
import type { Workout } from '@src/core/entities/entities';
import { useShareWorkoutModalStyles } from './ShareWorkoutModal.styles';

type ShareWorkoutModalProps = {
    visible: boolean;
    onClose: () => void;
    workout: Workout;
    runStats: ShareRunStats;
};

export const ShareWorkoutModal = ({
    visible,
    onClose,
    workout,
    runStats,
}: ShareWorkoutModalProps) => {
    const shareCardRef = useRef<View | null>(null);
    const st = useShareWorkoutModalStyles();

    const handleConfirmShare = async () => {
        try {
            const node = shareCardRef.current;
            if (!node) return;

            const uri = await captureRef(node, {
                format: 'png',
                quality: 1,
            });

            if (await Sharing.isAvailableAsync()) {
                await Sharing.shareAsync(uri);
            }
        } catch (error) {
            console.warn('Share failed', error);
        }
    };

    return (
        <Modal
            visible={visible}
            onRequestClose={onClose}
            contentStyle={st.content}
            solidBackground
        >
            <ShareWorkoutCard
                workout={workout}
                shareRef={shareCardRef}
                runStats={runStats}
            />

            <View style={st.buttonsRow}>
                <Button
                    title="Cancel"
                    variant="secondary"
                    onPress={onClose}
                    flex={1}
                />

                <Button
                    title="Share"
                    variant="primary"
                    onPress={handleConfirmShare}
                    flex={1}
                />
            </View>
        </Modal>
    );
};
