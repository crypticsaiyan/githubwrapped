// Finalize Wrapped Event Step
// Subscribes to: finalize-wrapped
// Final step: Assembles all data into the complete WrappedData object

import { EventConfig, Handlers } from 'motia';
import { z } from 'zod';
import {
    WrappedData,
    GitHubProfile,
    WrappedStats,
    LanguageStat,
    Repository,
    TimelineMonth,
    AchievementTitle,
    SquadMember,
    FunFacts,
    StreakData,
} from '../types';

const inputSchema = z.object({
    username: z.string(),
    year: z.number(),
    traceId: z.string(),
});

export const config: EventConfig = {
    type: 'event',
    name: 'FinalizeWrapped',
    description: 'Assembles all data into the complete WrappedData object',
    flows: ['github-wrapped'],
    subscribes: ['finalize-wrapped'],
    emits: [],
    input: inputSchema,
};

export const handler: Handlers['FinalizeWrapped'] = async (input, { logger, state }) => {
    const { username, year, traceId } = input;

    logger.info('Finalizing wrapped data', { username, year, traceId });

    try {
        // Gather all data from state
        const profile = await state.get<GitHubProfile>('github-raw', `${username}-profile`);
        const stats = await state.get<WrappedStats>('github-calculated', `${username}-stats`);
        const streak = await state.get<StreakData>('github-calculated', `${username}-streak`);
        const languages = await state.get<LanguageStat[]>('github-raw', `${username}-languages`) || [];
        const topRepos = await state.get<Repository[]>('github-calculated', `${username}-top-repos`) || [];
        const timeline = await state.get<TimelineMonth[]>('github-calculated', `${username}-timeline`) || [];
        const titles = await state.get<AchievementTitle[]>('github-achievements', `${username}-titles`) || [];
        const squad = await state.get<SquadMember[]>('github-raw', `${username}-squad`) || [];
        const funFacts = await state.get<FunFacts>('github-achievements', `${username}-fun-facts`);

        if (!profile || !stats || !streak || !funFacts) {
            throw new Error('Missing required data for wrapped');
        }

        // Assemble the complete wrapped data
        const wrappedData: WrappedData = {
            username,
            year,
            status: 'completed',
            generatedAt: new Date().toISOString(),
            profile,
            stats,
            streak,
            languages,
            topRepos,
            timeline,
            titles,
            squad,
            funFacts,
        };

        // Store the complete wrapped data
        await state.set('wrapped-data', username, wrappedData);

        // Update status to completed
        await state.set('wrapped-status', username, {
            status: 'completed',
            progress: 100,
            startedAt: (await state.get<any>('wrapped-status', username))?.startedAt,
            completedAt: new Date().toISOString(),
        });

        logger.info('Successfully finalized wrapped data', {
            username,
            titlesCount: titles.length,
            languagesCount: languages.length,
            squadCount: squad.length,
        });

        // Cleanup: Optionally clear raw data to save space
        // await state.clear('github-raw');
        // await state.clear('github-calculated');
        // await state.clear('github-achievements');

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Failed to finalize wrapped', { username, error: errorMessage });

        await state.set('wrapped-status', username, {
            status: 'failed',
            error: errorMessage,
            startedAt: (await state.get<any>('wrapped-status', username))?.startedAt,
        });
    }
};
