# AI Recipe Studio

Turn whatever's in your fridge into a recipe you can actually cook from.

This is not a chatbot. You log in with a one-time email code, then either
browse dishes by cuisine or list your ingredients. The backend asks Groq
for a single structured JSON object, validates it, and the frontend renders
that JSON into an interactive workspace: a tappable ingredient checklist, a
serving slider that rescales quantities live, flippable step cards with
chef tips on the back, and real food photos pulled from Pexels. Raw model
text is never shown anywhere.

Built for the "Fridge-to-recipe" option of the Frontend Internship
take-home.

---

## Setup

You'll need Node.js 18 or newer (I built it on Node 22 — the image proxy
uses native `fetch`), plus two free API keys:

- a [Groq key](https://console.groq.com/keys) for recipe generation
- a [Pexels key](https://www.pexels.com/api/) for food photos. This one is
  optional; without it the app still runs and shows emoji tiles instead of
  photos.

### Backend

```bash
cd server
npm install
cp .env.example .env   # open .env and paste your Groq + Pexels keys
npm run dev            # http://localhost:4000
```

### Frontend

```bash
cd client
cp .env.example .env   # VITE_API_URL=http://localhost:4000
npm install
npm run dev            # http://localhost:5173
```

Open http://localhost:5173 and you'll land on the login screen.

### Testing on a phone

Run the frontend with `npm run dev -- --host`, then point `VITE_API_URL`
(in `client/.env`) and `CLIENT_ORIGIN` (in `server/.env`) at your
machine's LAN IP instead of localhost, restart both, and open
`http://<LAN-IP>:5173` on a phone connected to the same Wi-Fi.

### About the login

The login asks for an email and a 6-digit code, but no real email provider
is wired up — this is a demo flow. The code gets printed to the server
terminal and also echoed straight into the UI under the OTP field, so you
never have to dig through logs. Sessions live in server memory (no
database in this project), which means restarting the backend logs
everyone out. "Remember this device" stretches the session from 1 day to
30.

---

## How to use it

Three ways to get a recipe:

1. Browse by cuisine. Click a chip under "Explore" (Indian, Italian,
   Healthy...), pick a region like South Indian, flip a dish-group card
   such as Dosa, and tap a specific variety like Masala Dosa.
2. Search a dish by name through the explorer's variety cards.
3. List what you have. Add ingredients as chips in the search bar and hit
   Generate — the AI builds a recipe around them.

While the recipe generates, its title and description show up live on the
loading screen as the model writes them.

In the workspace you can check off ingredients against a progress bar,
flip any step card for an extra tip, and drag the serving slider — every
quantity rescales instantly, no regeneration needed. The "Refine this
recipe" bar takes a follow-up instruction like "make it spicier" or "swap
out the paneer" and edits the recipe in place rather than starting over.
When you're done cooking, "I made this!" triggers a small celebration and
a star-rating form.

Top-right of the navbar: a sun/moon toggle for light/dark theme
(persisted), and your avatar opens a drawer with your account plus a
history of every dish you've generated. Tapping a history entry reopens
that exact recipe instantly.

---

## Architecture

```
Login: email → OTP (demo mode, shown on screen) → session token
        │
        ▼
Landing (protected route): cuisine explorer OR ingredient search
        │
        ▼
POST /generate/stream (SSE; falls back to POST /generate)
        │  Express validates the body with Zod first:
        │  { ingredients: string[] } or { dishName, cuisineHint }
        ▼
Groq chat completion — strict system prompt; streamed deltas drive a
live title/description preview, never the rendered state
        │
        ▼
Server validates the assembled JSON with Zod before sending the
terminal "complete" event
        │
        ▼
Client re-validates the same JSON with an identical Zod schema
        │
        ▼
Zustand recipeStore (+ sourceContext for related-dish suggestions)
        │
        ▼
React renders the workspace. FoodImage calls GET /images/search
(a server-side Pexels proxy — the key never reaches the browser).
The refine bar posts the current recipe + one instruction to
POST /generate/refine, which runs the same validation pipeline.
        │
        ▼
"I made this!" → POST /feedback → server/data/feedback.jsonl
Every recipe → the history drawer (client-side, keyed by email)
```

Four route groups on the backend: `POST /generate` with `/stream` and
`/refine` variants (the AI gateway), `POST /feedback` (file-based),
`POST/GET /auth/*` (OTP + in-memory sessions), and `GET /images/search`
(the Pexels proxy). No database, no third-party auth — everything is
self-contained.

### API keys never reach the browser

Both the Groq and Pexels keys live only in `server/.env` (gitignored, with
`.env.example` as the template) and are read only inside
`server/src/services/`. The client bundle contains no key of any kind —
its single environment variable is `VITE_API_URL`, the address of the
backend. Every model call and every image lookup goes through the Express
server, so nothing sensitive is ever shipped to or executed in the
browser.

The cuisine → region → dish-group → variety tree is static, curated data
in `client/src/data/exploreData.ts`. Only the photos and the recipe
content itself are fetched live.

### Folder structure

```
client/src/
  components/
    auth/       ProtectedRoute (redirects to /login if not authenticated)
    common/     Logo, FoodImage (Pexels-backed image with graceful fallback)
    layout/     Navbar, Footer, ThemeToggle, UserDrawer
    landing/    Hero, FeatureCards
    explore/    CuisineChips, RegionBox, DishGroupFlipCard, CuisineExplorer
    search/     SearchBar, IngredientChip, VoiceButton, SuggestionsDropdown
    loading/    RecipeLoading (skeleton + rotating tips + streamed preview)
    recipe/     RecipeHeader, RefineBar, IngredientChecklist, CookingSteps,
                StepCard, ServingSlider, NutritionCards, IngredientSwaps,
                CookingTips, RelatedDishes, PreparedFeedback
    ui/         Button, Badge
  data/         exploreData.ts (cuisine tree), dishImageOverrides.ts
  hooks/        useDebounce, useIngredientSuggestions, useVoiceInput
  pages/        Landing.tsx, Workspace.tsx, Login.tsx
  schemas/      recipe.schema.ts (Zod — mirrors the server schema)
  services/     api.ts, recipe.service.ts, auth.service.ts, image.service.ts
  store/        recipeStore, ingredientStore, uiStore, authStore, historyStore
  utils/        scaleQuantity (serving-slider math)

server/src/
  routes/       generate.route.ts, feedback.route.ts, auth.route.ts,
                images.route.ts
  services/     groq.service.ts, feedback.service.ts, auth.service.ts,
                pexels.service.ts (cached proxy)
  validators/   recipe.schema.ts — all Zod request/response schemas
  prompts/      recipe.prompt.ts
  app.ts        Express app (cors, json body limit, 404, error handler)
  server.ts     entrypoint
```

---

## Handling bad AI output

This got the most iteration of anything in the project, since it's the
part that actually breaks in the real world.

Malformed or truncated JSON gets caught, retried once on the server, and
then surfaced as a readable error instead of a crash. Wrong shapes are
where it got interesting: the model sometimes returns things like
`quantity: "a pinch"` instead of a number, or `difficulty: "medium"` with
the wrong casing. Early on that hard-failed the entire recipe over one
messy field — Pani Puri kept breaking because of its garnish list. The Zod
schema now coerces what it can (extracting numbers from strings,
normalizing casing) and falls back sensibly on the rest, so one loose
field doesn't take down an otherwise fine recipe.

Beyond shape problems: an empty response throws an explicit error, slow
requests hit a 30-second timeout, network failures retry once, and each
failure mode gets its own error copy (NETWORK, TIMEOUT, SCHEMA, SERVER,
ABORTED). Every generate call also aborts any request still in flight
before starting, so a slow first response can never overwrite a faster
second one.

The streaming path has its own safety net. Groq's JSON mode doesn't
support streaming, so streamed output leans on the strict system prompt
and gets fully validated at the end, on both server and client. Raw deltas
only ever drive the loading preview. If the stream errors, disconnects, or
fails validation, the client quietly falls back to the non-streaming
endpoint and the user still gets their recipe.

Loading, error, and empty states are all explicit: a skeleton loader with
rotating cooking tips (and the streamed title once it arrives), inline
error banners, and a "no recipe yet" state on the workspace.

---

## Stretch goals

- Streaming — done. Generation streams over Server-Sent Events
  (`POST /generate/stream`) with the title/description preview and the
  fallback behavior described above.
- Refinement loop — done. The refine bar sends one instruction plus the
  current recipe JSON to `POST /generate/refine`; the prompt tells the
  model to change only what was asked and keep everything else identical.
  The result goes through the same validation and abort protection as a
  fresh generation, so a bad refinement never replaces the recipe on
  screen.
- Different block types — done, in spirit: one Recipe object drives a
  checklist, flip cards, stat cards, and swap cards rather than a single
  generic renderer.
- Save and reload sessions — done, two layers. The history drawer stores
  every generated recipe in full (tap to reopen instantly, no
  regeneration), and the current recipe/ingredient list persists to
  localStorage so a page refresh doesn't lose your place.
- Polish — Framer Motion animations, a light/dark theme, and keyboard
  navigation in the search (arrow keys and Enter through suggestions,
  Escape to dismiss, Backspace to remove the last chip).

---

## AI usage note

Most of the code in this project was written with the help of AI (Claude).
I directed what to build and altered the output wherever it was necessary,
since I know the concepts behind it — I reviewed what came back, tested it
against real model responses, fixed what didn't hold up (the schema
hard-fail bug, the mobile layout issues), and made the integration
decisions myself. So the honest summary: AI produced most of the raw code,
and my part was the direction, the corrections, and understanding every
piece well enough to explain or extend it — the abort-controller logic,
the two-layer Zod validation, the SSE framing, the serving-scale math.

---

## Known limitations

- OTP emails aren't actually sent (see the login section). It's a demo
  auth flow, not production-ready without a real email provider.
- Sessions and OTPs live in server memory only, so restarting the backend
  logs everyone out.
- History is stored per browser in localStorage, not server-side. The same
  email on a different device won't see the same history.
- Pexels returns generic stock photos matched by search query, not photos
  of the exact generated recipe.
- Voice input depends on the browser SpeechRecognition API. Chrome and
  Edge are solid; Firefox and Safari are inconsistent or missing it.
- Quantity scaling is plain linear math — it doesn't apply culinary
  judgment.
- The explore tree has full depth for Indian cuisine and a lighter
  selection for the other five chips.
- Feedback goes to a local file (`server/data/feedback.jsonl`), not a
  database, by design.

---

## Time spent

About 11 hours, which ran past the suggested 8. The core brief — the
generate flow, the interactive workspace, streaming, the refinement loop,
and the bad-output handling pass — fit inside roughly 8 hours. The rest
went into things the brief didn't ask for (its own FAQ says auth isn't
needed): the OTP login, the Pexels proxy with curated image overrides,
theming, the cuisine explorer content, and the history drawer. I kept
going because those pieces made it feel like a real product, and the extra
time is accounted for here rather than hidden.
