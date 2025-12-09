import React from 'react';

import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import { AppText } from '@src/components/ui/Typography/AppText';
import useFinishedCardStyles from './FinishedCard.styles';

type FinishedCardProps = {
    visible: boolean;
};

export const FinishedCard = ({ visible }: FinishedCardProps) => {
    const st = useFinishedCardStyles();

    return (
        <AppearingView visible={visible} style={st.finishedCard}>
            <AppText variant="subtitle" style={st.finishedTitle}>
                Workout complete 🎉
            </AppText>
            <AppText variant="bodySmall" style={st.finishedBody}>
                Nice work. You&apos;ve finished all steps in this workout.
            </AppText>
        </AppearingView>
    );
};

export default FinishedCard;
