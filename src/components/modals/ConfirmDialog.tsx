import { ReactNode, useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Modal } from '../Modal';

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

    useEffect(() => {
        if (visible && message !== undefined) setCachedMessage(message);
        // do NOT clear on hide; component will unmount after Modal exit
    }, [visible, message]);

    return (
        <Modal visible={visible} onRequestClose={onCancel}>
            <View style={{ gap: 12 }}>
                <Text style={s.title}>{title}</Text>
                {cachedMessage ? (
                    <Text style={s.message}>{cachedMessage}</Text>
                ) : null}

                <View style={s.row}>
                    <Pressable
                        onPress={onCancel}
                        style={({ pressed }) => [
                            s.btn,
                            s.secondary,
                            pressed && s.pressed,
                        ]}
                    >
                        <Text style={s.btnText}>{cancelLabel}</Text>
                    </Pressable>

                    <Pressable
                        onPress={onConfirm}
                        style={({ pressed }) => [
                            s.btn,
                            destructive ? s.destructive : s.primary,
                            pressed && s.pressed,
                        ]}
                    >
                        <Text style={s.btnText}>{confirmLabel}</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

const s = StyleSheet.create({
    title: { color: '#F2F2F2', fontSize: 18, fontWeight: '700' },
    message: { color: '#A1A1AA', fontSize: 14 },
    row: { flexDirection: 'row', gap: 12, marginTop: 8 },
    btn: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: 'center',
    },
    primary: { backgroundColor: '#2563EB' },
    secondary: { backgroundColor: '#1C1C1F' },
    destructive: { backgroundColor: '#DC2626' },
    btnText: { color: '#fff', fontWeight: '700' },
    pressed: { opacity: 0.9 },
});

export default ConfirmDialog;
