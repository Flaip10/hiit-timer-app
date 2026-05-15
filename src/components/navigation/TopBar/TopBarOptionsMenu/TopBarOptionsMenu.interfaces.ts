import type { RefObject } from 'react';
import type { View } from 'react-native';

import type { TopBarOption } from '../TopBar.interfaces';

export interface TopBarOptionsMenuProps {
    visible: boolean;
    anchorRef: RefObject<View | null>;
    options: readonly TopBarOption[];
    onClose: () => void;
}
