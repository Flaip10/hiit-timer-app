import React, { useState } from 'react';
import { Pressable, View, type LayoutChangeEvent } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import { Watermark } from '@src/components/ui/Watermark/Watermark';
import { useStyles } from './HomeActionTile.styles';

export type HomeActionTileProps = {
    title: string;
    subtitle?: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    variant?: 'primary' | 'secondary';
    onPress: () => void;
};

export const HomeActionTile = ({
    title,
    subtitle,
    icon,
    variant = 'secondary',
    onPress,
}: HomeActionTileProps) => {
    const { theme } = useTheme();
    const st = useStyles({ variant });
    const [tileHeight, setTileHeight] = useState<number | null>(null);

    const handleLayout = (event: LayoutChangeEvent) => {
        const { height } = event.nativeEvent.layout;
        setTileHeight(height);
    };

    // Watermark size is proportional to tile height
    const watermarkSize = tileHeight ? tileHeight * 0.9 : undefined;

    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [st.root, pressed && st.pressed]}
            onLayout={handleLayout}
        >
            {variant === 'secondary' && watermarkSize && (
                <Watermark
                    watermarkMode="medium"
                    watermarkSize={watermarkSize}
                    watermarkPosition="bottom-right"
                    offsetY={0.05}
                    offsetX={0.05}
                    sizeScale={0.9}
                />
            )}
            <Ionicons
                name={icon}
                size={variant === 'primary' ? 26 : 22}
                color={
                    variant === 'primary'
                        ? theme.palette.text.inverted
                        : theme.palette.text.primary
                }
            />

            <View style={st.textBlock}>
                <AppText
                    variant={variant === 'primary' ? 'title3' : 'body'}
                    style={st.title}
                >
                    {title}
                </AppText>

                {subtitle ? (
                    <AppText variant="bodySmall" tone="inverted">
                        {subtitle}
                    </AppText>
                ) : null}
            </View>
        </Pressable>
    );
};
