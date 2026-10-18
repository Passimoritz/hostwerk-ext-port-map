# Port map

All ports of your services in one list: what runs, what another program blocks, where two services want the same port – with free suggestions.

An official [Hostwerk](https://github.com/Passimoritz/hostwerk-public) extension.

## Features

- Every port of every service, problems first
- Conflicts explained: taken by another program, or set twice
- Free port suggestions for web, databases and Minecraft
- Dashboard tile with the number of conflicts

## Install

In Hostwerk: **Apps → Extensions → Marketplace** → “Port map” → Install. Updates arrive automatically.

## Permissions

- Read system ports

Pages run isolated (own origin, no external scripts); anything that changes something asks you first.

## Development

```bash
node --test tests/*.test.js            # logic tests
node path/to/hostwerk-public/sdk/check.js . --strict   # same check as the catalog
```

The logic lives in `page/lib.js` (no DOM, tested), the page in `page/app.js`. A tag `vX.Y.Z` matching `manifest.json` publishes a release; the Hostwerk catalog picks it up.

Deutsch: [README.de.md](README.de.md) · License: MIT
