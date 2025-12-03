import { Pressable, Text, View } from 'react-native';
import { Modal } from '@src/components/Modal';
import { useRouter } from 'expo-router';
import st from './NewWorkoutModal.styles';

type NewWorkoutModalProps = {
    visible: boolean;
    closeModal: () => void;
    handleImportFromFile: () => Promise<void>;
};

const NewWorkoutModal = ({
    visible,
    closeModal,
    handleImportFromFile,
}: NewWorkoutModalProps) => {
    const router = useRouter();

    return (
        <Modal visible={visible} onRequestClose={closeModal}>
            <View style={st.mainContainer}>
                <View style={st.textContainer}>
                    <Text style={st.modalTitle}>New workout</Text>
                    <Text style={st.modalSubtitle}>
                        Choose how you want to start:
                    </Text>
                </View>
                <View style={st.btnsContainer}>
                    <Pressable
                        onPress={() => {
                            closeModal();
                            router.push('/workouts/edit');
                        }}
                        style={[st.modalBtn, st.primary]}
                    >
                        <Text style={st.modalBtnText}>Create new</Text>
                    </Pressable>

                    <Pressable
                        onPress={handleImportFromFile}
                        style={[st.modalBtn, st.secondary]}
                    >
                        <Text style={st.modalBtnText}>Import from file</Text>
                    </Pressable>

                    <Pressable onPress={closeModal} style={st.modalCancelBtn}>
                        <Text style={st.modalCancelText}>Cancel</Text>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
};

export default NewWorkoutModal;
