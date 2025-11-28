import React from 'react';
import { View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';
import st from './ShareWorkoutCard.styles';

type ShareWorkoutCardProps = {
    workoutName: string;
    durationLabel: string; // e.g. "3 min 20 s"
    completedLabel: string; // e.g. "Today • 18:10"
    phaseColor: string;
};

export const ShareWorkoutCard = ({
    workoutName,
    durationLabel,
    completedLabel,
    phaseColor,
}: ShareWorkoutCardProps) => {
    return (
        <View style={st.cardContainer}>
            {/* Header */}
            <View style={st.cardHeaderRow}>
                <Text style={st.cardAppName}>HIIT Timer</Text>

                <View style={st.cardDurationPill}>
                    <Feather
                        name="clock"
                        size={14}
                        color="#E5E7EB"
                        style={st.cardDurationIcon}
                    />
                    <Text style={st.cardDurationText}>{durationLabel}</Text>
                </View>
            </View>

            {/* Title + workout name */}
            <View style={st.cardTitleBlock}>
                <Text style={st.cardTitle}>Workout complete</Text>
                <Text
                    style={st.cardSubtitle}
                    numberOfLines={1}
                    ellipsizeMode="tail"
                >
                    {workoutName}
                </Text>
            </View>

            {/* Central circle – can swap for SVG arc later */}
            <View style={st.cardArcWrapper}>
                <View
                    style={[st.cardArcCircleOuter, { borderColor: phaseColor }]}
                >
                    <Text style={st.cardArcInnerText}>DONE</Text>
                </View>
            </View>

            {/* Footer row */}
            <View style={st.cardFooterRow}>
                <Text style={st.cardFooterLeft}>{completedLabel}</Text>
                <Text style={st.cardFooterRight}>hiit-timer.app</Text>
            </View>
        </View>
    );
};
