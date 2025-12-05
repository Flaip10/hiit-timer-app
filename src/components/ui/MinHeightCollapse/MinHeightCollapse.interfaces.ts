import type { ReactNode } from 'react';

export interface MinHeightCollapseProps {
    /**
     * Whether the collapse is expanded
     */
    expanded: boolean;

    /**
     * Minimum height of the collapse when collapsed
     */
    minHeight?: number;

    /**
     * Content to be displayed inside the collapse
     */
    children: ReactNode;

    /**
     * Duration of the transition in ms
     */
    timeout?: number;

    /**
     * Show a bottom fade overlay when collapsed
     */
    withBottomFade?: boolean;

    /**
     * Height of the bottom fade overlay (in px)
     */
    bottomFadeHeight?: number;
}
