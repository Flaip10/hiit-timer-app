import React from 'react';
import type { ComponentProps } from 'react';
import type { StyleProp, TextStyle } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';

type IoniconsName = ComponentProps<typeof Ionicons>['name'];
type FeatherName = ComponentProps<typeof Feather>['name'];

type IconDefinition =
    | {
          lib: 'ion';
          name: string;
          defaultSize: number;
      }
    | {
          lib: 'feather';
          name: string;
          defaultSize: number;
      };

const ICON_MAP = {
    workout: {
        lib: 'ion',
        name: 'walk-outline',
        defaultSize: 18,
    },
    block: {
        lib: 'ion',
        name: 'layers-outline',
        defaultSize: 16,
    },
    exercise: {
        lib: 'ion',
        name: 'barbell-outline',
        defaultSize: 16,
    },
    time: {
        lib: 'ion',
        name: 'timer-outline',
        defaultSize: 16,
    },
    sets: {
        lib: 'feather',
        name: 'repeat',
        defaultSize: 14,
    },
    intensity: {
        lib: 'feather',
        name: 'activity',
        defaultSize: 14,
    },
    end: {
        lib: 'ion',
        name: 'stop',
        defaultSize: 18,
    },
    play: {
        lib: 'ion',
        name: 'play',
        defaultSize: 24,
    },
    pause: {
        lib: 'ion',
        name: 'pause',
        defaultSize: 24,
    },
    skip: {
        lib: 'ion',
        name: 'play-skip-forward',
        defaultSize: 18,
    },
    calendar: {
        lib: 'ion',
        name: 'calendar-outline',
        defaultSize: 14,
    },
    checkmark: {
        lib: 'ion',
        name: 'checkmark-circle-outline',
        defaultSize: 14,
    },
    stats: {
        lib: 'ion',
        name: 'stats-chart-outline',
        defaultSize: 14,
    },
    share: {
        lib: 'ion',
        name: 'share-outline',
        defaultSize: 20,
    },
    appearance: {
        lib: 'ion',
        name: 'color-palette-outline',
        defaultSize: 20,
    },
    sound: {
        lib: 'ion',
        name: 'volume-high-outline',
        defaultSize: 20,
    },
    language: {
        lib: 'ion',
        name: 'language-outline',
        defaultSize: 20,
    },
    info: {
        lib: 'ion',
        name: 'information-circle-outline',
        defaultSize: 20,
    },
    back: {
        lib: 'ion',
        name: 'chevron-back',
        defaultSize: 22,
    },
    menu: {
        lib: 'ion',
        name: 'menu',
        defaultSize: 22,
    },
} satisfies Record<string, IconDefinition>;

export type IconId = keyof typeof ICON_MAP;

type AppIconProps = {
    id: IconId;
    size?: number;
    color?: string;
    style?: StyleProp<TextStyle>;
};

export const AppIcon = ({ id, size, color, style }: AppIconProps) => {
    const def = ICON_MAP[id];
    const finalSize = size ?? def.defaultSize;

    if (def.lib === 'ion') {
        return (
            <Ionicons
                name={def.name as IoniconsName}
                size={finalSize}
                color={color}
                style={style}
            />
        );
    }

    return (
        <Feather
            name={def.name as FeatherName}
            size={finalSize}
            color={color}
            style={style}
        />
    );
};
