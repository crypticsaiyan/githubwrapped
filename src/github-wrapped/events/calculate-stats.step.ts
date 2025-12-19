// Calculate Stats Event Step
// Subscribes to: calculate-stats
// Emits: generate-achievements
// Calculates derived statistics from raw GitHub data

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { analyticsService } from '../services/analytics.service';
import { githubService } from '../services/github.service';
import { ContributionDay, Repository, GitHubProfile } from '../types';

const inputSchema = z.object({
    username: z.string(),
    year: z.number(),
    traceId: z.string(),
});

export const config: EventConfig = {
    type: 'event',
    name: 'CalculateStats',
    description: 'Calculates derived statistics from raw GitHub data',
    flows: ['github-wrapped'],
    subscribes: ['calculate-stats'],
    emits: ['generate-achievements'],
    input: inputSchema,
};

export const handler: Handlers['CalculateStats'] = async (input, { emit, logger, state }) => {
    const { username, year, traceId } = input;

    logger.info('Calculating statistics', { username, year, traceId });

    try {
        // Get raw data from state
        const profile = await state.get<GitHubProfile>('github-raw', `${username}-profile`);
        const contributions = await state.get<ContributionDay[]>('github-raw', `${username}-contributions`) || [];
        const repos = await state.get<Repository[]>('github-raw', `${username}-repos`) || [];
        const prStats = await state.get<{ total: number; merged: number }>('github-raw', `${username}-prs`) || { total: 0, merged: 0 };
        const issueData = await state.get<{ count: number }>('github-raw', `${username}-issues`) || { count: 0 };
        const totalCommitsData = await state.get<{ count: number }>('github-raw', `${username}-total-commits`) || { count: 0 };

        if (!profile) {
            throw new Error('Profile data not found in state');
        }

        // Update progress
        await state.set('wrapped-status', username, {
            status: 'processing',
            progress: 70,
            startedAt: (await state.get<any>('wrapped-status', username))?.startedAt,
        });

        // Get stored token if available, or fall back to environment variable
        const tokenData = await state.get<{ token: string }>('github-tokens', username);
        const token = tokenData?.token || process.env.GITHUB_TOKEN;

        // Fetch language stats (requires additional API calls)
        logger.info('Fetching language stats', { username });
        const languages = await githubService.fetchLanguageStats(username, token);
        await state.set('github-raw', `${username}-languages`, languages);

        // Fetch collaborators (squad)
        logger.info('Fetching collaborators', { username });
        const squad = await githubService.fetchCollaborators(username, token);
        await state.set('github-raw', `${username}-squad`, squad);

        // Fetch starred repos for fun facts
        logger.info('Fetching starred repos', { username });
        const starredData = await githubService.fetchStarredRepos(username, token);
        await state.set('github-raw', `${username}-starred`, starredData);

        // Calculate overall stats - use totalCommits from search API if available
        const stats = analyticsService.calculateTotalStats(
            contributions,
            prStats,
            issueData.count,
            repos,
            totalCommitsData.count  // Pass the accurate total commits count
        );
        await state.set('github-calculated', `${username}-stats`, stats);

        // Calculate streak data
        const streak = analyticsService.calculateStreak(contributions);
        await state.set('github-calculated', `${username}-streak`, streak);

        // Generate timeline
        const timeline = analyticsService.generateTimeline(contributions, year);
        await state.set('github-calculated', `${username}-timeline`, timeline);

        // Sort repos by stars for top repos
        const topRepos = [...repos]
            .sort((a, b) => b.stars - a.stars)
            .slice(0, 5);
        await state.set('github-calculated', `${username}-top-repos`, topRepos);

        // Update progress
        await state.set('wrapped-status', username, {
            status: 'processing',
            progress: 80,
            startedAt: (await state.get<any>('wrapped-status', username))?.startedAt,
        });

        logger.info('Successfully calculated statistics', { username });

        // Emit to next step
        await emit({
            topic: 'generate-achievements',
            data: {
                username,
                year,
                traceId,
            },
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to calculate stats', { username, error: errorMessage });

        await state.set('wrapped-status', username, {
            status: 'failed',
            error: errorMessage,
            startedAt: (await state.get<any>('wrapped-status', username))?.startedAt,
        });
    }
};
