export interface ThemeLayout {
    screenPadding: number;

    sectionGap: number;

    cardPadding: number;

    listItemGap: number;

    footerPadding: number;
}

const BASE_LAYOUT: ThemeLayout = {
    screenPadding: 16,
    sectionGap: 16,
    cardPadding: 14,
    listItemGap: 10,
    footerPadding: 12,
};

export const createLayout = (scale: number): ThemeLayout => ({
    screenPadding: Math.round(BASE_LAYOUT.screenPadding * scale),
    sectionGap: Math.round(BASE_LAYOUT.sectionGap * scale),
    cardPadding: Math.round(BASE_LAYOUT.cardPadding * scale),
    listItemGap: Math.round(BASE_LAYOUT.listItemGap * scale),
    footerPadding: Math.round(BASE_LAYOUT.footerPadding * scale),
});
