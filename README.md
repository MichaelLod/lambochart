# lambochart

Brainstorm your product idea before you start vibe coding it.

lambochart is a tool that helps you think through your business idea, then visualizes the full product lifecycle as an interactive flowchart — from concept to strategy to what's actually achievable.

## How it works

1. **Connect** — Link your AI API key through [Byoky](https://github.com/MichaelLod/byoky) (your keys never leave your device)
2. **Brainstorm** — Chat with AI to refine your idea, target audience, and value proposition
3. **Visualize** — Generate an interactive flowchart showing phases, strategies, risks, milestones, and achievable outcomes

## Flowchart node types

| Type | Color | Purpose |
|------|-------|---------|
| Idea | Purple | Core product concept |
| Phase | Blue | Development stages (MVP, Beta, Launch, Scale) |
| Strategy | Violet | Decision points and approaches |
| Milestone | Green | Measurable achievements |
| Risk | Pink | Blockers and challenges |
| Outcome | Amber | Achievable end states |

## Tech stack

- [React](https://react.dev) + TypeScript
- [Vite](https://vite.dev) for builds
- [Tailwind CSS](https://tailwindcss.com) for styling
- [React Flow](https://reactflow.dev) for flowchart visualization
- [Byoky SDK](https://github.com/MichaelLod/byoky) for secure AI API access

## Development

```bash
npm install
npm run dev
```

## Requirements

- [Byoky](https://github.com/MichaelLod/byoky) browser extension or mobile app
- An AI API key (Anthropic or OpenAI) added to your Byoky wallet

## License

MIT
