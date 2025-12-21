# GitHub Wrapped 2025

Generate personalized GitHub statistics and achievements for any user. Analyzes GitHub activity and presents stunning visual cards with your coding journey.

## ✨ Features

- GitHub stats analysis (repositories, contributions, languages, activity)
- Achievement system with badges based on activity patterns
- Interactive frontend with smooth animations
- Asynchronous event-driven architecture
- Shareable wrapped statistics as images
- Scheduled generation via cron jobs

## 🚀 Quick Start

**Prerequisites**: Node.js 18+, Redis, Internet connection

```bash
# Install and generate types
npm install
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
src/
├── github-wrapped/           # Main application logic
│   ├── api/                  # HTTP API endpoints
│   │   ├── generate-wrapped.step.ts   # POST /wrapped/:username - Trigger wrapped generation
│   │   ├── get-wrapped.step.ts        # GET /wrapped/:username - Retrieve results
│   │   ├── get-wrapped-status.step.ts # GET /wrapped/:username/status - Check progress
│   │   ├── get-badge.step.ts          # GET /badge/:username - Share badge
│   │   ├── serve-frontend.step.ts     # GET /app - Frontend HTML
│   │   └── serve-static-*.step.ts     # Static file serving (CSS, JS)
│   ├── events/               # Background event processing
│   │   ├── fetch-github-data.step.ts  # Fetch user's GitHub data
│   │   ├── calculate-stats.step.ts    # Analyze and calculate statistics
│   │   ├── generate-achievements.step.ts # Award badges
│   github-wrapped/
├── api/              # HTTP endpoints (generate, get results, status, badges, frontend)
├── events/           # Background tasks (fetch data, calculate stats, generate achievements)
├── cron/             # Scheduled jobs
└── services/         # Business logic (GitHub API, badges, analytics)

public/
├── index.html        # Frontend application
├── css/              # Stylesheets (animations, components, cards)
└── js/               # Client-side code (main, api, state, utils)

Response:
{
  "status": "processing",
  "message": "Wrapped generation started",
  "traceId": "uuid",
  "username": "octocat"
}
```

### Get Wrapped Results
```http
GET /wrapped/:username

Response:
{
  "username": "octocat",
  "year": 2025,
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/wrapped/:username` | Trigger wrapped generation (optional: `year`, `token` in body) |
| GET | `/wrapped/:username` | Get completed wrapped results |
| GET | `/wrapped/:username/status` | Check generation progress |
| GET | `/badge/:username` | Get shareable badge |
| GET | `/app` | Frontend application |
Create a `.env` file if needed:

```env
# Redis connection (optional, defaults to localhost:6379)
REDIS_URL=redis://localhost:6379

# GitHub API (optional, public API works but with rate limits)
GITHUB_TOKEN=your_github_token_here

# Server
PORT=3000
```

## 🧪 Development

### Generate Types
After modifying step definitions (config), regenerate TypeScript types:

```bash
npx motia generate-types
```

This creates `types.d.ts` with auto-generated types for all steps.

### View Workflow
Open the Motia Workbench visual editor to see the event flow:
```bash
npm run dev
# Visit http://localhost:3000/workbench
```

### Adding New Features

1. **New API Endpoint**: Create a file in `src/github-wrapped/api/` named `*.step.ts`
2. **New Background Task**: Create a file in `src/github-wrapped/events/` named `*.step.ts`
3. **New Scheduled Job**: Create a file in `src/github-wrapped/cron/` named `*.step.ts`
4. **Run types generation**: `npx motia generate-types`

See `.cursor/rules/` directory for detailed guides on creating each step type.

## � Key Metrics Calculated

- **Total Repositories**: Count of user's public repositories
- **Total Commits**: Aggregate commits across repositories
- **Total Pull Requests**: PRs opened and closed
- **Top Languages**: Most used programming languages
- **Contribution Calendar**: Activity pattern heatmap
- **Collaboration Score**: Open source contribution level
- **Consistency**: Streak of consecutive contribution days

## 🎨 Achievement Badges

The application awards achievements based on user activity:
- **Open Source Contributor** - Active in public repositories
- **Language Master** - Proficient in multiple languages
**Stack**: [Motia](https://motia.dev) (event-driven backend) · TypeScript · BullMQ/Redis · Vanilla JS · Zod

**Event Flow**: User submits → Fetch GitHub data → Calculate stats → Generate achievements → Finalize → Return results

**State**: Uses Motia's state plugin for wrapped data, processing status, and

## 🛠️ Troubleshooting
```bash
npm run build  # Production build
npm run start  # Run production server
```

Ensure Redis is running. Docker example:
```bash
docker run -d -p 6379:6379 redis:latest
```

## 🛠️ Troubleshooting

- **Rate limits**: Provide GitHub token in API body (public API: 60 req/hour)
- **Redis issues**: Check with `redis-cli ping` (should return `PONG`)
- **Hot reload**: Use `npm run dev` for development, not `npm start
npx motia generate-types
```

**View workflow** in Workbench:
```bash
npm run dev  # Then visit /workbench
```

**Add features**: Create `*.step.ts` in `api/`, `events/`, or `cron/` directories, then run `npx motia generate-types`

See `.cursor/rules/` for detailed step creation guides## 📊 Metrics & Achievements

**Key Metrics**: Total repositories, commits, pull requests, top languages, contribution calendar, collaboration score, contribution streaks

**AchiResources

- [Motia Documentation](https://motia.dev/docs)
- `.cursor/rules/motia/` - Step creation guides
- `AGENTS.md` - AI development guide

---

**Built with [Motia](https://motia.dev)** - Event-driven backend  and emphasize on the usage of motiaframework