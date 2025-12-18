import type { Ionicons } from '@expo/vector-icons';

type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

export const getDrawerIconName = (
    baseIcon: IoniconName | undefined,
    focused: boolean
): IoniconName | undefined => {
    if (!baseIcon) return undefined;

    if (!focused) return baseIcon;

    if (baseIcon.endsWith('-outline')) {
        return baseIcon.replace('-outline', '-sharp') as IoniconName;
    }

    // fallback: return as-is
    return baseIcon;
};
