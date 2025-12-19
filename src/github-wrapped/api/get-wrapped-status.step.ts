// Get Wrapped Status API Step
// GET /wrapped/:username/status - Returns generation status

import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'GetWrappedStatus',
    description: 'Returns the current status of GitHub Wrapped generation',
    flows: ['github-wrapped'],
    method: 'GET',
    path: '/wrapped/:username/status',
    responseSchema: {
        200: z.object({
            username: z.string(),
            status: z.enum(['processing', 'completed', 'failed', 'not_found']),
            progress: z.number().optional(),
            error: z.string().optional(),
            startedAt: z.string().optional(),
            completedAt: z.string().optional(),
        }),
    },
    emits: [],
};

export const handler: Handlers['GetWrappedStatus'] = async (req, { logger, state }) => {
    const { username } = req.pathParams;

    logger.info('Getting wrapped status', { username });

    const status = await state.get<{
        status: 'processing' | 'completed' | 'failed';
        progress?: number;
        error?: string;
        startedAt?: string;
        completedAt?: string;
    }>('wrapped-status', username);

    if (!status) {
        return {
            status: 200,
            body: {
                username,
                status: 'not_found' as const,
            },
        };
    }

    return {
        status: 200,
        body: {
            username,
            ...status,
        },
    };
};
