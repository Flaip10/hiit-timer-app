import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 1000 * 60 * 5,
            gcTime: 1000 * 60 * 30,
            retry: 1,
        },
    },
});

export const AppQueryProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);
