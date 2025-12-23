import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@src/components/ui/Typography/AppText';
import type { WorkoutSession } from '@src/core/entities/workoutSession.interfaces';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './SessionListItem.styles';

type Props = {
    session: WorkoutSession;
    onPress: () => void;
};

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const formatDuration = (sec?: number) => {
    const s = Math.max(0, sec ?? 0);
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}:${pad2(ss)}`;
};

export const SessionListItem = ({ session, onPress }: Props) => {
    const st = useStyles();
    const { theme } = useTheme();

    const durationText = useMemo(
        () => formatDuration(session.totalDurationSec),
        [session.totalDurationSec]
    );

    return (
        <MetaCard
            onPress={onPress}
            containerStyle={st.card}
            date={new Date(session.startedAtMs).toISOString()}
            summaryContent={
                <View style={st.row}>
                    <View style={st.left}>
                        <View style={st.titleRow}>
                            <AppText
                                variant="subtitle"
                                style={st.title}
                                numberOfLines={2}
                            >
                                {session.workoutNameSnapshot ?? 'Workout'}
                            </AppText>
                        </View>
                    </View>

                    <View style={st.durationPill}>
                        <Ionicons
                            name="time-outline"
                            size={14}
                            color={theme.palette.text.secondary}
                        />
                        <AppText
                            variant="bodySmall"
                            tone="secondary"
                            style={st.durationText}
                            numberOfLines={1}
                        >
                            {durationText}
                        </AppText>
                    </View>
                </View>
            }
        />
    );
};

export default SessionListItem;
