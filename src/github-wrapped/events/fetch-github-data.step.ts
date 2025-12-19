// Fetch GitHub Data Event Step
// Subscribes to: fetch-github-data
// Emits: calculate-stats
// Fetches all raw data from GitHub API and stores in state

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { githubService } from '../services/github.service';

const inputSchema = z.object({
    username: z.string(),
    year: z.number(),
    traceId: z.string(),
});

export const config: EventConfig = {
    type: 'event',
    name: 'FetchGitHubData',
    description: 'Fetches all raw data from GitHub API for the user',
    flows: ['github-wrapped'],
    subscribes: ['fetch-github-data'],
    emits: ['calculate-stats'],
    input: inputSchema,
};

export const handler: Handlers['FetchGitHubData'] = async (input, { emit, logger, state }) => {
    const { username, year, traceId } = input;

    logger.info('Fetching GitHub data', { username, year, traceId });

    try {
        // Get stored token if available, or fall back to environment variable
        const tokenData = await state.get<{ token: string }>('github-tokens', username);
        const token = tokenData?.token || process.env.GITHUB_TOKEN;
        
        if (!token) {
            logger.warn('No GitHub token available - using unauthenticated API (rate limited to 60 req/hour). Set GITHUB_TOKEN env var for higher limits.');
        }

        // Update progress
        await state.set('wrapped-status', username, {
            status: 'processing',
            progress: 10,
            startedAt: new Date().toISOString(),
        });

        // Fetch profile
        logger.info('Fetching user profile', { username });
        const profile = await githubService.fetchUserProfile(username, token);
        await state.set('github-raw', `${username}-profile`, profile);

        // Update progress
        await state.set('wrapped-status', username, {
            status: 'processing',
            progress: 20,
            startedAt: (await state.get<any>('wrapped-status', username))?.startedAt,
        });

        // Fetch contribution data
        logger.info('Fetching contribution data', { username, year });
        const contributions = await githubService.fetchContributionData(username, year, token);
        await state.set('github-raw', `${username}-contributions`, contributions);

        // Update progress
        await state.set('wrapped-status', username, {
            status: 'processing',
            progress: 40,
            startedAt: (await state.get<any>('wrapped-status', username))?.startedAt,
        });

        // Fetch repositories
        logger.info('Fetching repositories', { username });
        const repos = await githubService.fetchUserRepos(username, token);
        await state.set('github-raw', `${username}-repos`, repos);

        // Update progress
        await state.set('wrapped-status', username, {
            status: 'processing',
            progress: 50,
            startedAt: (await state.get<any>('wrapped-status', username))?.startedAt,
        });

        // Fetch PR stats
        logger.info('Fetching PR stats', { username, year });
        const prStats = await githubService.fetchPRStats(username, year, token);
        await state.set('github-raw', `${username}-prs`, prStats);

        // Fetch issue stats
        logger.info('Fetching issue stats', { username, year });
        const issueCount = await githubService.fetchIssueStats(username, year, token);
        await state.set('github-raw', `${username}-issues`, { count: issueCount });

        // Fetch total commits count via search API
        logger.info('Fetching total commits', { username, year });
        const totalCommits = await githubService.fetchTotalCommits(username, year, token);
        await state.set('github-raw', `${username}-total-commits`, { count: totalCommits });

        // Update progress
        await state.set('wrapped-status', username, {
            status: 'processing',
            progress: 60,
            startedAt: (await state.get<any>('wrapped-status', username))?.startedAt,
        });

        logger.info('Successfully fetched all GitHub data', {
            username,
            contributionsCount: contributions.length,
            reposCount: repos.length,
            totalCommits,
        });

        // Emit to next step
        await emit({
            topic: 'calculate-stats',
            data: {
                username,
                year,
                traceId,
            },
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to fetch GitHub data', { username, error: errorMessage });

        await state.set('wrapped-status', username, {
            status: 'failed',
            error: errorMessage,
            startedAt: (await state.get<any>('wrapped-status', username))?.startedAt,
        });
    }
};
