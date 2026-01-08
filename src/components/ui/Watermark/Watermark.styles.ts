import { StyleSheet } from 'react-native';
import { createStyles } from '@src/theme/createStyles';
import type { AppTheme } from '@src/theme/theme';
import type { WatermarkPosition } from './Watermark';

type StyleProps = {
    watermarkPosition: WatermarkPosition;
    offsetX: number;
    offsetY: number;
};

export const useWatermarkStyles = createStyles(
    (_theme: AppTheme, { watermarkPosition, offsetX, offsetY }: StyleProps) =>
        StyleSheet.create({
            watermarkContainer: {
                position: 'absolute',

                ...(watermarkPosition === 'center' && {
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    justifyContent: 'center',
                    alignItems: 'center',
                    transform: [
                        { translateX: offsetX },
                        { translateY: offsetY },
                    ],
                }),

                ...(watermarkPosition === 'bottom-right' && {
                    right: offsetX,
                    bottom: offsetY,
                }),

                ...(watermarkPosition === 'bottom-left' && {
                    left: offsetX,
                    bottom: offsetY,
                }),
            },
        })
);
