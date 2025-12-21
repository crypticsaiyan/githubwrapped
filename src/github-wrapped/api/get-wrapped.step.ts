// Get Wrapped Data API Step
// GET /wrapped/:username - Returns the complete wrapped data

import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { WrappedData } from '../types';

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'GetWrapped',
    description: 'Returns the complete GitHub Wrapped data for a user',
    flows: ['github-wrapped'],
    method: 'GET',
    path: '/wrapped/:username',
    responseSchema: {
        200: z.object({
            data: z.any(), // WrappedData is complex, using any for response
        }),
        202: z.object({
            status: z.string(),
            message: z.string(),
            progress: z.number().optional(),
        }),
        404: z.object({
            error: z.string(),
        }),
    },
    emits: [],
    virtualSubscribes: ['wrapped-complete'],
};

export const handler: Handlers['GetWrapped'] = async (req, { logger, state }) => {
    const { username } = req.pathParams;

    logger.info('Getting wrapped data', { username });

    // Check status first
    const status = await state.get<{
        status: 'processing' | 'completed' | 'failed';
        progress?: number;
        error?: string;
    }>('wrapped-status', username);

    if (!status) {
        return {
            status: 404,
            body: {
                error: `No wrapped data found for "${username}". Start generation with POST /wrapped/${username}`,
            },
        };
    }

    if (status.status === 'processing') {
        return {
            status: 202,
            body: {
                status: 'processing',
                message: `GitHub Wrapped for @${username} is still being generated`,
                progress: status.progress || 0,
            },
        };
    }

    if (status.status === 'failed') {
        return {
            status: 404,
            body: {
                error: `Generation failed for "${username}": ${status.error || 'Unknown error'}`,
            },
        };
    }

    // Get the wrapped data
    const wrappedData = await state.get<WrappedData>('wrapped-data', username);

    if (!wrappedData) {
        return {
            status: 404,
            body: {
                error: `Wrapped data not found for "${username}"`,
            },
        };
    }

    return {
        status: 200,
        body: {
            data: wrappedData,
        },
    };
};
