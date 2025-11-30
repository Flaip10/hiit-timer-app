import React from 'react';
import { Text } from 'react-native';

import st from './FinishedCard.styles';
import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';

type FinishedCardProps = {
    visible: boolean;
};

export const FinishedCard = ({ visible }: FinishedCardProps) => {
    return (
        <AppearingView visible={visible} style={st.finishedCard}>
            <Text style={st.finishedTitle}>Workout complete 🎉</Text>
            <Text style={st.finishedBody}>
                Nice work. You&apos;ve finished all steps in this workout.
            </Text>
        </AppearingView>
    );
};
