import React, { useCallback, useRef } from 'react';
import { Pressable, type PressableProps, type View } from 'react-native';

export interface GuardedPressableProps extends PressableProps {
    cooldownMs?: number;
    preventDoublePress?: boolean;
}

export const GuardedPressable = React.forwardRef<View, GuardedPressableProps>(
    (
        {
            cooldownMs = 300,
            preventDoublePress = true,
            onPress,
            disabled,
            ...props
        },
        ref,
    ) => {
        const lockRef = useRef(false);

        const handlePress = useCallback(
            async (
                ...args: Parameters<NonNullable<PressableProps['onPress']>>
            ) => {
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
            [onPress, disabled, cooldownMs, preventDoublePress],
        );

        return (
            <Pressable
                {...props}
                ref={ref}
                disabled={disabled}
                onPress={handlePress}
            />
        );
    },
);

GuardedPressable.displayName = 'GuardedPressable';

export default GuardedPressable;
