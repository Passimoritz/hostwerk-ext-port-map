const test = require('node:test');
const assert = require('node:assert');
const P = require('../page/lib.js');
const ports = [
  { port: 8080, name: 'Apache', status: 'ours' },
  { port: 3306, name: 'MariaDB', status: 'blocked', usedBy: { name: 'mysqld.exe' } },
  { port: 8081, name: 'Shop', status: 'duplicate' },
  { port: 8081, name: 'Blog', status: 'duplicate' },
  { port: 25565, name: 'Freunde', status: 'free' },
];

test('Probleme zuerst, sonst nach Port', () => {
  assert.deepStrictEqual(P.sorted(ports).map((p) => p.port), [3306, 8081, 8081, 8080, 25565]);
});
test('Konflikte mit Ursache', () => {
  const c = P.conflicts(ports);
  assert.deepStrictEqual(c[0], { port: 3306, name: 'MariaDB', kind: 'blocked', by: 'mysqld.exe' });
  assert.deepStrictEqual(c.filter((x) => x.kind === 'duplicate').map((x) => x.with), [['Blog'], ['Shop']]);
});
test('Vorschläge überspringen vergebene Ports', () => {
  assert.deepStrictEqual(P.suggest(ports, 8080, 3), [8082, 8083, 8084]);
  assert.deepStrictEqual(P.suggest([], 65534, 5), [65534, 65535]);
});
test('Bereiche', () => {
  assert.strictEqual(P.area(443), 'web'); assert.strictEqual(P.area(5433), 'db'); assert.strictEqual(P.area(25566), 'minecraft'); assert.strictEqual(P.area(1025), 'mail'); assert.strictEqual(P.area(22), 'other');
});
test('Zählung', () => { assert.deepStrictEqual(P.counts(ports), { ours: 1, free: 1, problems: 3 }); });
