import {
    createContext,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react';
import { View, type MeasureInWindowOnSuccessCallback } from 'react-native';

import { useDropdownStyles } from './Dropdown.styles';

interface ActiveDropdown {
    id: string;
    content: ReactNode;
}

interface DropdownPortalContextValue {
    show: (id: string, content: ReactNode) => void;
    hide: (id: string) => void;
    measureInWindow: (callback: MeasureInWindowOnSuccessCallback) => void;
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
    const portalLayerRef = useRef<View | null>(null);
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

    const measureInWindow = useCallback(
        (callback: MeasureInWindowOnSuccessCallback) => {
            portalLayerRef.current?.measureInWindow(callback);
        },
        [],
    );

    const value = useMemo(
        () => ({
            show,
            hide,
            measureInWindow,
        }),
        [show, hide, measureInWindow],
    );

    return (
        <DropdownPortalContext.Provider value={value}>
            <View style={st.root}>
                {children}

                <View
                    ref={portalLayerRef}
                    style={st.portalLayer}
                    pointerEvents="box-none"
                >
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
