// Generate Achievements Event Step
// Subscribes to: generate-achievements
// Emits: finalize-wrapped
// Generates titles, fun facts, and quotes based on stats

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import { analyticsService } from '../services/analytics.service';
import {
    GitHubProfile,
    WrappedStats,
    LanguageStat,
    Repository,
    ContributionDay
} from '../types';

const inputSchema = z.object({
    username: z.string(),
    year: z.number(),
    traceId: z.string(),
});

export const config: EventConfig = {
    type: 'event',
    name: 'GenerateAchievements',
    description: 'Generates titles, fun facts, and quotes based on user stats',
    flows: ['github-wrapped'],
    subscribes: ['generate-achievements'],
    emits: ['finalize-wrapped'],
    input: inputSchema,
};

export const handler: Handlers['GenerateAchievements'] = async (input, { emit, logger, state }) => {
    const { username, year, traceId } = input;

    logger.info('Generating achievements', { username, year, traceId });

    try {
        // Get calculated data from state
        const profile = await state.get<GitHubProfile>('github-raw', `${username}-profile`);
        const stats = await state.get<WrappedStats>('github-calculated', `${username}-stats`);
        const languages = await state.get<LanguageStat[]>('github-raw', `${username}-languages`) || [];
        const repos = await state.get<Repository[]>('github-raw', `${username}-repos`) || [];
        const contributions = await state.get<ContributionDay[]>('github-raw', `${username}-contributions`) || [];
        const starredData = await state.get<{ oldest: { name: string; year: number } | null }>('github-raw', `${username}-starred`);

        if (!profile || !stats) {
            throw new Error('Required data not found in state');
        }

        // Calculate coding age (years since account creation)
        const joinDate = new Date(profile.joinDate);
        const now = new Date();
        const codingAge = Math.floor((now.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24 * 365));

        // Generate achievement titles
        const titles = analyticsService.generateTitles(stats, languages, repos);
        await state.set('github-achievements', `${username}-titles`, titles);

        // Generate fun facts
        const funFacts = analyticsService.generateFunFacts(
            codingAge,
            starredData?.oldest || null,
            stats,
            contributions
        );
        await state.set('github-achievements', `${username}-fun-facts`, funFacts);

        // Update progress
        await state.set('wrapped-status', username, {
            status: 'processing',
            progress: 90,
            startedAt: (await state.get<any>('wrapped-status', username))?.startedAt,
        });

        logger.info('Successfully generated achievements', {
            username,
            titlesCount: titles.length,
            codingAge
        });

        // Emit to next step
        await emit({
            topic: 'finalize-wrapped',
            data: {
                username,
                year,
                traceId,
            },
        });

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to generate achievements', { username, error: errorMessage });

        await state.set('wrapped-status', username, {
            status: 'failed',
            error: errorMessage,
            startedAt: (await state.get<any>('wrapped-status', username))?.startedAt,
        });
    }
};
