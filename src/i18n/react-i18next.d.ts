import 'react-i18next';

import type { I18nResource } from './resources/interfaces';

declare module 'react-i18next' {
    interface CustomTypeOptions {
        defaultNS: 'translation';
        resources: {
            translation: I18nResource;
        };
    }
}
