import { ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';

import { Modal } from '../Modal';
import { AppText } from '@src/components/ui/Typography/AppText';
import { Button } from '@src/components/ui/Button/Button';
import { useConfirmDialogStyles } from './ConfirmDialog.styles';

type ConfirmDialogProps = {
    visible: boolean;
    title: string;
    message?: ReactNode; // can be undefined on parent hide
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
};

const ConfirmDialog = ({
    visible,
    title,
    message,
    confirmLabel = 'Remove',
    cancelLabel = 'Cancel',
    destructive = true,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) => {
    // Cache message while visible so it doesn't vanish during exit animation
    const [cachedMessage, setCachedMessage] = useState<ReactNode>(message);
    const st = useConfirmDialogStyles();

    useEffect(() => {
        if (visible && message !== undefined) {
            setCachedMessage(message);
        }
        // do not clear on hide; Modal unmount will handle it
    }, [visible, message]);

    return (
        <Modal visible={visible} onRequestClose={onCancel}>
            <View style={st.container}>
                <View style={st.textContainer}>
                    <AppText variant="title3" style={st.title}>
                        {title}
                    </AppText>

                    {cachedMessage ? (
                        <AppText
                            variant="bodySmall"
                            tone="secondary"
                            style={st.message}
                        >
                            {cachedMessage}
                        </AppText>
                    ) : null}
                </View>

                <View style={st.row}>
                    <Button
                        title={cancelLabel}
                        variant="secondary"
                        onPress={onCancel}
                        style={st.button}
                    />

                    <Button
                        title={confirmLabel}
                        variant={destructive ? 'danger' : 'primary'}
                        onPress={onConfirm}
                        style={st.button}
                    />
                </View>
            </View>
        </Modal>
    );
};

export default ConfirmDialog;
