import React, { useMemo } from 'react';
import { View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@src/components/ui/Typography/AppText';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import type { WorkoutSession } from '@src/core/entities/workoutSession.interfaces';
import { MetaCard } from '@src/components/ui/MetaCard/MetaCard';
import { useTheme } from '@src/theme/ThemeProvider';

import { useStyles } from './SessionListItem.styles';

interface Props {
    session: WorkoutSession;
    onPress: () => void;
    isSelectMode?: boolean;
    isSelected?: boolean;
    onSelect?: () => void;
}

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

const formatDuration = (sec?: number) => {
    const s = Math.max(0, sec ?? 0);
    const mm = Math.floor(s / 60);
    const ss = s % 60;
    return `${mm}:${pad2(ss)}`;
};

const SessionListItem = ({
    session,
    onPress,
    isSelectMode = false,
    isSelected = false,
    onSelect,
}: Props) => {
    const st = useStyles();
    const { theme } = useTheme();

    const durationText = useMemo(
        () => formatDuration(session.totalDurationSec),
        [session.totalDurationSec],
    );

    const selectionIcon = isSelectMode ? (
        <AppIcon
            id={isSelected ? 'checkmarkCircle' : 'radioButtonOff'}
            size={22}
            color={
                isSelected
                    ? theme.palette.accent.primary
                    : theme.palette.text.secondary
            }
        />
    ) : null;

    return (
        <MetaCard
            onPress={isSelectMode ? onSelect : onPress}
            containerStyle={st.card}
            showSelectionOutline={isSelected}
            date={new Date(session.startedAtMs).toISOString()}
            summaryContent={
                <View style={st.row}>
                    <View style={st.left}>
                        <View style={st.titleRow}>
                            {selectionIcon}
                            <AppText
                                variant="subtitle"
                                style={st.title}
                                numberOfLines={2}
                            >
                                {session.workoutSnapshot.name}
                            </AppText>
                        </View>
                    </View>

                    <View style={st.durationPill}>
                        <Ionicons
                            name="time-outline"
                            size={14}
                            color={theme.palette.metaCard.datePill.icon}
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
