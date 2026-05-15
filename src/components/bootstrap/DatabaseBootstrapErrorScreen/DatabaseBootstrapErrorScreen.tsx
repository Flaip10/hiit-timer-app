import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@src/components/ui/Button/Button';
import { AppText } from '@src/components/ui/Typography/AppText';

import { st } from './styles';

interface DatabaseBootstrapErrorScreenProps {
    onRetry: () => void;
}

export const DatabaseBootstrapErrorScreen = ({
    onRetry,
}: DatabaseBootstrapErrorScreenProps) => {
    const { t } = useTranslation();

    return (
        <View style={st.container}>
            <AppText variant="title3" align="center">
                {t('bootstrap.databaseError.title')}
            </AppText>
            <AppText
                variant="bodySmall"
                tone="secondary"
                align="center"
                style={st.description}
            >
                {t('bootstrap.databaseError.description')}
            </AppText>
            <Button
                title={t('bootstrap.databaseError.retry')}
                onPress={onRetry}
                variant="primary"
                style={st.button}
            />
        </View>
    );
};
