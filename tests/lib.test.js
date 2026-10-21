const test = require('node:test');
const assert = require('node:assert');
const P = require('../page/lib.js');
const ports = [
  { port: 8080, name: 'Apache', status: 'ours', kind: 'web' },
  { port: 3306, name: 'MariaDB', status: 'blocked', usedBy: { name: 'mysqld.exe' }, kind: 'db' },
  { port: 8081, name: 'Shop', status: 'duplicate', kind: 'web' },
  { port: 8081, name: 'Blog', status: 'duplicate', kind: 'web' },
  { port: 25565, name: 'Freunde', status: 'free', kind: 'mc' },
];

test('Probleme zuerst, sonst nach Port', () => {
  assert.deepStrictEqual(P.sorted(ports).map((p) => p.port), [3306, 8081, 8081, 8080, 25565]);
});
test('Konflikte mit Ursache – ein doppelter Port nur einmal, mit allen Diensten', () => {
  const c = P.conflicts(ports);
  assert.strictEqual(c.length, 2);
  assert.deepStrictEqual({ port: c[0].port, kind: c[0].kind, by: c[0].by, names: c[0].names }, { port: 3306, kind: 'blocked', by: 'mysqld.exe', names: ['MariaDB'] });
  assert.deepStrictEqual({ port: c[1].port, kind: c[1].kind, names: c[1].names }, { port: 8081, kind: 'duplicate', names: ['Shop', 'Blog'] });
});
test('Zählung je Port: doppelt eingetragen ist EIN Problem (Liste und Kachel gleich)', () => {
  assert.deepStrictEqual(P.counts(ports), { ours: 1, free: 1, problems: 2 });
  assert.strictEqual(P.counts(ports).problems, P.conflicts(ports).length);
});
test('Vorschläge überspringen vergebene, bekannte und im Router belegte Ports', () => {
  assert.deepStrictEqual(P.suggest(ports, 8080, 3), [8082, 8083, 8084]);
  assert.deepStrictEqual(P.suggest([], 65534, 5), [65534, 65535]);
  assert.ok(!P.suggest([], 3305, 3).includes(3306), '3306 gehört typischerweise MySQL');
  assert.ok(!P.suggest([], 8442, 3).includes(8443));
  assert.deepStrictEqual(P.suggest([], 9001, 2, 65535, [9001]), [9002, 9003]);
});
test('Bereiche: nach Art des Dienstes, sonst nach Port', () => {
  assert.strictEqual(P.area(443), 'web'); assert.strictEqual(P.area(5433), 'db'); assert.strictEqual(P.area(25566), 'minecraft'); assert.strictEqual(P.area(1025), 'mail'); assert.strictEqual(P.area(22), 'other');
  assert.strictEqual(P.area(19132), 'minecraft', 'Bedrock');
  assert.strictEqual(P.area(9999, 'app'), 'app'); assert.strictEqual(P.area(8080, 'docker'), 'docker'); assert.strictEqual(P.area(30000, 'mc'), 'minecraft');
});
test('Router: Weiterleitungen auf diesen Rechner je Port', () => {
  const rt = { mappings: [{ externalPort: 25565, internalPort: 25565, protocol: 'TCP', here: true }, { externalPort: 19132, internalPort: 19132, protocol: 'UDP', here: true }, { externalPort: 80, internalPort: 80, protocol: 'TCP', here: false }, { externalPort: 25565, internalPort: 25565, protocol: 'UDP', here: true }] };
  const f = P.forwarded(rt);
  assert.deepStrictEqual(f.get(25565), ['TCP', 'UDP']);
  assert.deepStrictEqual(f.get(19132), ['UDP']);
  assert.ok(!f.has(80), 'Weiterleitung auf einen anderen Rechner zählt nicht');
  assert.strictEqual(P.forwarded(null).size, 0);
});
test('UDP-Ports öffentlicher Dienste (Bedrock) kommen als eigene Zeilen dazu', () => {
  const rt = { wanted: [{ port: 19132, protocol: 'UDP', label: 'Minecraft Bedrock: Freunde' }, { port: 25565, protocol: 'TCP', label: 'Minecraft: Freunde' }, { port: 19132, protocol: 'UDP', label: 'doppelt' }] };
  const rows = P.udpRows(rt, ports);
  assert.deepStrictEqual(rows, [{ port: 19132, proto: 'UDP', name: 'Minecraft Bedrock: Freunde', status: 'public', kind: 'mc' }]);
  assert.deepStrictEqual(P.udpRows(null, ports), []);
  assert.strictEqual(P.proto(rows[0]), 'UDP'); assert.strictEqual(P.proto({}), 'TCP');
});
test('Docker-Apps erkennen', () => {
  assert.deepStrictEqual([...P.dockerIds([{ id: 'a', kind: 'docker' }, { id: 'b', kind: 'node' }])], ['a']);
  assert.strictEqual(P.dockerIds(null).size, 0);
});
