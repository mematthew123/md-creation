# md-creation

npm-workspaces monorepo.

| Workspace | Path      | Description       |
| --------- | --------- | ----------------- |
| md-web    | `web/`    | Next.js front end |
| md-studio | `studio/` | Sanity Studio     |

## Getting started

```bash
npm install
npm run dev          # starts the web app
npm run dev:studio   # starts the Sanity Studio
```

Other root scripts:

```bash
npm run build      # build every workspace
npm run lint       # lint every workspace
npm run typecheck  # type-check every workspace
```

Run a script in one workspace with `npm run <script> --workspace <name>`, e.g.
`npm run deploy --workspace studio`.
