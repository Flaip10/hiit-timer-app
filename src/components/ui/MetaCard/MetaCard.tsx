import type { FC } from 'react';
import React, { useState } from 'react';
import { Image, LayoutChangeEvent, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import type { MetaCardProps } from './MetaCard.interfaces';
import { metaCardStyles as st } from './MetaCard.styles';
import MinHeightCollapse from '../MinHeightCollapse/MinHeightCollapse';

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

    const handleContentLayout = (e: LayoutChangeEvent) => {
        const h = e.nativeEvent.layout.height;

        if (h <= 0) return;

        setMeasured(true);

        if (typeof minHeight === 'number') {
            setOverflowing(h > minHeight);
        } else {
            setOverflowing(false);
        }
    };

    const handleExpand = () => {
        setExpanded((prev) => !prev);
    };

    // ---- Decide when collapsing is even allowed ----
    const enableCollapse = expandable && measured && overflowing;

    // If we can collapse (enableCollapse), use minHeight; otherwise fully expanded
    const collapseMinHeight = enableCollapse ? minHeight : 0;

    // While not measured or no overflow, keep it visually expanded
    const collapseExpanded = enableCollapse ? expanded : true;

    const noTopContent = !topLeftContent && !statusBadge && !date;
    const hasAnyAction = !!(
        actionStrip ||
        actionButton ||
        secondaryActionButton
    );

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
                            <Text
                                style={{
                                    color: '#F9FAFB',
                                    fontSize: 13,
                                    fontWeight: '700',
                                }}
                                numberOfLines={1}
                            >
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
                                style={{
                                    color: topLeftContent.color ?? '#F9FAFB',
                                    fontSize: 13,
                                    fontWeight: '700',
                                }}
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
                                        style={{
                                            color:
                                                statusBadge.color ?? '#F9FAFB',
                                            fontSize: 13,
                                            fontWeight: '700',
                                        }}
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
                    <Pressable
                        onPress={actionStrip.onPress}
                        style={[
                            st.actionStrip,
                            actionStrip.backgroundColor && {
                                backgroundColor: actionStrip.backgroundColor,
                            },
                        ]}
                    >
                        {actionStrip.icon}
                    </Pressable>
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

                    <View style={{ flex: 1 }}>{children}</View>
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
                    <Ionicons name="chevron-down" size={18} color="#4B5563" />
                </Pressable>
            )}
        </Pressable>
    );
};
