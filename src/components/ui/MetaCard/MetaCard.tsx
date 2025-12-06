import type { FC } from 'react';
import React, { useState } from 'react';
import { Image, LayoutChangeEvent, Pressable, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { MetaCardProps } from './MetaCard.interfaces';
import { useMetaCardStyles } from './MetaCard.styles';
import MinHeightCollapse from '../MinHeightCollapse/MinHeightCollapse';
import { useTheme } from '@src/theme/ThemeProvider';
import { CurvedActionStrip } from './CurvedActionStrip/CurvedActionStrip';

const getPillDate = (isoDate?: string | null, hideHours?: boolean): string => {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    if (Number.isNaN(date.getTime())) return '';

    if (hideHours) {
        return date.toLocaleDateString('pt-PT', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    }

    const datePart = date.toLocaleDateString('pt-PT', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('pt-PT', {
        hour: '2-digit',
        minute: '2-digit',
    });
    return `${datePart} - ${timePart}`;
};

export const MetaCard: FC<MetaCardProps> = ({
    containerStyle,
    date,
    topLeftContent,
    children,
    summaryContent,
    collapsibleContent,
    onPress,
    statusBadge,
    actionStrip,
    actionButton,
    secondaryActionButton,
    expandable = false,
    onExpandedChange,
    minHeight = 100,
    withBottomFade = false,
    hideHours = false,
    imageUrl,
}) => {
    const [expanded, setExpanded] = useState(false);
    const [overflowing, setOverflowing] = useState(false);
    const [measured, setMeasured] = useState(false);

    const noTopContent = !topLeftContent && !statusBadge && !date;
    const hasAnyAction =
        !!actionStrip || !!actionButton || !!secondaryActionButton;

    const st = useMetaCardStyles({
        hasActionStrip: !!actionStrip,
        hasAnyAction,
        hasCollapsibleContent: !!collapsibleContent,
        hasSummaryContent: !!summaryContent,
        hasTopContent: !noTopContent,
    });
    const { theme } = useTheme();

    const safeMin =
        typeof minHeight === 'number' && minHeight >= 0 ? minHeight : 0;

    const hasSplitSlots = !!(summaryContent || collapsibleContent);
    const collapsibleInner = hasSplitSlots
        ? (collapsibleContent ?? null)
        : children;
    const hasCollapsibleContent = !!collapsibleInner;

    // Measure ONLY the collapsible area (not the header, not the summary)
    const handleContentLayout = (e: LayoutChangeEvent) => {
        const h = e.nativeEvent.layout.height;
        if (h <= 0) return;

        setMeasured(true);

        if (safeMin > 0) {
            // "Overflow" = content taller than minHeight
            setOverflowing(h > safeMin);
        } else {
            // When minHeight === 0, any positive height means "there is content to reveal"
            setOverflowing(h > 0);
        }
    };

    const handleExpand = () => {
        const next = !expanded;
        setExpanded(next);
        onExpandedChange?.(next);
    };

    // enableCollapse: controls chevron + fade (UI affordance)
    const enableCollapse =
        expandable && hasCollapsibleContent && measured && overflowing;

    // Collapsing behaviour itself is driven only by `expanded` and `expandable`
    const collapseMinHeight = expandable ? safeMin : 0;
    const collapseExpanded = expandable ? expanded : true;

    return (
        <Pressable onPress={onPress} style={[st.cardContainer, containerStyle]}>
            <View style={st.cardHeader}>
                <View style={[st.topLeftContainer]}>
                    {date ? (
                        <View style={st.dateTimePill}>
                            <Text style={st.dateTimePillText} numberOfLines={1}>
                                {getPillDate(date, hideHours)}
                            </Text>
                        </View>
                    ) : null}

                    {topLeftContent ? (
                        <View
                            style={[
                                st.topLeftContent,
                                topLeftContent.backgroundColor && {
                                    backgroundColor:
                                        topLeftContent.backgroundColor,
                                },
                                topLeftContent.borderColor && {
                                    borderColor: topLeftContent.borderColor,
                                },
                            ]}
                        >
                            {topLeftContent.icon}
                            <Text
                                style={[
                                    st.topLeftContentText,
                                    topLeftContent.color && {
                                        color: topLeftContent.color,
                                    },
                                ]}
                                numberOfLines={2}
                            >
                                {topLeftContent.text ?? ''}
                            </Text>
                        </View>
                    ) : null}

                    {statusBadge ? (
                        <View style={st.statusBadgeContainer}>
                            <View
                                style={[
                                    st.statusBadge,
                                    statusBadge.backgroundColor && {
                                        backgroundColor:
                                            statusBadge.backgroundColor,
                                    },
                                ]}
                            >
                                {statusBadge.icon}
                                {!!statusBadge.label && (
                                    <Text
                                        style={[
                                            st.statusBadgeText,
                                            statusBadge.color && {
                                                color: statusBadge.color,
                                            },
                                        ]}
                                        numberOfLines={1}
                                    >
                                        {statusBadge.label}
                                    </Text>
                                )}
                            </View>
                        </View>
                    ) : null}
                </View>

                {(actionButton || secondaryActionButton) && (
                    <View style={st.actionButtonsContainer}>
                        {secondaryActionButton && (
                            <Pressable
                                onPress={secondaryActionButton.onPress}
                                style={[
                                    st.actionButton,
                                    secondaryActionButton.backgroundColor && {
                                        backgroundColor:
                                            secondaryActionButton.backgroundColor,
                                    },
                                ]}
                            >
                                {secondaryActionButton.icon}
                            </Pressable>
                        )}
                        {actionButton && (
                            <Pressable
                                onPress={actionButton.onPress}
                                style={[
                                    st.actionButton,
                                    actionButton.backgroundColor && {
                                        backgroundColor:
                                            actionButton.backgroundColor,
                                    },
                                ]}
                            >
                                {actionButton.icon}
                            </Pressable>
                        )}
                    </View>
                )}
                {actionStrip && (
                    <CurvedActionStrip
                        width={60}
                        onPress={actionStrip.onPress}
                        icon={actionStrip.icon}
                        backgroundColorOverride={actionStrip.backgroundColor}
                    />
                )}
            </View>

            <View>
                {/* SUMMARY: always-visible, non-collapsible part */}
                {summaryContent ? (
                    <View style={st.summaryContainer}>{summaryContent}</View>
                ) : null}

                {/* COLLAPSIBLE AREA: only collapsibleInner participates in MinHeightCollapse */}
                {hasCollapsibleContent && (
                    <MinHeightCollapse
                        expanded={collapseExpanded}
                        minHeight={collapseMinHeight}
                        timeout={300}
                        withBottomFade={withBottomFade && enableCollapse}
                    >
                        <View
                            style={[
                                st.contentContainer,
                                expandable && st.contentContainerExpandable,
                            ]}
                            onLayout={handleContentLayout}
                        >
                            {imageUrl ? (
                                <View style={st.imageContainer}>
                                    <Image
                                        source={{ uri: imageUrl }}
                                        style={st.image}
                                    />
                                </View>
                            ) : null}

                            <View style={st.contentInner}>
                                {collapsibleInner}
                            </View>
                        </View>
                    </MinHeightCollapse>
                )}
            </View>

            {enableCollapse && (
                <Pressable
                    style={[
                        st.expandIconWrapper,
                        {
                            transform: [
                                { rotate: expanded ? '180deg' : '0deg' },
                            ],
                        },
                    ]}
                    onPress={handleExpand}
                >
                    <Ionicons
                        name="chevron-down"
                        size={18}
                        color={theme.palette.text.secondary}
                    />
                </Pressable>
            )}
        </Pressable>
    );
};
