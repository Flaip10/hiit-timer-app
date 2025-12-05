// src/app/settings/index.tsx (or wherever)
import { MainContainer } from '@src/components/layout/MainContainer';
import { useTheme } from '@src/theme/ThemeProvider';
import { AppText } from '@src/components/ui/Typography/AppText';
import { View, Pressable } from 'react-native';

const SettingsScreen = () => {
    const { theme, preference, themeName, setPreference } = useTheme();

    return (
        <MainContainer title="Settings">
            <View style={{ gap: 16 }}>
                <AppText variant="title">Appearance</AppText>

                <AppText variant="bodySmall" tone="muted">
                    Current theme: {themeName} ({preference})
                </AppText>

                {/* Simple triple switch for now */}
                <View
                    style={{
                        flexDirection: 'row',
                        gap: 8,
                        marginTop: 8,
                    }}
                >
                    {(['light', 'dark', 'system'] as const).map((opt) => {
                        const isActive = preference === opt;

                        return (
                            <Pressable
                                key={opt}
                                onPress={() => setPreference(opt)}
                                style={{
                                    paddingHorizontal: 12,
                                    paddingVertical: 8,
                                    borderRadius: 999,
                                    borderWidth: 1,
                                    borderColor: isActive
                                        ? theme.palette.accent.primary
                                        : theme.palette.border.subtle,
                                    backgroundColor: isActive
                                        ? theme.palette.accent.soft
                                        : 'transparent',
                                }}
                            >
                                <AppText
                                    variant="bodySmall"
                                    tone={isActive ? 'primary' : 'muted'}
                                >
                                    {opt.charAt(0).toUpperCase() + opt.slice(1)}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </View>
            </View>
        </MainContainer>
    );
};

export default SettingsScreen;
