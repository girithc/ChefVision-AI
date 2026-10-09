# ChefVision AI · Product

A Next.js App Router prototype for the ChefVision AI marketing site and back-of-house workspace.

## Run locally

One dev server serves both experiences:

```bash
npm install --prefix product
npm run dev
```

Then open:

- Landing page: [http://localhost:3000](http://localhost:3000)
- Product workspace: [http://localhost:3000/product](http://localhost:3000/product)

The legacy Vite landing server is no longer needed.

## Structure

- `app/page.tsx` — the landing route
- `app/product/page.tsx` — the back-of-house workspace route
- `components/LandingPage.tsx` — the converted landing page
- `components/LandingScrollEffect.tsx` — the landing scroll animation
- `components/BrowserShell.tsx` — the primary application shell
- `components/AppWorkspace.tsx` — CRM-style workspace and navigation
