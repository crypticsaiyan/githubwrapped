// Generate Wrapped API Step
// POST /wrapped/:username - Triggers async wrapped generation

import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { githubService } from '../services/github.service';

const bodySchema = z.object({
    year: z.number().optional(),
    token: z.string().optional(), // Optional GitHub token for higher rate limits
});

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'GenerateWrapped',
    description: 'Triggers async generation of GitHub Wrapped for a user',
    flows: ['github-wrapped'],
    method: 'POST',
    path: '/wrapped/:username',
    bodySchema,
    responseSchema: {
        200: z.object({
            status: z.string(),
            message: z.string(),
            traceId: z.string(),
            username: z.string(),
        }),
        404: z.object({
            error: z.string(),
        }),
        500: z.object({
            error: z.string(),
        }),
    },
    emits: ['fetch-github-data'],
    virtualEmits: [{ topic: 'fetch-github-data', label: 'Start Pipeline' }],
};

export const handler: Handlers['GenerateWrapped'] = async (req, { emit, logger, state, traceId }) => {
    const { username } = req.pathParams;
    const { year = new Date().getFullYear(), token } = req.body || {};

    logger.info('Starting GitHub Wrapped generation', { username, year });

    try {
        // Verify user exists on GitHub
        const profile = await githubService.fetchUserProfile(username, token);
        logger.info('User verified on GitHub', { username: profile.username });

        // Initialize status in state
        await state.set('wrapped-status', username, {
            status: 'processing',
            progress: 0,
            startedAt: new Date().toISOString(),
        });

        // Store token for use by event handlers (if provided)
        if (token) {
            await state.set('github-tokens', username, { token });
        }

        // Emit event to start the async processing flow
        await emit({
            topic: 'fetch-github-data',
            data: {
                username,
                year,
                traceId,
            },
        });

        return {
            status: 200,
            body: {
                status: 'processing',
                message: `Started generating GitHub Wrapped for @${username}`,
                traceId,
                username,
            },
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to start wrapped generation', { username, error: errorMessage });

        if (errorMessage.includes('not found')) {
            return {
                status: 404,
                body: {
                    error: `User "${username}" not found on GitHub`,
                },
            };
        }

        return {
            status: 500,
            body: {
                error: `Failed to start generation: ${errorMessage}`,
            },
        };
    }
};
