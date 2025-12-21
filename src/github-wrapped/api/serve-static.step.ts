// Serve Static Files API Step
// GET /static/:filename - Serves static files from public directory

import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import * as fs from 'fs'
import * as path from 'path'

const MIME_TYPES: Record<string, string> = {
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.gif': 'image/gif',
    '.ico': 'image/x-icon',
    '.mp3': 'audio/mpeg',
    '.html': 'text/html',
}

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'ServeStatic',
    description: 'Serves static files from public directory',
    flows: ['github-wrapped'],
    method: 'GET',
    path: '/static/:filename',
    responseSchema: {
        200: z.any(),
        404: z.object({
            error: z.string(),
        }),
    },
    emits: [],
}

export const handler: Handlers['ServeStatic'] = async (req, { logger }) => {
    const { filename } = req.pathParams

    logger.info('Serving static file', { filename })

    try {
        const sanitizedFilename = path.basename(filename)
        const cwd = process.cwd() || '/app'
        
        // Try multiple locations
        const possiblePaths = [
            path.resolve(cwd, 'public', sanitizedFilename),
            path.resolve(cwd, '..', 'public', sanitizedFilename),
            path.resolve('/app', 'public', sanitizedFilename),
        ]

        let filePath: string | null = null
        for (const testPath of possiblePaths) {
            if (fs.existsSync(testPath)) {
                filePath = testPath
                break
            }
        }

        if (!filePath) {
            logger.warn('File not found', { filename, triedPaths: possiblePaths })
            return {
                status: 404,
                body: { error: 'File not found' },
            }
        }

        // Check if file exists
        if (!fs.existsSync(filePath)) {
            logger.warn('Static file not found', { filePath })
            return {
                status: 404,
                body: {
                    error: `File "${sanitizedFilename}" not found`,
                },
            }
        }

        // Get file extension and mime type
        const ext = path.extname(sanitizedFilename).toLowerCase()
        const mimeType = MIME_TYPES[ext] || 'application/octet-stream'

        // Read file as buffer for binary files
        const content = fs.readFileSync(filePath)

        return {
            status: 200,
            headers: {
                'Content-Type': mimeType,
                'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
            },
            body: content,
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        logger.error('Failed to serve static file', { error: errorMessage })
        return {
            status: 500,
            body: {
                error: `Failed to serve file: ${errorMessage}`,
            },
        }
    }
}
