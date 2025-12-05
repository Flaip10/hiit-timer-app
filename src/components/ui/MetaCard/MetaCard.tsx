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
    onPress,
    statusBadge,
    actionStrip,
    actionButton,
    secondaryActionButton,
    expandable = false,
    minHeight = 100,
    withBottomFade = false,
    hideHours = false,
    imageUrl,
}) => {
    const [expanded, setExpanded] = useState(false);
    const [overflowing, setOverflowing] = useState(false);
    const [measured, setMeasured] = useState(false);

    const st = useMetaCardStyles();
    const { theme } = useTheme();

    const handleContentLayout = (e: LayoutChangeEvent) => {
        const h = e.nativeEvent.layout.height;
        if (h <= 0) return;

        setMeasured(true);
        setOverflowing(typeof minHeight === 'number' && h > minHeight);
    };

    const handleExpand = () => {
        setExpanded((prev) => !prev);
    };

    const enableCollapse = expandable && measured && overflowing;
    const collapseMinHeight = enableCollapse ? minHeight : 0;
    const collapseExpanded = enableCollapse ? expanded : true;

    const noTopContent = !topLeftContent && !statusBadge && !date;
    const hasAnyAction = actionStrip || actionButton || secondaryActionButton;

    return (
        <Pressable
            onPress={onPress}
            style={[
                st.cardContainer,
                noTopContent && st.cardContainerNoTopContent,
                containerStyle,
            ]}
        >
            <View style={st.cardHeader}>
                <View
                    style={[
                        st.topLeftContainer,
                        !hasAnyAction && st.topLeftContainerNoAction,
                    ]}
                >
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

                    <View style={st.contentInner}>{children}</View>
                </View>
            </MinHeightCollapse>

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
