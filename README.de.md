# Port-Übersicht

Alle Ports deiner Dienste in einer Liste: was läuft, was ein fremdes Programm blockiert, wo zwei Dienste denselben Port wollen – mit freien Vorschlägen.

Eine offizielle Erweiterung für [Hostwerk](https://github.com/Passimoritz/hostwerk-public).

## Funktionen

- Alle Ports aller Dienste, Probleme zuerst
- Konflikte erklärt: von einem anderen Programm belegt oder doppelt eingetragen
- Freie Ports als Vorschlag für Web, Datenbanken und Minecraft
- Kachel für die Übersicht mit der Zahl der Konflikte

## Installieren

In Hostwerk: **Apps → Erweiterungen → Marktplatz** → „Port-Übersicht“ → Installieren. Updates kommen von selbst.

## Rechte

- Ports des Systems lesen

Seiten laufen abgeschottet (eigener Ursprung, keine fremden Skripte); alles, was etwas ändert, fragt vorher nach.

## Entwicklung

```bash
node --test tests/*.test.js            # Tests der Logik
node pfad/zu/hostwerk-public/sdk/check.js . --strict   # dieselbe Prüfung wie der Katalog
```

Die Logik steckt in `page/lib.js` (ohne DOM, getestet), die Seite in `page/app.js`. Ein Tag `vX.Y.Z` passend zu `manifest.json` veröffentlicht ein Release; der Hostwerk-Katalog übernimmt es.

English: [README.md](README.md) · Lizenz: MIT
