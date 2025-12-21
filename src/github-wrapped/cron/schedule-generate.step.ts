import { CronConfig, Handlers } from 'motia'

// Schedules automated generation of GitHub Wrapped for configured usernames
// Configuration:
// - `SCHEDULE_USERS` env var: comma-separated list of usernames to run daily
// - falls back to a small demo list if not provided

export const config: CronConfig = {
  type: 'cron',
  cron: '0 3 * * *', // run daily at 03:00 UTC
  name: 'ScheduleGenerateWrapped',
  description: 'Daily scheduled job that triggers generation for configured users',
  emits: [{ topic: 'fetch-github-data', label: 'Daily Trigger' }],
  flows: ['github-wrapped'],
}

export const handler: Handlers['ScheduleGenerateWrapped'] = async ({ logger, emit, state }) => {
  const envList = process.env.SCHEDULE_USERS || ''
  const configured = envList.split(',').map(s => s.trim()).filter(Boolean)

  // Allow an override list stored in state under `scheduled-users`
  const stored = (await state.getGroup<string>('scheduled-users')) || []

  const users = configured.length > 0 ? configured : (stored.length > 0 ? stored : ['octocat'])

  logger.info('Scheduled generate job running', { count: users.length })

  for (const username of users) {
    try {
      await state.set('wrapped-status', username, {
        status: 'processing',
        progress: 0,
        startedAt: new Date().toISOString(),
      })

      await emit({
        topic: 'fetch-github-data',
        data: { username, year: new Date().getFullYear() },
      })

      logger.info('Triggered generation', { username })
    } catch (err) {
      logger.error('Failed to trigger generate for user', { username, error: err instanceof Error ? err.message : err })
    }
  }
}
