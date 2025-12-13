import React from 'react';
import { View } from 'react-native';
import { AppText } from '@src/components/ui/Typography/AppText';
import useFinishedCardStyles from './FinishedCard.styles';

export const FinishedCard = () => {
    const st = useFinishedCardStyles();

    return (
        <View style={st.finishedCard}>
            <AppText variant="subtitle" style={st.finishedTitle}>
                Workout complete 🎉
            </AppText>
            <AppText variant="bodySmall" style={st.finishedBody}>
                Nice work. You&apos;ve finished all steps in this workout.
            </AppText>
        </View>
    );
};

export default FinishedCard;
