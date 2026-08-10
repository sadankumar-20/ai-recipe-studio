<!-- Improved compatibility of back to top link -->
<a id="readme-top"></a>

<!-- PROJECT SHIELDS -->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![LinkedIn][linkedin-shield]][linkedin-url]



<!-- PROJECT LOGO -->
<br />
<div align="center">
  <h1>🍳</h1>

  <h3 align="center">AI Recipe Studio</h3>

  <p align="center">
    Turn the ingredients you already have into complete, interactive recipes — with live AI streaming.
    <br />
    <br />
    <a href="https://ai-recipe-studio-8xe6.vercel.app"><strong>Live Demo »</strong></a>
    <br />
    <br />
    <a href="https://github.com/sadankumar-20/ai-recipe-studio/issues/new?labels=bug">Report Bug</a>
    &middot;
    <a href="https://github.com/sadankumar-20/ai-recipe-studio/issues/new?labels=enhancement">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#key-features">Key Features</a></li>
        <li><a href="#architecture">Architecture</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#environment-variables">Environment Variables</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

**Live App:** https://ai-recipe-studio-8xe6.vercel.app &nbsp;·&nbsp; **API:** https://ai-recipe-studio.vercel.app

Deciding what to cook with what's already in the kitchen is a daily problem. Traditional recipe sites make you search by dish name and then send you shopping for missing ingredients.

AI Recipe Studio flips that: enter the ingredients you have (typed or by voice), and a large language model generates a complete recipe on the spot — steps with tips and timings, nutrition, ingredient swaps, and serving-size scaling — streamed token-by-token to your screen while it's being written.

> **Demo auth:** no email provider is configured by design — the 6-digit OTP is displayed directly on the login screen, so anyone can try the app with any email address.

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Key Features

* 🤖 **AI recipe generation** — complete recipes from a free-form ingredient list or a named dish
* ⚡ **Live streaming** — recipes stream over Server-Sent Events; the title and description appear on the loading screen while the model is still writing
* ✏️ **Refinement loop** — edit the recipe in place ("make it spicier", "swap the paneer") instead of regenerating
* 🌍 **Cuisine explorer** — browse cuisines and jump between related dishes
* 🔐 **Passwordless login** — stateless, HMAC-signed OTPs and session tokens; no database required
* 🕘 **Per-user history** — every generated recipe is saved and can be reopened exactly as generated
* 🍽️ **Interactive cooking tools** — ingredient checklist, serving slider, step cards, dish photos via Pexels
* 🌗 Dark/light theme, responsive layout, Zod-validated AI output on both server and client

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Architecture

```
React (Vite) SPA ── axios / fetch+SSE ──▶ Express API (Vercel serverless)
     │                                        │
  Zustand + React Query                   Groq LLM (streaming + JSON mode)
  Zod response validation                 Pexels API · Zod validation
```

Two Vercel deployments from one monorepo:

| Project  | Root directory | URL                              |
|----------|----------------|----------------------------------|
| Frontend | `client/`      | ai-recipe-studio-8xe6.vercel.app |
| Backend  | `server/`      | ai-recipe-studio.vercel.app      |

Serverless-first design decisions:

* Express runs as a single Vercel function (`server/api/index.ts`) behind a catch-all rewrite — no `app.listen` in production
* OTPs are **derived, not stored** — an HMAC of the email + a 5-minute time window, verifiable by any function instance
* Session tokens are **signed payloads** (JWT-style), so no shared session store is needed
* The streamed recipe is only rendered from the final, schema-validated `complete` event; raw deltas drive the live preview, and the client falls back to the non-streaming endpoint if the stream fails

<p align="right">(<a href="#readme-top">back to top</a>)</p>


### Built With

* [![React][React.js]][React-url]
* [![TypeScript][TypeScript]][TypeScript-url]
* [![Vite][Vite]][Vite-url]
* [![TailwindCSS][TailwindCSS]][Tailwind-url]
* [![Express][Express.js]][Express-url]
* [![Node][Node.js]][Node-url]
* [![Vercel][Vercel]][Vercel-url]

Plus: TanStack Query · Zustand · Framer Motion · Zod · Groq (Llama 3.3 70B) · Pexels API

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites

* Node.js 18+ and npm
* A free [Groq API key](https://console.groq.com) and [Pexels API key](https://www.pexels.com/api/)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/sadankumar-20/ai-recipe-studio.git
   cd ai-recipe-studio
   ```
2. Install and run the backend (http://localhost:4000)
   ```sh
   cd server
   npm install
   npm run dev
   ```
3. Install and run the frontend (http://localhost:5173)
   ```sh
   cd client
   npm install
   npm run dev
   ```

### Environment Variables

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

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE -->
## Usage

1. Open the app and log in with any email — the demo OTP appears right on the login screen
2. Add ingredients by typing or voice, or pick a dish from the cuisine explorer
3. Watch the recipe stream in live, then use the workspace: check off ingredients, scale servings, flip step cards
4. Refine the recipe in place ("make it vegan", "halve the spice") or jump to related dishes
5. Reopen any past recipe from your history drawer

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- PROJECT STRUCTURE -->
## Project Structure

```
ai-recipe-studio/
├── client/                  # React SPA
│   └── src/
│       ├── pages/           # Landing, Login, Workspace (lazy-loaded routes)
│       ├── components/      # recipe/, landing/, layout/, search/, motion/
│       ├── services/        # api, auth, recipe (incl. SSE streaming), images
│       ├── store/           # zustand: auth, recipe, ingredients, history, ui
│       └── schemas/         # zod validation of AI responses
└── server/                  # Express API (Vercel serverless)
    ├── api/index.ts         # serverless entry
    └── src/
        ├── routes/          # auth, generate (+ /stream SSE), images, feedback
        ├── services/        # groq, auth (stateless HMAC), pexels
        ├── prompts/         # system + user prompt builders
        └── validators/      # zod request/response schemas
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- ROADMAP -->
## Roadmap

- [x] AI recipe generation from ingredients or dish name
- [x] Token-by-token streaming with live preview
- [x] In-place recipe refinement
- [x] Passwordless demo login (stateless OTP + sessions)
- [x] Per-user recipe history
- [x] Route-level code splitting
- [ ] Favorites (star and browse saved recipes)
- [ ] Real email OTP delivery (Resend)
- [ ] Grocery list generation & meal planner
- [ ] Multi-language support

See the [open issues](https://github.com/sadankumar-20/ai-recipe-studio/issues) for a full list of proposed features.

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Don't forget to give the project a star! ⭐

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTACT -->
## Contact

**Sadan K** — B.Tech, Data Science & AI, IIIT Dharwad

Project Link: [https://github.com/sadankumar-20/ai-recipe-studio](https://github.com/sadankumar-20/ai-recipe-studio)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/sadankumar-20/ai-recipe-studio.svg?style=for-the-badge
[contributors-url]: https://github.com/sadankumar-20/ai-recipe-studio/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/sadankumar-20/ai-recipe-studio.svg?style=for-the-badge
[forks-url]: https://github.com/sadankumar-20/ai-recipe-studio/network/members
[stars-shield]: https://img.shields.io/github/stars/sadankumar-20/ai-recipe-studio.svg?style=for-the-badge
[stars-url]: https://github.com/sadankumar-20/ai-recipe-studio/stargazers
[issues-shield]: https://img.shields.io/github/issues/sadankumar-20/ai-recipe-studio.svg?style=for-the-badge
[issues-url]: https://github.com/sadankumar-20/ai-recipe-studio/issues
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: www.linkedin.com/in/sadankumar28
[React.js]: https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB
[React-url]: https://react.dev/
[TypeScript]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[TypeScript-url]: https://www.typescriptlang.org/
[Vite]: https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white
[Vite-url]: https://vitejs.dev/
[TailwindCSS]: https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white
[Tailwind-url]: https://tailwindcss.com/
[Express.js]: https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white
[Express-url]: https://expressjs.com/
[Node.js]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node-url]: https://nodejs.org/
[Vercel]: https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white
[Vercel-url]: https://vercel.com/
