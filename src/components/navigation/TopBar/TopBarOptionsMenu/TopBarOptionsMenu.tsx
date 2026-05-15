import GuardedPressable from '@src/components/ui/GuardedPressable/GuardedPressable';
import { Dropdown } from '@src/components/ui/Dropdown/Dropdown';
import { AppIcon } from '@src/components/ui/Icon/AppIcon';
import { AppText } from '@src/components/ui/Typography/AppText';
import { useTheme } from '@src/theme/ThemeProvider';
import type { TopBarOption } from '../TopBar.interfaces';
import type { TopBarOptionsMenuProps } from './TopBarOptionsMenu.interfaces';
import { useTopBarOptionsMenuStyles } from './TopBarOptionsMenu.styles';

export const TopBarOptionsMenu = ({
    visible,
    anchorRef,
    options,
    onClose,
}: TopBarOptionsMenuProps) => {
    const { theme } = useTheme();
    const st = useTopBarOptionsMenuStyles();

    const handleOptionPress = (option: TopBarOption) => {
        if (option.disabled) return;

        onClose();
        option.onPress();
    };

    return (
        <Dropdown
            visible={visible}
            anchorRef={anchorRef}
            position={{
                side: 'bottom',
                align: 'end',
            }}
            onClose={onClose}
            surfaceStyle={st.surface}
        >
            {options.map((option) => {
                const iconColor = option.destructive
                    ? theme.palette.feedback.errorText
                    : theme.palette.text.primary;

                return (
                    <GuardedPressable
                        key={option.id}
                        disabled={option.disabled}
                        onPress={() => handleOptionPress(option)}
                        style={({ pressed }) => [
                            st.option,
                            pressed ? st.optionPressed : null,
                            option.disabled ? st.optionDisabled : null,
                        ]}
                    >
                        {option.icon ? (
                            <AppIcon
                                id={option.icon}
                                size={18}
                                color={iconColor}
                            />
                        ) : null}
                        <AppText
                            variant="bodySmall"
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            style={[
                                st.optionLabel,
                                option.destructive
                                    ? st.optionLabelDestructive
                                    : null,
                            ]}
                        >
                            {option.label}
                        </AppText>
                    </GuardedPressable>
                );
            })}
        </Dropdown>
    );
};
