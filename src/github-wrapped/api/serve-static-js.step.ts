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
    const filePath = path.resolve(process.cwd(), 'public', 'js', sanitized)

    logger.info('Serving JS file', { filename: sanitized })

    if (!fs.existsSync(filePath)) {
        return { status: 404, body: { error: `File "${sanitized}" not found` } }
    }

    const content = fs.readFileSync(filePath)
    return {
        status: 200,
        headers: { 'Content-Type': 'application/javascript', 'Cache-Control': 'public, max-age=31536000' },
        body: content,
    }
}
