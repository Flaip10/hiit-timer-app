import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type {
    ExerciseDefinition,
    ExerciseDefinitionAvailability,
} from '@src/core/entities/entities';
import { Modal } from '@src/components/modals/Modal';
import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';
import { TextField } from '@src/components/ui/TextField/TextField';
import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { OptionPills } from '@src/screens/SettingsScreen/components/OptionPills';
import {
    useSaveExerciseDefinition,
    isExerciseDefinitionError,
    type UpdateExerciseDefinitionChanges,
} from '@src/data/exerciseDefinitions';
import { CollapseFade } from '@src/components/ui/CollapseFade/CollapseFade';
import { useExerciseDefinitionFormModalStyles } from './ExerciseDefinitionFormModal.styles';

interface ExerciseDefinitionFormModalProps {
    definition?: ExerciseDefinition;
    onClose: () => void;
    visible: boolean;
}

const DEFAULT_AVAILABILITY: ExerciseDefinitionAvailability = 'both';

export const ExerciseDefinitionFormModal = ({
    definition,
    onClose,
    visible,
}: ExerciseDefinitionFormModalProps) => {
    const { t } = useTranslation();
    const st = useExerciseDefinitionFormModalStyles();
    const saveExerciseDefinition = useSaveExerciseDefinition();

    const [name, setName] = useState('');
    const [availability, setAvailability] =
        useState<ExerciseDefinitionAvailability>(DEFAULT_AVAILABILITY);
    const [nameError, setNameError] = useState<string | undefined>();
    const [availabilityError, setAvailabilityError] = useState<
        string | undefined
    >();
    const [saveError, setSaveError] = useState<string | undefined>();

    const isEditing = !!definition;

    const lastAvailabilityErrorRef = useRef<string | undefined>(undefined);
    if (availabilityError) {
        lastAvailabilityErrorRef.current = availabilityError;
    }

    useEffect(() => {
        if (!visible) return;

        setName(definition?.name ?? '');
        setAvailability(definition?.availability ?? DEFAULT_AVAILABILITY);
        setNameError(undefined);
        setAvailabilityError(undefined);
        setSaveError(undefined);
    }, [definition, visible]);

    const availabilityOptions = useMemo(
        () => [
            {
                value: 'both' as const,
                label: t('exerciseDefinitions.availability.both'),
            },
            {
                value: 'workout' as const,
                label: t('exerciseDefinitions.availability.workout'),
            },
            {
                value: 'gym' as const,
                label: t('exerciseDefinitions.availability.gym'),
            },
        ],
        [t],
    );

    const handleSave = async () => {
        const trimmedName = name.trim();
        setSaveError(undefined);
        if (!trimmedName) {
            setNameError(t('exerciseDefinitions.validation.nameRequired'));
            return;
        }

        try {
            if (definition) {
                const changes: UpdateExerciseDefinitionChanges = {};

                if (trimmedName !== definition.name) {
                    changes.name = trimmedName;
                }

                if (availability !== definition.availability) {
                    changes.availability = availability;
                }

                if (Object.keys(changes).length > 0) {
                    await saveExerciseDefinition.mutateAsync({
                        changes,
                        id: definition.id,
                        intent: 'update',
                    });
                }

                onClose();
                return;
            }

            await saveExerciseDefinition.mutateAsync({
                availability,
                intent: 'create',
                name: trimmedName,
            });
            onClose();
        } catch (e) {
            if (isExerciseDefinitionError(e)) {
                switch (e.code) {
                    case 'DUPLICATE_NAME':
                        setNameError(
                            t('exerciseDefinitions.validation.duplicateName'),
                        );
                        return;
                    case 'GYM_ONLY_RESTRICTED':
                        setAvailabilityError(
                            t(
                                'exerciseDefinitions.validation.gymOnlyRestricted',
                            ),
                        );
                        return;
                    case 'DELETE_REFERENCED':
                    case 'DELETE_SYSTEM_FORBIDDEN':
                    case 'MERGE_GYM_ONLY_CONFLICT':
                        setSaveError(
                            t('exerciseDefinitions.validation.saveFailed'),
                        );
                        return;
                }
            }
            setSaveError(t('exerciseDefinitions.validation.saveFailed'));
        }
    };

    return (
        <Modal
            visible={visible}
            onRequestClose={onClose}
            containerStyle={st.modalContainer}
            contentStyle={st.modalContent}
        >
            <View style={st.mainContainer}>
                <View style={st.textContainer}>
                    <AppText variant="title3" tone="primary">
                        {isEditing
                            ? t('exerciseDefinitions.modal.editTitle')
                            : t('exerciseDefinitions.modal.createTitle')}
                    </AppText>

                    <AppText variant="bodySmall" tone="muted">
                        {t('exerciseDefinitions.modal.subtitle')}
                    </AppText>
                </View>

                <View style={st.formContainer}>
                    <TextField
                        label={t('exerciseDefinitions.fields.name')}
                        value={name}
                        onChangeText={(value) => {
                            setName(value);
                            setNameError(undefined);
                            setSaveError(undefined);
                        }}
                        placeholder={t(
                            'exerciseDefinitions.fields.namePlaceholder',
                        )}
                        autoCapitalize="words"
                        returnKeyType="done"
                        errorText={nameError}
                    />

                    <View style={st.availabilityContainer}>
                        <AppText variant="bodySmall" tone="secondary">
                            {t('exerciseDefinitions.fields.availability')}
                        </AppText>
                        <OptionPills
                            options={availabilityOptions}
                            selectedValue={availability}
                            onSelect={(value) => {
                                setAvailability(value);
                                setAvailabilityError(undefined);
                                setSaveError(undefined);
                            }}
                        />
                        <CollapseFade visible={!!availabilityError}>
                            <AppText variant="caption" tone="error">
                                {lastAvailabilityErrorRef.current}
                            </AppText>
                        </CollapseFade>
                    </View>

                    {!!saveError && (
                        <AppText
                            variant="caption"
                            tone="error"
                            style={st.saveError}
                        >
                            {saveError}
                        </AppText>
                    )}
                </View>

                <View style={st.buttonsContainer}>
                    <Button
                        title={
                            isEditing
                                ? t('exerciseDefinitions.modal.save')
                                : t('exerciseDefinitions.modal.create')
                        }
                        variant="primary"
                        onPress={handleSave}
                        loading={saveExerciseDefinition.isPending}
                    />

                    <GuardedPressable onPress={onClose} style={st.cancelButton}>
                        <AppText variant="bodySmall" tone="muted">
                            {t('common.actions.cancel')}
                        </AppText>
                    </GuardedPressable>
                </View>
            </View>
        </Modal>
    );
};
