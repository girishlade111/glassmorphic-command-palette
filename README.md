# Glassmorphic Command Palette

A stunning **glassmorphic (frosted-glass) command palette + AI chat interface** floating over an iridescent background. Press a key to open a ⌘K-style command menu with fuzzy search and quick actions — or switch to the chat mode and talk to Google Gemini (streaming responses) right inside the palette. Built with Next.js 15, Framer Motion animations, and Tailwind CSS.

## What it does

Two experiences in one floating UI:

1. **Command palette** — macOS Spotlight / VS Code style ⌘K menu:
   - Fuzzy search across commands, files, folders, tags
   - Grouped results (actions, files, navigation) with icons
   - Keyboard navigation (↑/↓, Enter, Esc)
   - Frosted-glass cards with backdrop blur over a live background
2. **AI chat** — conversational mode inside the same palette:
   - Streaming responses from Google Gemini (gemini-1.5-flash)
   - Markdown-rendered replies
   - Conversation history preserved per session

## Features

- ✅ ⌘K-style command palette with fuzzy search
- ✅ Glassmorphism design — backdrop-blur, translucent cards, iridescent background
- ✅ Buttery Framer Motion open/close + list animations
- ✅ Gemini-powered AI chat with streaming (Vercel AI SDK)
- ✅ Markdown rendering for chat responses (`react-markdown`)
- ✅ Keyboard-first navigation
- ✅ Lucide icons throughout

## Tech stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS, Framer Motion |
| AI | Google Gemini 1.5 Flash via `@google/generative-ai` + Vercel `ai` SDK |
| Markdown | react-markdown |
| Icons | lucide-react |
| Language | TypeScript |

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Add your Gemini API key (required for chat mode)
cp .env.example .env.local
# then set GOOGLE_API_KEY=your-key-here
# (get one free at https://aistudio.google.com)

# 3. Run the dev server
npm run dev
# open http://localhost:3000
```

The command palette itself works **without** an API key — only AI chat needs one.

## Project structure

```
glassmorphic-command-palette/
├── app/
│   ├── page.tsx              # Home — background + unified interface
│   ├── layout.tsx
│   ├── globals.css
│   └── api/chat/route.ts     # Streaming Gemini chat endpoint (POST)
├── components/
│   ├── unified-interface.tsx # Toggles between palette and chat
│   ├── command-palette.tsx   # Fuzzy-search command menu
│   ├── chat-interface.tsx    # Streaming chat UI
│   └── theme-provider.tsx
├── lib/utils.ts
├── public/images/            # Background artwork
└── next.config.mjs
```

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `GOOGLE_API_KEY` | Yes (chat only) | Google AI Studio key for Gemini chat. Free tier available at https://aistudio.google.com |

The palette UI runs without any env vars.

## Deployment

This app needs a **server** (the `/api/chat` route streams from Gemini using a secret key), so it
can't be a static site. Deploy to any Node host:

- **Vercel** (recommended): `vercel` — set `GOOGLE_API_KEY` in project env vars
- **Any Node server / Docker**: `npm run build && npm start` with `GOOGLE_API_KEY` set

> No public deploy URL is set on this repo yet — it needs a Gemini API key to run fully.

## Security note

Next.js 15 is pinned at **15.2.8** (patched for CVE-2025-55182 "React2Shell"). Keep it updated.

## Credits

Built by Girish Lade — https://ladestack.in

Originally generated with [v0.app](https://v0.app) and refined into a standalone project.
