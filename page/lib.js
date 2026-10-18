/* PortMap – pure logic without DOM, tested in tests/lib.test.js (node --test). */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api; else root.PortMap = api;
}(typeof self !== 'undefined' ? self : this, () => {
  /* Statuswerte aus Hostwerk (/system/ports): ours = läuft bei uns · free = frei · blocked = ein fremdes Programm hat
     den Port · duplicate = mehrere Hostwerk-Dienste wollen denselben Port */
  const PROBLEM = new Set(['blocked', 'duplicate']);
  /** Probleme zuerst, dann nach Portnummer. */
  function sorted(ports) { return [...(ports || [])].sort((a, b) => (PROBLEM.has(b.status) ? 1 : 0) - (PROBLEM.has(a.status) ? 1 : 0) || a.port - b.port); }
  /** Konflikte mit verständlicher Ursache. */
  function conflicts(ports) {
    const out = [];
    for (const p of ports || []) {
      if (p.status === 'blocked') out.push({ port: p.port, name: p.name, kind: 'blocked', by: p.usedBy && (p.usedBy.name || p.usedBy.process || p.usedBy) });
      if (p.status === 'duplicate') out.push({ port: p.port, name: p.name, kind: 'duplicate', with: (ports || []).filter((x) => x.port === p.port && x !== p).map((x) => x.name) });
    }
    return out;
  }
  /** Freie Ports ab einem Startwert vorschlagen (keiner, den Hostwerk schon vergeben hat). */
  function suggest(ports, from = 8080, count = 5, to = 65535) {
    const used = new Set((ports || []).map((p) => p.port));
    const out = [];
    for (let p = from; p <= to && out.length < count; p++) if (!used.has(p)) out.push(p);
    return out;
  }
  /** Bereiche zur Orientierung: Web, Datenbanken, Minecraft, Mail, Sonstige. */
  function area(port) {
    if ([80, 443].includes(port) || (port >= 8000 && port < 9000)) return 'web';
    if ([3306, 3307, 5432, 5433, 6379, 27017, 1433].includes(port) || (port >= 3300 && port < 3400) || (port >= 5400 && port < 5500)) return 'db';
    if (port >= 25565 && port < 25700) return 'minecraft';
    if ([25, 465, 587, 993, 995, 143, 110, 1025, 8025].includes(port)) return 'mail';
    return 'other';
  }
  function counts(ports) { const c = { ours: 0, free: 0, problems: 0 }; for (const p of ports || []) { if (p.status === 'ours') c.ours++; else if (PROBLEM.has(p.status)) c.problems++; else c.free++; } return c; }
  return { sorted, conflicts, suggest, area, counts };
}));
