// Get Badge API Step
// GET /badge/:username - Returns a downloadable SVG badge

import { ApiRouteConfig, Handlers } from 'motia';
import { z } from 'zod';
import { WrappedData } from '../types';
import { badgeService } from '../services/badge.service';

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'GetBadge',
    description: 'Returns a downloadable SVG badge for the user',
    flows: ['github-wrapped'],
    method: 'GET',
    path: '/badge/:username',
    queryParams: [
        { name: 'format', description: 'Output format: svg (default) or html (data URL)' },
    ],
    responseSchema: {
        200: z.any(), // SVG content or HTML data URL
        404: z.object({
            error: z.string(),
        }),
    },
    emits: [],
};

export const handler: Handlers['GetBadge'] = async (req, { logger, state }) => {
    const { username } = req.pathParams;
    const format = req.queryParams.format as string || 'svg';

    logger.info('Generating badge', { username, format });

    // Check if wrapped data exists
    const status = await state.get<{ status: string }>('wrapped-status', username);

    if (!status || status.status !== 'completed') {
        return {
            status: 404,
            body: {
                error: `Wrapped data not ready for "${username}". Generate wrapped first with POST /wrapped/${username}`,
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

    // Generate the badge
    const badgeOptions = {
        profile: wrappedData.profile,
        stats: wrappedData.stats,
        topLanguage: wrappedData.languages[0] || null,
        mainTitle: wrappedData.titles[0] || null,
        year: wrappedData.year,
    };

    if (format === 'html') {
        const dataUrl = await badgeService.generateBadgeHTML(badgeOptions);
        return {
            status: 200,
            headers: {
                'Content-Type': 'text/plain',
            },
            body: dataUrl,
        };
    }

    // Default: Return SVG
    const svg = badgeService.generateBadgeSVG(badgeOptions);

    return {
        status: 200,
        headers: {
            'Content-Type': 'image/svg+xml',
            'Content-Disposition': `inline; filename="github-wrapped-${username}.svg"`,
        },
        body: svg,
    };
};
