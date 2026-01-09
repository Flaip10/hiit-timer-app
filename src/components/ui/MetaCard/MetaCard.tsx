import type { FC } from 'react';
import React, { useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { Image, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { MetaCardProps } from './MetaCard.interfaces';
import { useMetaCardStyles } from './MetaCard.styles';
import MinHeightCollapse from '../MinHeightCollapse/MinHeightCollapse';
import { useTheme } from '@src/theme/ThemeProvider';
import { CurvedActionStrip } from './CurvedActionStrip/CurvedActionStrip';
import GuardedPressable from '../GuardedPressable/GuardedPressable';

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
    minHeight = 50,
    withBottomFade = false,
    hideHours = false,
    imageUrl,
    initiallyExpanded = false,
}) => {
    const [expanded, setExpanded] = useState(initiallyExpanded);
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

    // Slot resolution
    const hasSummary = !!summaryContent;
    const hasSplitSlots = !!(summaryContent || collapsibleContent);
    const collapsibleInner = hasSplitSlots
        ? (collapsibleContent ?? null)
        : children;
    const hasCollapsibleContent = !!collapsibleInner;

    /**
     * - If we have collapsible content → collapse that
     * - Else, if we have only a summary → collapse the summary area
     * - Else → nothing collapsible
     */
    const collapseTarget: 'content' | 'summary' | null = hasCollapsibleContent
        ? 'content'
        : hasSummary
          ? 'summary'
          : null;

    const hasCollapsibleArea = collapseTarget !== null;

    // Measure the area we are collapsing (either summary or content)
    const handleCollapseAreaLayout = (e: LayoutChangeEvent) => {
        const h = e.nativeEvent.layout.height;
        if (h <= 0) return;

        setMeasured(true);

        if (safeMin > 0) {
            setOverflowing(h > safeMin);
        } else {
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
        expandable && hasCollapsibleArea && measured && overflowing;

    // Collapsing behaviour itself is driven only by `expanded` and `expandable`
    const collapseMinHeight = expandable ? safeMin : 0;
    const collapseExpanded = expandable ? expanded : true;

    return (
        <GuardedPressable
            onPress={onPress}
            style={[st.cardContainer, containerStyle]}
        >
            {/* Top header */}
            <View style={st.cardHeader}>
                <View style={[st.topLeftContainer]}>
                    {date ? (
                        <View style={st.dateTimePill}>
                            <Ionicons
                                name="calendar-outline"
                                size={14}
                                color={theme.palette.metaCard.datePill.icon}
                            />
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
                            <GuardedPressable
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
                            </GuardedPressable>
                        )}
                        {actionButton && (
                            <GuardedPressable
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
                            </GuardedPressable>
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

            {/* Body (summary + collapsible area) */}
            <View>
                {/* Summary Content */}
                {summaryContent ? (
                    collapseTarget === 'summary' ? (
                        <MinHeightCollapse
                            expanded={collapseExpanded}
                            minHeight={collapseMinHeight}
                            timeout={300}
                            withBottomFade={withBottomFade && enableCollapse}
                        >
                            <View
                                style={st.summaryContainer}
                                onLayout={handleCollapseAreaLayout}
                            >
                                {summaryContent}
                            </View>
                        </MinHeightCollapse>
                    ) : (
                        <View style={st.summaryContainer}>
                            {summaryContent}
                        </View>
                    )
                ) : null}

                {/* Collapsible Content */}
                {hasCollapsibleContent && (
                    <MinHeightCollapse
                        expanded={
                            collapseTarget === 'content'
                                ? collapseExpanded
                                : true
                        }
                        minHeight={
                            collapseTarget === 'content' ? collapseMinHeight : 0
                        }
                        timeout={300}
                        withBottomFade={
                            withBottomFade &&
                            enableCollapse &&
                            collapseTarget === 'content'
                        }
                    >
                        <View
                            style={[
                                st.contentContainer,
                                expandable && st.contentContainerExpandable,
                            ]}
                            onLayout={
                                collapseTarget === 'content'
                                    ? handleCollapseAreaLayout
                                    : undefined
                            }
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
                <GuardedPressable
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
                </GuardedPressable>
            )}
        </GuardedPressable>
    );
};
