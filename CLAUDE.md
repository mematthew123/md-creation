# md-creation monorepo

npm workspaces: `web/` (Next.js, package `md-web`) and `studio/` (Sanity Studio, package `md-studio`, placeholder until scaffolded).

- Install and run from the root: `npm install`, `npm run dev`.
- Workspace-specific rules live in each workspace, e.g. `web/AGENTS.md` (Next.js version notes — read it before touching `web/`).
- The single lockfile is `package-lock.json` at the root; do not create per-workspace lockfiles.
