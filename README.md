# GitHub Wrapped 2025

Generate personalized GitHub statistics and achievements for any user. Analyzes GitHub activity and presents stunning visual cards with your coding journey.

Built with **[Motia](https://motia.dev)** - an event-driven backend framework for building scalable, type-safe applications.

## ✨ Features

- **GitHub Stats Analysis** - Repositories, contributions, languages, and activity patterns
- **Achievement System** - Badges awarded based on your coding journey
- **Interactive Frontend** - Beautiful cards with smooth animations
- **Event-Driven Architecture** - Asynchronous processing with Motia
- **Shareable Images** - Download high-quality wrapped statistics
- **Scheduled Generation** - Automated daily processing via cron jobs

## 🚀 Quick Start

**Prerequisites**: Node.js 18+, Redis (auto-started in dev mode)

```bash
# Install dependencies
npm install

# Generate TypeScript types
npx motia generate-types

# Run development server
npm run dev

# Or production server
npm run start
```

**Access**:
- Frontend: `http://localhost:3000/app`
- Workbench: `http://localhost:3000/workbench`

## 📁 Project Structure

```
src/github-wrapped/
├── api/                      # HTTP API endpoints
│   ├── generate-wrapped.step.ts      # POST /wrapped/:username
│   ├── get-wrapped.step.ts           # GET /wrapped/:username
│   ├── get-wrapped-status.step.ts    # GET /wrapped/:username/status
│   ├── get-badge.step.ts             # GET /badge/:username
│   ├── serve-frontend.step.ts        # GET /app
│   └── serve-static-*.step.ts        # Static assets (CSS, JS)
├── events/                   # Background event processing
│   ├── fetch-github-data.step.ts     # Fetch user's GitHub data
│   ├── calculate-stats.step.ts       # Analyze and calculate statistics
│   ├── generate-achievements.step.ts # Award badges
│   └── finalize-wrapped.step.ts      # Assemble final results
├── cron/                     # Scheduled jobs
│   └── schedule-generate.step.ts     # Daily wrapped generation
└── services/                 # Business logic
    ├── github.service.ts             # GitHub API integration
    ├── analytics.service.ts          # Stats calculation
    └── badge.service.ts              # Badge generation

public/
├── index.html                # Frontend application
├── css/                      # Stylesheets (animations, components, cards)
└── js/                       # Client-side code (main, api, state, utils)
```

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/wrapped/:username` | Trigger wrapped generation (optional: `year`, `token` in body) |
| GET | `/wrapped/:username` | Get completed wrapped results |
| GET | `/wrapped/:username/status` | Check generation progress |
| GET | `/badge/:username` | Get shareable badge image |
| GET | `/app` | Frontend application |

### Example: Generate Wrapped

```bash
# Generate wrapped for a user
curl -X POST http://localhost:3000/wrapped/octocat \
  -H "Content-Type: application/json" \
  -d '{"year": 2025}'

# Response
{
  "status": "processing",
  "message": "Wrapped generation started",
  "traceId": "uuid",
  "username": "octocat"
}
```

### Example: Check Status

```bash
curl http://localhost:3000/wrapped/octocat/status

# Response
{
  "username": "octocat",
  "status": "completed",
  "progress": 100
}
```

## 📊 Key Metrics Calculated

- **Total Repositories** - Count of user's public repositories
- **Total Commits** - Aggregate commits across repositories
- **Total Pull Requests** - PRs opened, merged, and reviewed
- **Top Languages** - Most used programming languages with percentages
- **Contribution Calendar** - Activity pattern heatmap
- **Streak Analysis** - Longest and current contribution streaks
- **Collaboration Score** - Squad members and shared projects

## 🎨 Achievement Badges

The application awards achievements based on user activity:
- **Open Source Hero** - Active in public repositories
- **Language Polyglot** - Proficient in multiple languages
- **Night Owl** - Most commits after midnight
- **Weekend Warrior** - Consistent weekend contributions
- **Streak Master** - Long contribution streaks
- **Early Adopter** - Account age on GitHub

## 🔧 Configuration

Create a `.env` file for custom configuration (optional):

```env
# Redis connection (defaults to localhost:6379)
REDIS_URL=redis://localhost:6379

# GitHub API token (optional, increases rate limits)
GITHUB_TOKEN=your_github_token_here

# Server port
PORT=3000
```

## 🏗️ Built with Motia

This project showcases the power of the **Motia framework**:

**Event-Driven Flow**: 
```
User Request → Fetch GitHub Data → Calculate Stats → Generate Achievements → Finalize → Return Results
```

**Key Motia Features Used**:
- **API Steps** - HTTP endpoints with Zod validation
- **Event Steps** - Background processing with BullMQ
- **Cron Steps** - Scheduled tasks
- **State Plugin** - Redis-backed state management
- **Workbench** - Visual flow editor for debugging

## 🧪 Development

### Generate Types
After modifying step definitions, regenerate TypeScript types:

```bash
npx motia generate-types
```

This creates `types.d.ts` with auto-generated types for all steps.

### View Workflow in Workbench
Open the Motia Workbench to visualize the event flow:

```bash
npm run dev
# Visit http://localhost:3000/workbench
```

### Adding New Features

1. **New API Endpoint**: Create `src/github-wrapped/api/*.step.ts`
2. **New Background Task**: Create `src/github-wrapped/events/*.step.ts`
3. **New Scheduled Job**: Create `src/github-wrapped/cron/*.step.ts`
4. **Run type generation**: `npx motia generate-types`

See `.cursor/rules/` directory for detailed guides on creating each step type.

## 🛠️ Troubleshooting

**Rate Limits**: GitHub public API has 60 req/hour. Provide a token in the request body:
```bash
curl -X POST http://localhost:3000/wrapped/username \
  -d '{"token": "ghp_your_token_here"}'
```

**Redis Issues**: Ensure Redis is accessible. Check with:
```bash
redis-cli ping  # Should return PONG
```

Docker alternative:
```bash
docker run -d -p 6379:6379 redis:latest
```

**Hot Reload**: Use `npm run dev` for development with hot module replacement, not `npm start`.

**Type Errors**: After changing step configs, always run:
```bash
npx motia generate-types
```

## 📚 Resources

- [Motia Documentation](https://motia.dev/docs) - Complete framework guide
- [`.cursor/rules/motia/`](.cursor/rules/motia/) - Step creation patterns
- [`AGENTS.md`](AGENTS.md) - AI development guide
- [Motia Examples](https://motia.dev/docs/examples) - More projects

## 📄 License

MIT

---

**Built with [Motia](https://motia.dev)** - Event-driven backend framework · TypeScript · BullMQ · Redis · Zod