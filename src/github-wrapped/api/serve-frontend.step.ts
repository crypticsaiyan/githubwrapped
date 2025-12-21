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
        200: { type: 'string' },
    },
    emits: [],
}

export const handler: Handlers['ServeFrontend'] = async (req, { logger }) => {
    logger.info('Serving frontend')

    try {
        // Try multiple path resolution strategies for different environments
        const cwd = process.cwd() || '/app'
        const __dirname = path.dirname(fileURLToPath(import.meta.url))
        const possiblePaths = [
            path.resolve(cwd, 'public', 'index.html'),
            path.resolve(cwd, '..', 'public', 'index.html'),
            path.resolve('/app', 'public', 'index.html'),
            path.resolve(__dirname, '..', '..', '..', 'public', 'index.html'),
        ]

        let htmlPath: string | null = null
        for (const testPath of possiblePaths) {
            if (fs.existsSync(testPath)) {
                htmlPath = testPath
                break
            }
        }

        if (!htmlPath) {
            throw new Error(`Could not find index.html. Tried paths: ${possiblePaths.join(', ')}`)
        }

        logger.info('Found HTML at', { htmlPath })

        const html = fs.readFileSync(htmlPath, 'utf-8')

        return {
            status: 200 as const,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
            },
            body: html,
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logger.error('Failed to serve frontend', { error: errorMessage })
        // Return 200 with error page so the handler signature stays simple
        return {
            status: 200 as const,
            headers: {
                'Content-Type': 'text/html',
            },
            body: `<html><body><h1>Error loading frontend</h1><p>${errorMessage}</p></body></html>`,
        }
    }
}
