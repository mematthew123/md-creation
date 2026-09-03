# md-creation monorepo

npm workspaces: `web/` (Next.js, package `md-web`) and `studio/` (Sanity Studio, package `md-studio`).

- Install and run from the root: `npm install`, `npm run dev` (web) or `npm run dev:studio`.
- Workspace-specific rules live in each workspace, e.g. `web/AGENTS.md` (Next.js version notes — read it before touching `web/`).
- The single lockfile is `package-lock.json` at the root; do not create per-workspace lockfiles (no `pnpm-lock.yaml` or nested `package-lock.json`).
