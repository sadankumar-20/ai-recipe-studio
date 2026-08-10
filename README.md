# 🍳 AI Recipe Studio — AI-Powered Recipe Generator

A full-stack AI web application that turns the ingredients you already have into complete, interactive recipes — with live token-by-token streaming, an in-place refinement loop, and a passwordless demo login.

## 🌐 Live Demo

**App:** https://ai-recipe-studio-8xe6.vercel.app  
**API:** https://ai-recipe-studio.vercel.app

> **Demo auth:** no email provider is configured by design — the 6-digit OTP is displayed directly on the login screen, so anyone can try the app with any email address.

---

## ✨ Features

- **AI recipe generation** — enter ingredients (typed or by voice) and get a complete recipe: steps with tips and timings, nutrition, ingredient swaps, and serving-size scaling
- **Live streaming** — recipes stream token-by-token over Server-Sent Events; the title and description appear on the loading screen while the model is still writing
- **Refinement loop** — edit the recipe in place ("make it spicier", "swap the paneer") instead of regenerating from scratch
- **Cuisine explorer** — browse popular cuisines and jump between related dishes
- **Passwordless login** — OTP-based auth with stateless, HMAC-signed codes and session tokens (no database required)
- **Per-user history** — every generated recipe is saved to the signed-in user's drawer and can be reopened exactly as generated
- **Interactive cooking tools** — ingredient checklist, serving slider, step cards, dish photos via Pexels
- **Dark/light theme**, responsive layout, schema-validated AI output on both server and client

---

## 🏗️ Architecture

```
React (Vite) SPA ── axios / fetch+SSE ──▶ Express API (Vercel serverless)
     │                                        │
  Zustand + React Query                   Groq LLM (streaming + JSON mode)
  Zod response validation                 Pexels API · Zod request/response validation
```

Two separate Vercel deployments from one monorepo:

| Project  | Root directory | URL                              |
|----------|----------------|----------------------------------|
| Frontend | `client/`      | ai-recipe-studio-8xe6.vercel.app |
| Backend  | `server/`      | ai-recipe-studio.vercel.app      |

**Serverless-first design decisions:**

- Express runs as a single Vercel function (`server/api/index.ts`) with a catch-all rewrite — no `app.listen` in production
- OTPs are **derived, not stored**: an HMAC of the email + a 5-minute time window, verifiable by any function instance
- Session tokens are **signed payloads** (JWT-style), so no shared session store is needed across instances
- The streamed recipe is only ever rendered from the final, schema-validated `complete` event — raw deltas drive the live preview only, and the client falls back to the non-streaming endpoint if the stream fails

---

## 🛠️ Tech Stack

**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router · TanStack Query · Zustand · Framer Motion · Zod · Axios  
**Backend:** Node.js · Express · TypeScript · Zod  
**AI & data:** Groq (Llama 3.3 70B) — streaming + JSON mode · Pexels API  
**Deployment:** Vercel (two projects, serverless functions, SSE streaming)

---

## 💻 Run Locally

```bash
git clone https://github.com/sadankumar-20/ai-recipe-studio.git
cd ai-recipe-studio
```

**Backend** (runs on http://localhost:4000):

```bash
cd server
npm install
npm run dev
```

**Frontend** (runs on http://localhost:5173):

```bash
cd client
npm install
npm run dev
```

### Environment variables

Create `server/.env`:

```
GROQ_API_KEY=your_groq_api_key
PEXELS_API_KEY=your_pexels_api_key
AUTH_SECRET=any_long_random_string
# optional: GROQ_MODEL=llama-3.3-70b-versatile (default)
# optional: CLIENT_ORIGIN=http://localhost:5173 (default)
```

Optional `client/.env` (defaults to localhost:4000):

```
VITE_API_URL=http://localhost:4000
```

---

## 📂 Project Structure

```
ai-recipe-studio/
├── client/                  # React SPA
│   └── src/
│       ├── pages/           # Landing, Login, Workspace
│       ├── components/      # recipe/, landing/, layout/, search/, loading/
│       ├── services/        # api, auth, recipe (incl. SSE streaming), images
│       ├── store/           # zustand: auth, recipe, ingredients, history, ui
│       ├── schemas/         # zod validation of AI responses
│       └── data/            # cuisine explorer data
└── server/                  # Express API (Vercel serverless)
    ├── api/index.ts         # serverless entry
    └── src/
        ├── routes/          # auth, generate (+ /stream SSE), images, feedback
        ├── services/        # groq, auth (stateless HMAC), pexels
        ├── prompts/         # system + user prompt builders
        └── validators/      # zod request/response schemas
```

---

## 🔮 Roadmap

- Favorites (star and browse saved recipes)
- Real email OTP delivery (Resend) as an alternative to demo mode
- Route-level code splitting
- Grocery list generation & meal planner
- Multi-language support

---

## 👨‍💻 Developer

**Sadan K** — B.Tech, Data Science & AI, IIIT Dharwad  
GitHub: https://github.com/sadankumar-20

⭐ If you found this project interesting, consider giving it a star!
