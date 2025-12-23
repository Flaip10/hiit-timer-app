export interface ThemeLayout {
    screen: {
        padding: number;
        paddingVertical: number;
        paddingHorizontal: number;
    };
    mainContainer: {
        gap: number;
    };
    section: {
        gap: number;
    };
    card: {
        padding: number;
        borderRadius: number;
    };
    tile: {
        borderRadius: number;
    };
    listItem: {
        gap: number;
    };
    footer: {
        padding: number;
    };
}

const BASE_LAYOUT: ThemeLayout = {
    screen: {
        padding: 16,
        paddingHorizontal: 16,
        paddingVertical: 16,
    },
    mainContainer: {
        gap: 20,
    },
    section: {
        gap: 16,
    },
    card: {
        padding: 14,
        borderRadius: 14,
    },
    tile: { borderRadius: 20 },
    listItem: {
        gap: 10,
    },
    footer: {
        padding: 12,
    },
};

export const createLayout = (scale: number): ThemeLayout => ({
    screen: {
        padding: Math.round(BASE_LAYOUT.screen.padding * scale),
        paddingVertical: Math.round(BASE_LAYOUT.screen.padding * scale),
        paddingHorizontal: Math.round(BASE_LAYOUT.screen.padding * scale),
    },
    mainContainer: {
        gap: Math.round(BASE_LAYOUT.mainContainer.gap * scale),
    },
    section: {
        gap: Math.round(BASE_LAYOUT.section.gap * scale),
    },
    card: {
        padding: Math.round(BASE_LAYOUT.card.padding * scale),
        borderRadius: Math.round(BASE_LAYOUT.card.borderRadius * scale),
    },
    tile: {
        borderRadius: Math.round(BASE_LAYOUT.tile.borderRadius * scale),
    },
    listItem: {
        gap: Math.round(BASE_LAYOUT.listItem.gap * scale),
    },
    footer: {
        padding: Math.round(BASE_LAYOUT.footer.padding * scale),
    },
});
