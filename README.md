![Port map](banner.svg)

# Port map

All ports of your services in one list: what runs, what another program blocks, where two services want the same port, what the router forwards – with free suggestions to copy.

An official [Hostwerk](https://github.com/Passimoritz/hostwerk-public) extension.

## Features

- Every port of every service with its protocol (TCP/UDP), problems first; Docker containers as their own area
- Conflicts explained – a port set twice counts once and names every service that wants it
- “Change port” right here – on every conflict and for every stopped service in the list: Hostwerk gives the service a port that is really free (asks first) and the page shows old → new
- “Is this port free?” – asks Hostwerk: free, set for a Hostwerk service, or taken by which program
- “From outside” column: which ports the router forwards to this computer (with the “Router & port forwarding” extension), plus public UDP ports such as Bedrock
- Free port suggestions for web, databases, Minecraft and other – without ports Hostwerk assigned, the router uses or other programs typically take; one click copies
- Dashboard tile with the number of conflicts
- Error state with “Try again”; polling pauses while the page is not visible
- Sits at the bottom of the sidebar next to “System”; other extensions may add tabs

## Install

In Hostwerk: **Apps → Extensions → Marketplace** → “Port map” → Install. Updates arrive automatically.

## Permissions

- Read system ports (also “is this port free?”)
- Change ports (`change:ports`) – move a stopped service to a free port, **Hostwerk asks every time**
- Read the router (forwardings) – without the router extension the column simply stays away
- Read apps (to recognise Docker containers)

Pages run isolated (own origin, no external scripts); anything that changes something asks you first.

## Development

```bash
node --test tests/*.test.js            # logic tests
node path/to/hostwerk-public/sdk/check.js . --strict   # same check as the catalog
```

The logic lives in `page/lib.js` (no DOM, tested), polling and the error state in `page/live.js`, the page in `page/app.js`. A tag `vX.Y.Z` matching `manifest.json` publishes a release with everything except the repository tooling; the Hostwerk catalog picks it up.

Deutsch: [README.de.md](README.de.md) · License: MIT
