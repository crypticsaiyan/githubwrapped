// Serve Frontend API Step
// GET /app - Serves the GitHub Wrapped frontend

import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'ServeFrontend',
    description: 'Serves the GitHub Wrapped frontend HTML',
    flows: ['github-wrapped'],
    method: 'GET',
    path: '/app',
    responseSchema: {
        200: z.any(),
    },
    emits: [],
}

export const handler: Handlers['ServeFrontend'] = async (req, { logger }) => {
    logger.info('Serving frontend')

    try {
        // Get the directory of this file
        const __filename = fileURLToPath(import.meta.url)
        const __dirname = path.dirname(__filename)

        // Navigate to public folder from the compiled location
        const htmlPath = path.resolve(process.cwd(), 'public', 'index.html')
        logger.info('Looking for HTML at', { htmlPath })

        const html = fs.readFileSync(htmlPath, 'utf-8')

        return {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            },
            body: html,
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logger.error('Failed to serve frontend', { error: errorMessage })
        return {
            status: 500,
            headers: {
                'Content-Type': 'text/html',
            },
            body: `<html><body><h1>Error loading frontend</h1><p>${errorMessage}</p></body></html>`,
        }
    }
}
