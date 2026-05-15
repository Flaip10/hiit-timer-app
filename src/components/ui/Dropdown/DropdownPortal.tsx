import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useState,
    type ReactNode,
} from 'react';
import { View } from 'react-native';

import { useDropdownStyles } from './Dropdown.styles';

interface ActiveDropdown {
    id: string;
    content: ReactNode;
}

interface DropdownPortalContextValue {
    show: (id: string, content: ReactNode) => void;
    hide: (id: string) => void;
}

interface DropdownPortalProviderProps {
    children: ReactNode;
}

const DropdownPortalContext =
    createContext<DropdownPortalContextValue | null>(null);

export const DropdownPortalProvider = ({
    children,
}: DropdownPortalProviderProps) => {
    const st = useDropdownStyles();
    const [activeDropdown, setActiveDropdown] =
        useState<ActiveDropdown | null>(null);

    const show = useCallback((id: string, content: ReactNode) => {
        setActiveDropdown({ id, content });
    }, []);

    const hide = useCallback((id: string) => {
        setActiveDropdown((current) => {
            if (current?.id !== id) return current;

            return null;
        });
    }, []);

    const value = useMemo(
        () => ({
            show,
            hide,
        }),
        [show, hide],
    );

    return (
        <DropdownPortalContext.Provider value={value}>
            <View style={st.root}>
                {children}

                <View style={st.portalLayer} pointerEvents="box-none">
                    {activeDropdown ? activeDropdown.content : null}
                </View>
            </View>
        </DropdownPortalContext.Provider>
    );
};

export const useDropdownPortal = () => {
    const context = useContext(DropdownPortalContext);

    if (!context) {
        throw new Error(
            'useDropdownPortal must be used inside DropdownPortalProvider.',
        );
    }

    return context;
};
