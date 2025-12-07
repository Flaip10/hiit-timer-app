export interface ThemeLayout {
    screen: {
        padding: number;
    };
    mainContainer: {
        gap: number;
    };
    section: {
        gap: number;
    };
    card: {
        padding: number;
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
    },
    mainContainer: {
        gap: 20,
    },
    section: {
        gap: 16,
    },
    card: {
        padding: 14,
    },
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
    },
    mainContainer: {
        gap: Math.round(BASE_LAYOUT.mainContainer.gap * scale),
    },
    section: {
        gap: Math.round(BASE_LAYOUT.section.gap * scale),
    },
    card: {
        padding: Math.round(BASE_LAYOUT.card.padding * scale),
    },
    listItem: {
        gap: Math.round(BASE_LAYOUT.listItem.gap * scale),
    },
    footer: {
        padding: Math.round(BASE_LAYOUT.footer.padding * scale),
    },
});
