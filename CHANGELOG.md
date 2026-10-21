## 1.4.0

- “Change port” works right here: Hostwerk gives the stopped service a port that is really free (permission `change:ports`, Hostwerk asks first) and the page shows old → new – on every conflict (one button per service) and in the list for every stopped service. No more jump to Hostwerk's port check. / „Port ändern“ geht direkt hier: Hostwerk gibt dem gestoppten Dienst einen wirklich freien Port (Recht `change:ports`, Hostwerk fragt vorher), die Seite zeigt alt → neu – bei jedem Konflikt (ein Knopf je Dienst) und in der Liste bei jedem gestoppten Dienst. Kein Sprung mehr zu Hostwerks Port-Prüfung.
- “Is this port free?”: asks Hostwerk (`/system/ports/free`) – free, set for a Hostwerk service, or taken by which program. / „Ist dieser Port frei?“: fragt Hostwerk (`/system/ports/free`) – frei, für einen Hostwerk-Dienst eingetragen oder von welchem Programm belegt.
- Needs Hostwerk 3.0 (SDK 3.0). / Braucht Hostwerk 3.0 (SDK 3.0).

## 1.3.0

- A port that is set twice counts once – in the list, the counters and the tile – and names every service that wants it. / Ein doppelt eingetragener Port zählt einmal – in der Liste, den Kennzahlen und der Kachel – und nennt alle Dienste, die ihn wollen.
- “Change port” on every conflict: opens Hostwerk’s port check, which gives the service a port that is really free. / „Port ändern“ bei jedem Konflikt: öffnet Hostwerks Port-Prüfung, die dem Dienst einen wirklich freien Port gibt.
- New column “From outside”: ports the router forwards to this computer (UPnP, with the router extension); public UDP ports such as Bedrock as their own rows; Docker containers recognised. / Neue Spalte „Von außen“: Ports, die der Router an diesen Rechner weiterleitet (UPnP, mit der Router-Erweiterung); öffentliche UDP-Ports wie Bedrock als eigene Zeilen; Docker-Container erkannt.
- Free suggestions skip ports the router uses and ports other programs typically take, say honestly that Hostwerk checks them on change, and copy with one click. / Freie Vorschläge lassen im Router belegte und typische Ports anderer Programme aus, sagen ehrlich, dass Hostwerk sie beim Ändern prüft, und lassen sich mit einem Klick kopieren.
- Error state with “Try again” on the page and the tile instead of a skeleton that never goes away. / Fehlerzustand mit „Erneut versuchen“ auf Seite und Kachel statt ewigem Skelett.
- Polling pauses while the page is hidden; numbers in Hostwerk’s language; sizes from the design scale; the page sits next to “System” in the sidebar; other extensions may add tabs. / Abfragen pausieren bei verstecktem Reiter; Zahlen in Hostwerks Sprache; Größen aus der Design-Skala; die Seite steht in der Seitenleiste bei „System“; andere Erweiterungen dürfen Reiter ergänzen.
- New permissions: read the router and apps (both read-only). The release packs everything except the repository tooling. Needs Hostwerk 2.11. / Neue Rechte: Router und Apps lesen (nur lesend). Das Release packt alles außer dem Repo-Werkzeug. Braucht Hostwerk 2.11.

## 1.2.0

- New animated icon and a banner for Hostwerk's new extension page, category “network”. / Neues bewegtes Symbol und ein Banner für die neue Erweiterungsseite, Kategorie „network“.

## 1.1.0

- Looks exactly like Hostwerk's own pages: uses Hostwerk's design classes (card, btn, badge …) from the SDK 2.2 design kit; Hostwerk draws the page header. / Sieht aus wie Hostwerks eigene Seiten: Hostwerks Design-Klassen aus dem Baukasten (SDK 2.2), Kopf zeichnet Hostwerk.

## 1.0.0

- First release / Erste Fassung.
