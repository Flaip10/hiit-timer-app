import React from 'react';
import { View } from 'react-native';
import { useDotIndicatorStyles } from './DotIndicator.styles';

type DotIndicatorProps = {
    total: number;
    current: number; // 0-based logical index
    color?: string;
    backwards?: boolean;
};

export const DotIndicator = ({
    total,
    current,
    color,
    backwards = false,
}: DotIndicatorProps) => {
    const st = useDotIndicatorStyles();

    if (total <= 0) {
        return null;
    }

    const maxIndex = total - 1;
    const safeCurrent =
        maxIndex >= 0 ? Math.min(Math.max(current, 0), maxIndex) : 0;

    return (
        <View style={st.container}>
            {Array.from({ length: total }).map((_, visualIndex) => {
                // map visual position -> logical index (for backwards mode)
                const logicalIndex = backwards
                    ? total - 1 - visualIndex
                    : visualIndex;

                const isActive = logicalIndex === safeCurrent;
                const isCompleted = logicalIndex < safeCurrent;
                const isFilled = isCompleted || isActive;

                return (
                    <View
                        key={visualIndex}
                        style={[
                            st.dotBase,
                            isFilled && [
                                st.dotFilled,
                                color && {
                                    backgroundColor: color,
                                    borderColor: color,
                                },
                            ],
                            isActive && st.dotActive,
                        ]}
                    />
                );
            })}
        </View>
    );
};
