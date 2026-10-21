![Port-Übersicht](banner.svg)

# Port-Übersicht

Alle Ports deiner Dienste in einer Liste: was läuft, was ein fremdes Programm blockiert, wo zwei Dienste denselben Port wollen, was im Router freigegeben ist – mit freien Vorschlägen zum Kopieren.

Eine offizielle Erweiterung für [Hostwerk](https://github.com/Passimoritz/hostwerk-public).

## Funktionen

- Alle Ports aller Dienste mit Protokoll (TCP/UDP), Probleme zuerst; Docker-Container als eigener Bereich
- Konflikte erklärt – ein doppelt eingetragener Port zählt einmal und nennt alle Dienste, die ihn wollen
- „Port ändern“ direkt hier – bei jedem Konflikt und für jeden gestoppten Dienst in der Liste: Hostwerk gibt dem Dienst einen wirklich freien Port (fragt vorher), die Seite zeigt alt → neu
- „Ist dieser Port frei?“ – fragt Hostwerk: frei, für einen Hostwerk-Dienst eingetragen oder von welchem Programm belegt
- Spalte „Von außen“: welche Ports der Router an diesen Rechner weiterleitet (mit der Erweiterung „Router & Portfreigaben“), dazu öffentliche UDP-Ports wie Bedrock
- Freie Ports als Vorschlag für Web, Datenbanken, Minecraft und Sonstiges – ohne Ports, die Hostwerk vergeben hat, die der Router belegt oder die typischerweise andere Programme nutzen; ein Klick kopiert
- Kachel für die Übersicht mit der Zahl der Konflikte
- Fehlerzustand mit „Erneut versuchen“; Abfragen pausieren, solange die Seite nicht zu sehen ist
- Steht in der Seitenleiste unten bei „System“; andere Erweiterungen dürfen Reiter ergänzen

## Installieren

In Hostwerk: **Apps → Erweiterungen → Marktplatz** → „Port-Übersicht“ → Installieren. Updates kommen von selbst.

## Rechte

- Ports des Systems lesen (auch „Ist dieser Port frei?“)
- Ports ändern (`change:ports`) – gestoppten Dienst auf einen freien Port umstellen, **Hostwerk fragt jedes Mal**
- Router lesen (Freigaben) – ohne Router-Erweiterung bleibt die Spalte einfach weg
- Apps lesen (Docker-Container erkennen)

Seiten laufen abgeschottet (eigener Ursprung, keine fremden Skripte); alles, was etwas ändert, fragt vorher nach.

## Entwicklung

```bash
node --test tests/*.test.js            # Tests der Logik
node pfad/zu/hostwerk-public/sdk/check.js . --strict   # dieselbe Prüfung wie der Katalog
```

Die Logik steckt in `page/lib.js` (ohne DOM, getestet), Abfragen und Fehlerzustand in `page/live.js`, die Seite in `page/app.js`. Ein Tag `vX.Y.Z` passend zu `manifest.json` veröffentlicht ein Release mit allem außer dem Repo-Werkzeug; der Hostwerk-Katalog übernimmt es.

English: [README.md](README.md) · Lizenz: MIT
