import React, { useCallback, useRef } from 'react';
import { Pressable, type PressableProps } from 'react-native';

export interface GuardedPressableProps extends PressableProps {
    cooldownMs?: number;
    preventDoublePress?: boolean;
}

export const GuardedPressable: React.FC<GuardedPressableProps> = ({
    cooldownMs = 200,
    preventDoublePress = true,
    onPress,
    disabled,
    ...props
}) => {
    const lockRef = useRef(false);

    const handlePress = useCallback(
        async (...args: Parameters<NonNullable<PressableProps['onPress']>>) => {
            if (!onPress) return;
            if (disabled) return;

            // Guard disabled → behave like normal Pressable
            if (!preventDoublePress) {
                onPress(...args);
                return;
            }

            if (lockRef.current) return;

            lockRef.current = true;

            try {
                await onPress(...args);
            } finally {
                setTimeout(() => {
                    lockRef.current = false;
                }, cooldownMs);
            }
        },
        [onPress, disabled, cooldownMs, preventDoublePress]
    );

    return <Pressable {...props} disabled={disabled} onPress={handlePress} />;
};

export default GuardedPressable;
