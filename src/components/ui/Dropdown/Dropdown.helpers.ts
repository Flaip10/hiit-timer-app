import type {
    DropdownResolvedLayout,
    ResolveDropdownLayoutArgs,
} from './Dropdown.interfaces';

export const resolveDropdownLayout = ({
    anchorLayout,
    position,
    windowWidth,
    matchAnchorWidth,
}: ResolveDropdownLayoutArgs): DropdownResolvedLayout | null => {
    if (!anchorLayout) return null;

    const side = position?.side ?? 'bottom';
    const align = position?.align ?? 'start';
    const offsetX = position?.offset?.x ?? 0;
    const offsetY = position?.offset?.y ?? 0;

    const resolvedLayout: DropdownResolvedLayout = {};

    if (matchAnchorWidth) {
        resolvedLayout.width = anchorLayout.width;
    }

    if (side === 'top') {
        resolvedLayout.bottom = anchorLayout.y + offsetY;
    }

    if (side === 'bottom') {
        resolvedLayout.top = anchorLayout.y + anchorLayout.height + offsetY;
    }

    if (side === 'left') {
        resolvedLayout.right = windowWidth - anchorLayout.x + offsetX;
    }

    if (side === 'right') {
        resolvedLayout.left = anchorLayout.x + anchorLayout.width + offsetX;
    }

    if (side === 'top' || side === 'bottom') {
        if (align === 'end') {
            resolvedLayout.right =
                windowWidth - anchorLayout.x - anchorLayout.width - offsetX;
            return resolvedLayout;
        }

        if (align === 'center') {
            resolvedLayout.left =
                anchorLayout.x + anchorLayout.width / 2 + offsetX;
            return resolvedLayout;
        }

        resolvedLayout.left = anchorLayout.x + offsetX;
        return resolvedLayout;
    }

    if (align === 'end') {
        resolvedLayout.bottom = anchorLayout.y + anchorLayout.height + offsetY;
        return resolvedLayout;
    }

    if (align === 'center') {
        resolvedLayout.top = anchorLayout.y + anchorLayout.height / 2 + offsetY;
        return resolvedLayout;
    }

    resolvedLayout.top = anchorLayout.y + offsetY;
    return resolvedLayout;
};
