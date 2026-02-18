import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { Modal } from '@src/components/modals/Modal';
import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';
import { useNewWorkoutModalStyles } from './NewWorkoutModal.styles';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
        <Modal
            visible={visible}
            onRequestClose={closeModal}
            containerStyle={st.modalContainer}
            contentStyle={st.modalContent}
        >
            <View style={st.mainContainer}>
                <View style={st.textContainer}>
                    <AppText variant="title3" tone="primary">
                        {t('workouts.modal.title')}
                    </AppText>

                    <AppText variant="bodySmall" tone="muted">
                        {t('workouts.modal.subtitle')}
                    </AppText>
                </View>

                <View style={st.buttonsContainer}>
                    <Button
                        title={t('workouts.modal.createNew')}
                        variant="primary"
                        onPress={handleCreateNew}
                    />

                    <Button
                        title={t('workouts.modal.importFromFile')}
                        variant="secondary"
                        onPress={handleImport}
                    />

                    <GuardedPressable
                        onPress={closeModal}
                        style={st.cancelButton}
                    >
                        <AppText variant="bodySmall" tone="muted">
                            {t('workouts.modal.cancel')}
                        </AppText>
                    </GuardedPressable>
                </View>
            </View>
        </Modal>
    );
};

export default NewWorkoutModal;
