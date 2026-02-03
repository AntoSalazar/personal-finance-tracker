import { ApiReference } from '@scalar/nextjs-api-reference';

const config = {
    spec: {
        url: '/api/docs',
    },
    theme: 'purple' as const,
    darkMode: true,
};

export const GET = ApiReference(config);
