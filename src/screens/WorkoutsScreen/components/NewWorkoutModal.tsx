import React from 'react';
import { Pressable, View } from 'react-native';
import { useRouter } from 'expo-router';

import { Modal } from '@src/components/modals/Modal';
import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';
import { useNewWorkoutModalStyles } from './NewWorkoutModal.styles';

type NewWorkoutModalProps = {
    visible: boolean;
    closeModal: () => void;
    handleImportFromFile: () => Promise<void>;
};

const NewWorkoutModal = ({
    visible,
    closeModal,
    handleImportFromFile,
}: NewWorkoutModalProps) => {
    const router = useRouter();
    const st = useNewWorkoutModalStyles();

    const handleCreateNew = () => {
        closeModal();
        router.push('/workouts/edit');
    };

    const handleImport = async () => {
        await handleImportFromFile();
    };

    return (
        <Modal visible={visible} onRequestClose={closeModal}>
            <View style={st.mainContainer}>
                <View style={st.textContainer}>
                    <AppText variant="title3" tone="primary">
                        New workout
                    </AppText>

                    <AppText variant="bodySmall" tone="muted">
                        Choose how you want to start:
                    </AppText>
                </View>

                <View style={st.buttonsContainer}>
                    <Button
                        title="Create new"
                        variant="primary"
                        onPress={handleCreateNew}
                    />

                    <Button
                        title="Import from file"
                        variant="secondary"
                        onPress={handleImport}
                    />

                    <Pressable onPress={closeModal} style={st.cancelButton}>
                        <AppText variant="bodySmall" tone="muted">
                            Cancel
                        </AppText>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

export default NewWorkoutModal;
