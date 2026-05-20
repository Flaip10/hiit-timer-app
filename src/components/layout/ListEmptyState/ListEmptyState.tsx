import React from 'react';
import { View } from 'react-native';

import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';
import { useListEmptyStateStyles } from './ListEmptyState.styles';

interface ListEmptyStateProps {
    actionLabel?: string;
    description: string;
    onPressAction?: () => void;
    title: string;
}

export const ListEmptyState = ({
    actionLabel,
    description,
    onPressAction,
    title,
}: ListEmptyStateProps) => {
    const st = useListEmptyStateStyles();
    const hasAction = !!actionLabel && !!onPressAction;

    return (
        <View style={st.container}>
            <AppText variant="title3">{title}</AppText>

            <AppText
                variant="bodySmall"
                tone="secondary"
                style={st.description}
            >
                {description}
            </AppText>

            {hasAction ? (
                <Button
                    title={actionLabel}
                    variant="primary"
                    onPress={onPressAction}
                    style={st.button}
                />
            ) : null}
        </View>
    );
};
