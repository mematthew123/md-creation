# md-creation

npm-workspaces monorepo.

| Workspace | Path      | Description                              |
| --------- | --------- | ---------------------------------------- |
| md-web    | `web/`    | Next.js front end                        |
| md-studio | `studio/` | Sanity Studio (placeholder, not yet set up) |

## Getting started

```bash
npm install
npm run dev        # starts the web app
```

Other root scripts:

```bash
npm run build      # build every workspace
npm run lint       # lint every workspace
npm run typecheck  # type-check every workspace
```

Run a script in one workspace with `npm run <script> --workspace <name>`, e.g.
`npm run dev --workspace web`.

## Setting up the studio

```bash
cd studio
npm create sanity@latest -- --template clean --output-path .
```

Then reinstall from the root so the studio's dependencies land in the shared lockfile.
