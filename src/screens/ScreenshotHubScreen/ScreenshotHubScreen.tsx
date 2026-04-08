import React, { useCallback } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';

import { MainContainer } from '@src/components/layout/MainContainer/MainContainer';
import { ScreenSection } from '@src/components/layout/ScreenSection/ScreenSection';
import { Button } from '@src/components/ui/Button/Button';
import { AppText } from '@src/components/ui/Typography/AppText';
import {
    SCREENSHOT_HUB_DESTINATIONS,
    type ScreenshotHubDestination,
} from '@src/demo/marketingDemo';
import { useMarketingDemoStore } from '@src/demo/marketingDemoStore';
import { useScreenshotHubStyles } from './styles';

const ScreenshotHubScreen = () => {
    const router = useRouter();
    const st = useScreenshotHubStyles();
    const setActiveScreenshotTarget = useMarketingDemoStore(
        (state) => state.setActiveScreenshotTarget
    );

    const handleOpenTarget = useCallback(
        (destination: ScreenshotHubDestination) => {
            setActiveScreenshotTarget(destination.target);

            if (destination.params) {
                router.push({
                    pathname: destination.pathname,
                    params: destination.params,
                });
                return;
            }

            router.push(destination.pathname);
        },
        [router, setActiveScreenshotTarget]
    );

    return (
        <MainContainer title="Screenshot Hub">
            <ScreenSection topSpacing="none" gap={16}>
                <View style={st.intro}>
                    <AppText variant="title2" style={st.introTitle}>
                        Marketing Screenshot States
                    </AppText>
                    <AppText
                        variant="bodySmall"
                        tone="secondary"
                        style={st.introBody}
                    >
                        Select a staged target to open a deterministic screen
                        with seeded marketing fixtures and fixed run states.
                    </AppText>
                </View>
            </ScreenSection>

            <ScreenSection title="Capture Targets" topSpacing="medium">
                <View style={st.list}>
                    {SCREENSHOT_HUB_DESTINATIONS.map((destination) => (
                        <View key={destination.target} style={st.card}>
                            <View style={st.cardHeader}>
                                <AppText
                                    variant="title3"
                                    style={st.cardTitle}
                                >
                                    {destination.title}
                                </AppText>
                                <AppText
                                    variant="bodySmall"
                                    tone="secondary"
                                    style={st.cardDescription}
                                >
                                    {destination.description}
                                </AppText>
                            </View>

                            <Button
                                title={`Open ${destination.title}`}
                                variant="primary"
                                onPress={() => handleOpenTarget(destination)}
                            />
                        </View>
                    ))}
                </View>
            </ScreenSection>
        </MainContainer>
    );
};

export default ScreenshotHubScreen;
