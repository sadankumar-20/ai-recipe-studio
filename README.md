# AI Recipe Studio

Turn ingredients into an interactive cooking experience.

This is **not a chatbot**. Log in with a one-time email code, browse by
cuisine, search a dish by name, or list what's in your fridge — the backend
asks Groq for a single structured JSON object, and the JSON is rendered into
a real, interactive recipe workspace with real food photography pulled live
from Pexels. No AI text is ever rendered as a chat message.

---

## 1. Setup

### Prerequisites
- Node.js 18+ (built and tested on Node 22 — the image proxy uses native
  `fetch`, which requires Node 18+)
- A [Groq API key](https://console.groq.com/keys) and a
  [Pexels API key](https://www.pexels.com/api/) — working keys for both are
  already filled into `server/.env` for local testing; swap in your own for
  production use

### Backend

```bash
cd server
npm install
npm run dev        # starts on http://localhost:4000
```

### Frontend

```bash
cd client
cp .env.example .env       # VITE_API_URL=http://localhost:4000
npm install                 # if you unzipped this project, delete node_modules
                             # first — the shipped copy targets macOS native
                             # bindings and will not run on Linux/Windows
npm run dev                  # starts on http://localhost:5173
```

Open `http://localhost:5173` — you'll land on the login screen first.

> **Note on the zipped `node_modules`:** if `npm run dev`/`build` fails with
> a "Cannot find native binding" error, run
> `rm -rf node_modules package-lock.json && npm install` inside `client/`.

---

## 2. Logging in (important — read this)

The login screen asks for an email and sends a 6-digit one-time code.
**No real email provider is configured** — this is a portfolio/demo project,
so instead of sending an actual email, the backend:

1. Prints the code to the **server terminal** (the one running `npm run dev`
   in `server/`), and
2. Echoes it directly in the UI under the OTP field ("Demo mode — your code
   is `123456`") so you don't have to go hunting in logs.

To go live with real email delivery, wire a provider (Resend, SendGrid,
Postmark, etc.) into `server/src/routes/auth.route.ts` where the `console.log`
call is, and remove the `devOtp` field from the response.

Sessions are kept **in memory** on the server (per the project's "no
database" constraint) — restarting the backend logs everyone out. Checking
"Remember this device" extends the session lifetime from 1 day to 30 days;
either way the browser holds the session token in `localStorage`.

---

## 3. How to use it

Once logged in, there are three ways to get a recipe:

1. **Browse by cuisine** — click a cuisine chip (Indian, Italian, Healthy...)
   under "Explore" → pick a region (e.g. South Indian) from the box grid,
   each shown with a real photo pulled from Pexels → flip a dish-group card
   (e.g. Dosa) to reveal specific varieties → tap one (e.g. Masala Dosa) to
   generate that exact recipe.
2. **Search a dish by name** — type it into a variety card, or list it as an
   ingredient in the search bar (the search bar is ingredients-only by
   design — for a direct dish lookup, use the explorer).
3. **Cook from what you have** — add ingredients as chips in the search bar
   and hit Generate; the AI builds a recipe around what's in your fridge.

In the Workspace: check off ingredients, flip step cards for extra chef
tips, drag the serving slider to rescale quantities, see related dish
suggestions at the bottom (when you arrived via the explorer), and tap
**"I made this!"** for a congratulatory thumbs-up animation plus a quick
star-rating/feedback form.

**Top-right of the navbar:**
- A **sun/moon toggle** switches between dark and light themes (persisted
  across visits).
- Your **avatar** (first letter of your email) opens a slide-in drawer from
  the right with your account info and a **history** panel showing every
  dish you've generated, with relative timestamps and a running count.

---

## 4. Architecture

```
Login: email → OTP (demo-mode, shown on screen) → session token
        │
        ▼
Landing (protected route): cuisine explorer OR ingredient search
        │
        ▼
POST /generate  →  Express (validates body with Zod — either
                    { ingredients: string[] } or { dishName, cuisineHint })
        │
        ▼
Groq chat.completions (json_object mode, strict system prompt)
        │
        ▼
Server re-validates the model's JSON with Zod (recipeSchema)
        │
        ▼
Client re-validates the same JSON again with an identical Zod schema
        │
        ▼
Zustand recipeStore (+ sourceContext for related-dish suggestions)
        │
        ▼
React renders the Workspace — including a FoodImage component that calls
GET /images/search?query=... (a thin server-side proxy to the Pexels API,
so the Pexels key never reaches the browser) for every cuisine box, dish
card, and recipe header
        │
        ▼
"I made this!" → POST /feedback → appended to server/data/feedback.jsonl
Every generated recipe → logged to the History drawer (client-side, keyed
by the signed-in user's email)
```

The backend has four route groups: `POST /generate` (the AI gateway),
`POST /feedback` (file-based, not a database), `POST/GET /auth/*` (OTP +
in-memory sessions), and `GET /images/search` (the Pexels proxy). No real
database, no third-party auth provider — everything is self-contained.

The cuisine → region → dish-group → variety hierarchy is **static, curated
data** (`client/src/data/exploreData.ts`); only the photography and the
recipe content itself are fetched live.

---

## 5. Folder structure

```
client/src/
  components/
    auth/       ProtectedRoute (redirects to /login if not authenticated)
    common/     Logo, FoodImage (Pexels-backed image with graceful fallback)
    layout/     Navbar, Footer, ThemeToggle, UserDrawer
    landing/    Hero, FeatureCards
    explore/    CuisineChips, RegionBox, DishGroupFlipCard, CuisineExplorer
    search/     SearchBar, IngredientChip, VoiceButton, SuggestionsDropdown
    loading/    RecipeLoading (skeleton + rotating tips)
    recipe/     RecipeHeader, IngredientChecklist, CookingSteps, StepCard,
                ServingSlider, NutritionCards, IngredientSwaps, CookingTips,
                RelatedDishes, PreparedFeedback
    ui/         Button, Badge
  data/         exploreData.ts (cuisine → region → dish-group → variety tree)
  hooks/        useDebounce, useIngredientSuggestions, useVoiceInput
  pages/        Landing.tsx, Workspace.tsx, Login.tsx
  schemas/      recipe.schema.ts (Zod — mirrors the server schema)
  services/     api.ts, recipe.service.ts, auth.service.ts, image.service.ts
  store/        recipeStore, ingredientStore, uiStore (theme + drawer),
                authStore (session, persisted), historyStore (per-user
                dish history, persisted)
  types/        recipe.types.ts
  constants/    ingredient suggestions, loading copy
  utils/        scaleQuantity (serving-slider math)
  public/       food-collage.jpg (used for the login screen's blurred
                background and the landing page's ambient backdrop)

server/src/
  routes/       generate.route.ts, feedback.route.ts, auth.route.ts,
                images.route.ts
  services/     groq.service.ts, feedback.service.ts, auth.service.ts
                (in-memory OTP + sessions), pexels.service.ts (cached proxy)
  validators/   recipe.schema.ts — all Zod request/response schemas
  prompts/      recipe.prompt.ts
  app.ts        Express app (cors, json body limit, 404, error handler)
  server.ts     entrypoint
```

---

## 6. How the AI and third-party APIs are used

- **Groq** — one chat-completion call per generate/regenerate action
  (`openai/gpt-oss-120b` by default), using `response_format: { type:
  "json_object" }`. The response is validated with Zod on both the server
  and the client before it's ever rendered.
- **Pexels** — a single server-side proxy route (`GET /images/search`)
  caches results in memory for 30 minutes and returns just a photo URL; the
  API key never reaches the browser. The client also caches per-query
  promises so the same dish/region photo is only fetched once per session.
- Neither integration is a chatbot — both are invoked behind ordinary REST
  calls and rendered into typed UI, never as raw text.

## 7. Assignment compliance (Frontend Internship — Fridge-to-recipe)

This project was built against the "Fridge-to-recipe" option of the
Frontend Internship take-home. Mapped explicitly against the brief:

**Core requirements**
- ✅ React with hooks and functional components throughout (no class
  components anywhere).
- ✅ Free-form text input — the ingredient search bar (list what you have)
  plus the cuisine → region → dish-group → variety explorer as a second,
  non-text path to the same generation flow.
- ✅ A real LLM API (Groq), called from a small Express backend — the API
  key is never sent to or used from the browser (see section 6).
- ✅ The model returns structured JSON only (`response_format:
  "json_object"`, a strict system prompt, and Zod validation) which the
  frontend parses into typed, interactive, stateful UI — never a chatbot,
  never raw model text rendered directly.
- ✅ **Handles bad AI output** — this was treated as the highest-weighted,
  highest-signal requirement (20% of the rubric) and got the most iteration:
  - Malformed/truncated JSON → caught, retried once server-side, then
    surfaced as a friendly error (never a crash).
  - Wrong shape / unexpected types → the Zod schema tolerates real-world AI
    looseness (e.g. `quantity: "a pinch"` instead of a number,
    `difficulty: "medium"` instead of `"Medium"`) by coercing what it can
    and falling back sensibly, rather than hard-failing the whole recipe
    over one messy field. (This was a real bug found and fixed during
    development — see the git history / commit notes.)
  - Empty response → explicit `GroqServiceError` with a clear message.
  - Slow / failed request → request timeout, network-failure retry (once),
    and distinct error copy per failure mode (`NETWORK`, `TIMEOUT`,
    `SCHEMA`, `SERVER`, `ABORTED`).
  - **Stale response protection** — every generate call aborts any
    in-flight previous request first (`AbortController` in
    `recipe.service.ts`), so a slow first request can never overwrite a
    faster second one.
- ✅ Loading, error, and empty states — a custom skeleton + rotating tips
  loader (not a spinner), inline error banners with retry-by-resubmitting,
  and an explicit "no recipe yet" empty state on the Workspace.
- ✅ Works on mobile — mobile-first Tailwind layout throughout (single
  column by default, `sm:`/`lg:` breakpoints add columns), tested down to
  narrow viewports.
- ✅ README with setup, AI-usage note, known limitations, and time spent
  (this file).

**Stretch goals attempted**
- ✅ Different block types rendered from the same JSON shape — a checklist
  (ingredients), flip cards (steps), stat cards (nutrition), and swap cards
  (substitutions) are all driven by one `Recipe` object, not one generic
  block renderer.
- ✅ Save and reload sessions — two layers: every generated recipe is saved
  (full payload, not just the title) to the history drawer, so tapping a
  past entry reopens that exact recipe instantly with no re-generation; and
  the current in-progress recipe/ingredient list is also persisted to
  `localStorage` directly, so a hard page refresh doesn't lose your place
  either.
- ✅ Polish — Framer Motion throughout, a light/dark theme toggle, and
  keyboard navigation in the ingredient search (arrow keys + Enter through
  suggestions, Escape to dismiss, Backspace to remove the last chip).
- ❌ **Streaming** — not implemented. The response is awaited in full before
  rendering. What I'd do next: switch the Groq call to `stream: true` and
  progressively reveal sections of the Workspace as parseable chunks of the
  JSON arrive (title/description first, then ingredients, then steps),
  falling back to the current full-response flow if a stream disconnects
  partway through.
- ❌ **Refinement loop** (follow-up prompts that edit the existing recipe in
  place, e.g. "make it spicier" or "swap out the paneer") — not
  implemented; every regenerate currently creates a brand-new recipe rather
  than editing the current one. What I'd do next: add a follow-up input on
  the Workspace that sends the current recipe JSON plus the edit instruction
  back to Groq with a prompt that says "modify only what's requested, keep
  everything else the same," then re-validate and re-render.

**Scope beyond the brief** — the login/OTP flow, light/dark theme, and
Pexels imagery were built as extra polish, not because the assignment
required them (its own FAQ says "Authentication? Not needed"). They don't
substitute for the graded core (AI integration, bad-output handling,
frontend architecture) — that work is entirely in the recipe
generation/validation/rendering pipeline described above.

## 8. AI usage disclosure

This project (all application code, prompts, and this README) was generated
with the assistance of Claude based on a detailed project specification.

## 9. Known limitations

- **OTP emails are not actually sent** — see section 2. This is a demo
  auth flow, not production-ready without a real email provider.
- Sessions and OTPs live in server memory only; restarting the backend logs
  every user out.
- Dish/history data is stored per-browser (localStorage), not server-side —
  logging in as the same email on a different device won't show the same
  history. Within the same browser, though, history entries store the full
  recipe (not just the title), so tapping a past entry reopens that exact
  session instantly, with no re-generation.
- Pexels image results are generic stock photography matched by search
  query, not photos of the exact AI-generated recipe.
- Voice input relies on the browser `SpeechRecognition` API (Chrome/Edge
  support is solid; Firefox/Safari support is inconsistent or absent).
- Ingredient-quantity scaling is a simple linear scale; it doesn't apply
  culinary judgment.
- The explore hierarchy has full depth for Indian cuisine (per the spec)
  and a lighter selection for the other five cuisine chips.
- Feedback is stored to a local file (`server/data/feedback.jsonl`), not a
  real database — by design.

## 10. Time spent

Approximately 12-14 hours end-to-end across the full build: architecture and
prompt design, the landing/explorer/workspace UI, the OTP auth flow and
protected routing, the Pexels image proxy (plus curated local overrides for
dishes where stock search was unreliable), light/dark theming, the history
drawer with full session save/reload, and a significant pass specifically on
bad-AI-output handling — making the ingredient/nutrition/duration schema
tolerant of real-world LLM looseness (non-numeric quantities, inconsistent
casing) after finding it was silently breaking certain recipes.
