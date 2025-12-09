import React from 'react';
import { View } from 'react-native';
import { Feather } from '@expo/vector-icons';

import { AppearingView } from '@src/components/ui/AppearingView/AppearingView';
import { AppText } from '@src/components/ui/Typography/AppText';
import { WorkoutMetaStrip } from '../WorkoutMetaStrip/WorkoutMetaStrip';
import useWorkoutRunStyles from '../../WorkoutRunScreen.styles';
import { useTheme } from '@src/theme/ThemeProvider';
import { formatDuration, formatDurationVerbose } from '../../helpers';

type RunTopSectionProps = {
    workoutName: string;
    isFinished: boolean;
    remainingWorkoutSec: number;
    totalWorkoutPlannedSec: number;
    phaseColor: string;
    stepBlockIdx: number;
    currentBlockTitle?: string | null;
    currentSetIndex: number;
    totalSets: number;
    setProgress: number;
    isBlockPause: boolean;
};

export const RunTopSection = ({
    workoutName,
    isFinished,
    remainingWorkoutSec,
    totalWorkoutPlannedSec,
    phaseColor,
    stepBlockIdx,
    currentBlockTitle,
    currentSetIndex,
    totalSets,
    setProgress,
    isBlockPause,
}: RunTopSectionProps) => {
    const st = useWorkoutRunStyles();
    const { theme } = useTheme();

    return (
        <View style={st.topRegion}>
            <AppearingView
                visible={!isFinished}
                style={st.pageHeader}
                offsetY={0}
                offsetX={-12}
            >
                {/* Running header */}
                <View style={st.pageHeaderInfoContainer}>
                    <AppText
                        variant="title1"
                        style={st.runWorkoutTitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {workoutName}
                    </AppText>

                    <View style={st.workoutTimerContainer}>
                        <Feather
                            name="clock"
                            size={16}
                            color={theme.palette.text.primary}
                            style={st.workoutTimerIcon}
                        />
                        <AppText variant="title3" style={st.workoutTimerText}>
                            {formatDuration(remainingWorkoutSec)}
                        </AppText>
                    </View>
                </View>

                {/* Meta strip only while running and not in block pause */}
                {!isBlockPause && (
                    <WorkoutMetaStrip
                        blockIndex={stepBlockIdx}
                        blockTitle={currentBlockTitle ?? undefined}
                        currentSetIndex={currentSetIndex}
                        totalSets={totalSets}
                        setProgress={setProgress}
                        phaseColor={phaseColor}
                    />
                )}
            </AppearingView>

            <AppearingView
                visible={isFinished}
                style={st.pageHeader}
                offsetY={0}
                offsetX={-12}
                delay={260}
            >
                <View>
                    <AppText variant="title1" style={st.finishedTitle}>
                        Workout complete
                    </AppText>

                    <AppText
                        variant="bodySmall"
                        style={st.finishedSubtitle}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                    >
                        {workoutName}
                    </AppText>
                </View>

                <View style={st.finishedDurationPillContainer}>
                    <View style={st.finishedDurationPill}>
                        <Feather
                            name="clock"
                            size={16}
                            color={theme.palette.text.primary}
                            style={st.workoutTimerIcon}
                        />

                        <AppText
                            variant="subtitle"
                            style={st.finishedDurationText}
                        >
                            {formatDurationVerbose(totalWorkoutPlannedSec)}
                        </AppText>
                    </View>
                </View>
            </AppearingView>
        </View>
    );
};
