import type {
    DropdownResolvedLayout,
    ResolveDropdownLayoutArgs,
} from './Dropdown.interfaces';

export const resolveDropdownLayout = ({
    anchorLayout,
    dropdownLayout,
    position,
    matchAnchorWidth,
}: ResolveDropdownLayoutArgs): DropdownResolvedLayout | null => {
    if (!anchorLayout || !dropdownLayout) return null;

    const side = position?.side ?? 'bottom';
    const align = position?.align ?? 'start';
    const offsetX = position?.offset?.x ?? 0;
    const offsetY = position?.offset?.y ?? 0;

    const resolvedLayout: DropdownResolvedLayout = {};

    if (matchAnchorWidth) {
        resolvedLayout.width = anchorLayout.width;
    }

    if (side === 'top') {
        resolvedLayout.top =
            anchorLayout.y - dropdownLayout.height + offsetY;
    }

    if (side === 'bottom') {
        resolvedLayout.top = anchorLayout.y + anchorLayout.height + offsetY;
    }

    if (side === 'left') {
        resolvedLayout.left =
            anchorLayout.x - dropdownLayout.width + offsetX;
    }

    if (side === 'right') {
        resolvedLayout.left = anchorLayout.x + anchorLayout.width + offsetX;
    }

    if (side === 'top' || side === 'bottom') {
        if (align === 'end') {
            resolvedLayout.left =
                anchorLayout.x +
                anchorLayout.width -
                dropdownLayout.width +
                offsetX;
            return resolvedLayout;
        }

        if (align === 'center') {
            resolvedLayout.left =
                anchorLayout.x +
                (anchorLayout.width - dropdownLayout.width) / 2 +
                offsetX;
            return resolvedLayout;
        }

        resolvedLayout.left = anchorLayout.x + offsetX;
        return resolvedLayout;
    }

    if (align === 'end') {
        resolvedLayout.top =
            anchorLayout.y +
            anchorLayout.height -
            dropdownLayout.height +
            offsetY;
        return resolvedLayout;
    }

    if (align === 'center') {
        resolvedLayout.top =
            anchorLayout.y +
            (anchorLayout.height - dropdownLayout.height) / 2 +
            offsetY;
        return resolvedLayout;
    }

    resolvedLayout.top = anchorLayout.y + offsetY;
    return resolvedLayout;
};
