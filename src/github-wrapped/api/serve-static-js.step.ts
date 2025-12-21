// Serve JS Static Files
import { ApiRouteConfig, Handlers } from 'motia'
import { z } from 'zod'
import * as fs from 'fs'
import * as path from 'path'

export const config: ApiRouteConfig = {
    type: 'api',
    name: 'ServeStaticJS',
    description: 'Serves JS files from public/js directory',
    flows: ['github-wrapped'],
    method: 'GET',
    path: '/static/js/:filename',
    responseSchema: {
        200: z.any(),
        404: z.object({ error: z.string() }),
    },
    emits: [],
}

export const handler: Handlers['ServeStaticJS'] = async (req, { logger }) => {
    const { filename } = req.pathParams
    const sanitized = path.basename(filename)
    const cwd = process.cwd() || '/app'
    
    const possiblePaths = [
        path.resolve(cwd, 'public', 'js', sanitized),
        path.resolve(cwd, '..', 'public', 'js', sanitized),
        path.resolve('/app', 'public', 'js', sanitized),
    ]

    logger.info('Serving JS file', { filename: sanitized })

    let filePath: string | null = null
    for (const testPath of possiblePaths) {
        if (fs.existsSync(testPath)) {
            filePath = testPath
            break
        }
    }

    if (!filePath) {
        logger.warn('JS file not found', { filename: sanitized, triedPaths: possiblePaths })
        return { status: 404, body: { error: `File "${sanitized}" not found` } }
    }

    const content = fs.readFileSync(filePath)
    return {
        status: 200,
        headers: { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=31536000' },
        body: content,
    }
}
