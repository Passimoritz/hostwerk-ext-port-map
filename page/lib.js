/* PortMap – pure logic without DOM, tested in tests/lib.test.js (node --test). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; else root.PortMap = api;
}(typeof self !== 'undefined' ? self : this, () => {
  /* Statuswerte aus Hostwerk (/system/ports): ours = läuft bei uns · free = frei · blocked = ein fremdes Programm hat
     den Port · duplicate = mehrere Hostwerk-Dienste wollen denselben Port */
  const PROBLEM = new Set(['blocked', 'duplicate']);
  /** Ports, die auf fast jedem Rechner ein anderes Programm belegt (Fernwartung, Windows-Freigaben …) – nie vorschlagen. */
  const WELL_KNOWN = new Set([21, 22, 23, 25, 53, 80, 110, 135, 137, 138, 139, 143, 443, 445, 465, 587, 993, 995, 1433, 1521, 3000, 3306, 3389, 5000, 5432, 5900, 6379, 8000, 8008, 8443, 9000, 27017]);
  const proto = (p) => (String(p.proto || p.protocol || 'TCP').toUpperCase() === 'UDP' ? 'UDP' : 'TCP');
  /** Probleme zuerst, dann nach Portnummer (TCP vor UDP). */
  function sorted(ports) { return [...(ports || [])].sort((a, b) => (PROBLEM.has(b.status) ? 1 : 0) - (PROBLEM.has(a.status) ? 1 : 0) || a.port - b.port || proto(a).localeCompare(proto(b))); }
  /**
   * Konflikte mit verständlicher Ursache – je Port nur einmal: „doppelt“ nennt alle Dienste, die ihn wollen.
   * → [{ port, kind: 'blocked'|'duplicate', name, names, by, entries }]
   */
  function conflicts(ports) {
    const out = [];
    const seen = new Map();
    for (const p of ports || []) {
      if (!PROBLEM.has(p.status)) continue;
      const key = `${p.port}/${proto(p)}`;
      if (seen.has(key)) { const c = seen.get(key); if (!c.names.includes(p.name)) c.names.push(p.name); c.entries.push(p); if (p.status === 'duplicate') c.kind = 'duplicate'; continue; }
      const c = { port: p.port, kind: p.status, name: p.name, names: [p.name], by: p.usedBy ? (p.usedBy.name || p.usedBy.process || (typeof p.usedBy === 'string' ? p.usedBy : null)) : null, entries: [p] };
      seen.set(key, c); out.push(c);
    }
    return out;
  }
  /**
   * Freie Ports ab einem Startwert vorschlagen: keiner, den Hostwerk vergeben hat, kein bekannter Port anderer Programme
   * und keiner, den der Router schon weiterleitet (extra). Ob er WIRKLICH frei ist, prüft Hostwerk beim Ändern.
   */
  function suggest(ports, from = 8080, count = 5, to = 65535, extra = []) {
    const used = new Set([...(ports || []).map((p) => p.port), ...extra]);
    const out = [];
    for (let p = from; p <= to && out.length < count; p++) if (!used.has(p) && !WELL_KNOWN.has(p)) out.push(p);
    return out;
  }
  /** Bereiche zur Orientierung: nach der Art des Dienstes, sonst nach der Portnummer. */
  const KIND_AREA = { web: 'web', db: 'db', mc: 'minecraft', minecraft: 'minecraft', mail: 'mail', app: 'app', docker: 'docker', hostwerk: 'hostwerk' };
  function area(port, kind) {
    if (kind && KIND_AREA[kind]) return KIND_AREA[kind];
    if ([80, 443].includes(port) || (port >= 8000 && port < 9000)) return 'web';
    if ([3306, 3307, 5432, 5433, 6379, 27017, 1433].includes(port) || (port >= 3300 && port < 3400) || (port >= 5400 && port < 5500)) return 'db';
    if ((port >= 25565 && port < 25700) || port === 19132 || port === 19133) return 'minecraft';
    if ([25, 465, 587, 993, 995, 143, 110, 1025, 8025].includes(port)) return 'mail';
    return 'other';
  }
  /** Zählung je Port (ein doppelt eingetragener Port ist EIN Problem, nicht zwei). */
  function counts(ports) {
    const c = { ours: 0, free: 0, problems: conflicts(ports).length };
    const seen = new Set();
    for (const p of ports || []) {
      if (PROBLEM.has(p.status)) continue;
      const key = `${p.port}/${proto(p)}`;
      if (seen.has(key)) continue;
      seen.add(key);
      if (p.status === 'ours') c.ours++; else c.free++;
    }
    return c;
  }
  /**
   * Weiterleitungen im Router (Router-Erweiterung, /router): Port → [Protokoll …], nur die auf DIESEN Rechner.
   * router = { mappings: [{ externalPort, internalPort, protocol, here }] } oder null
   */
  function forwarded(router) {
    const map = new Map();
    for (const m of (router && router.mappings) || []) {
      if (!m || m.here === false) continue;
      const port = Number(m.internalPort || m.externalPort);
      if (!port) continue;
      const list = map.get(port) || [];
      const pr = String(m.protocol || 'TCP').toUpperCase();
      if (!list.includes(pr)) list.push(pr);
      map.set(port, list);
    }
    return map;
  }
  /**
   * Zeilen, die Hostwerks Port-Liste nicht kennt: UDP-Ports öffentlicher Dienste (Bedrock, Spiele-Server) aus der
   * Router-Erweiterung. → [{ port, proto: 'UDP', name, status: 'public', kind }]
   */
  function udpRows(router, ports) {
    const have = new Set((ports || []).map((p) => `${p.port}/${proto(p)}`));
    const out = [];
    for (const w of (router && router.wanted) || []) {
      if (!w || String(w.protocol || '').toUpperCase() !== 'UDP' || !Number(w.port)) continue;
      const key = `${w.port}/UDP`;
      if (have.has(key)) continue;
      have.add(key);
      out.push({ port: Number(w.port), proto: 'UDP', name: w.label || '', status: 'public', kind: /bedrock|minecraft/i.test(w.label || '') ? 'mc' : null });
    }
    return out;
  }
  /** Docker-Apps erkennen: App-ID → true, wenn die App ein Docker-Container ist (/apps, Art „docker“). */
  function dockerIds(apps) { return new Set((Array.isArray(apps) ? apps : []).filter((a) => a && (a.kind === 'docker' || a.docker || a.image)).map((a) => a.id)); }
  /** Wo lässt sich der Port ändern? Hostwerks Port-Prüfung hat für jeden Konflikt „Port ändern“ (prüft den neuen Port wirklich). */
  const FIX_ROUTE = '/system/zustand/ports';
  return { sorted, conflicts, suggest, area, counts, forwarded, udpRows, dockerIds, proto, WELL_KNOWN, FIX_ROUTE };
}));
