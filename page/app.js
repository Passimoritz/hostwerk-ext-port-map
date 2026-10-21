// Port-Übersicht – Seite: welcher Dienst welchen Port nutzt, wo es hakt, was von außen offen ist und was noch frei ist.
// „Port ändern“ läuft direkt über Hostwerk (change:ports, Hostwerk fragt vorher), „Ist der Port frei?“ über /system/ports/free.
const { html, t } = Hostwerk;
const P = PortMap;
const BADGE = { ours: 'ok', free: '', blocked: 'err', duplicate: 'warn', public: 'accent' };
let rows = []; // zuletzt geladene Einträge (für „Port ändern“)

/** Router-Erweiterung (UPnP-Freigaben, öffentliche UDP-Ports) – fehlt sie oder antwortet der Router nicht: ohne Spalte. */
async function router() { try { return await Hostwerk.get('/router'); } catch { return null; } }
/** Apps, um Docker-Container zu erkennen – ohne Antwort einfach ohne Kennzeichnung. */
async function apps() { try { return await Hostwerk.get('/apps'); } catch { return []; } }

async function load() {
  const [raw, rt, ax] = await Promise.all([Hostwerk.get('/system/ports'), router(), apps()]);
  const docker = P.dockerIds(ax);
  // fixKind: Art für „Port ändern“ (Docker-Apps sind dort „app“)
  const ports = [...(Array.isArray(raw) ? raw : []), ...P.udpRows(rt, raw)].map((p) => ({ ...p, fixKind: p.kind, kind: p.kind === 'app' && docker.has(p.id) ? 'docker' : p.kind }));
  rows = ports;
  const fwd = rt ? P.forwarded(rt) : null;
  const c = P.counts(ports);
  Hostwerk.render('#stats', html`
    <div class="card card-pad stat"><div class="k">${t('inUse')}</div><div class="v">${Hostwerk.fmt.number(c.ours)}</div></div>
    <div class="card card-pad stat"><div class="k">${t('reserved')}</div><div class="v">${Hostwerk.fmt.number(c.free)}</div></div>
    <div class="card card-pad stat"><div class="k">${t('problems')}</div><div class="v">${Hostwerk.fmt.number(c.problems)}</div></div>
    ${fwd ? html`<div class="card card-pad stat"><div class="k">${t('forwardedCount')}</div><div class="v">${Hostwerk.fmt.number(fwd.size)}</div></div>` : ''}`);
  const cf = P.conflicts(ports);
  Hostwerk.render('#conflicts', cf.length ? html`<div class="card card-pad problem stack">
    <h3 class="conflicts-title">${t('conflictsTitle')}</h3>
    ${cf.map((x) => html`<div class="row conflict"><span class="small grow"><b class="mono">${x.port}</b> · ${x.names.join(', ')} – ${x.kind === 'blocked' ? t('blockedBy', { by: x.by || t('otherProgram') }) : t('sharedBy', { n: x.names.length })}</span>
      ${x.entries.filter(P.canFix).map((p) => fixButton(p, x.entries.length > 1))}</div>`)}
    <div class="tiny muted">${t('fixHint')}</div></div>` : '');
  Hostwerk.render('#table', html`<table class="table"><thead><tr><th>${t('port')}</th><th>${t('proto')}</th><th>${t('service')}</th><th>${t('area')}</th><th>${t('state')}</th>${fwd ? html`<th>${t('outside')}</th>` : ''}<th><span class="sr">${t('actions')}</span></th></tr></thead>
    <tbody>${P.sorted(ports).map((p) => { const f = fwd && fwd.get(p.port); return html`<tr><td class="mono">${p.port}</td><td class="muted small">${P.proto(p)}</td><td>${p.name || t('unnamed')}</td><td class="muted">${t('area.' + P.area(p.port, p.kind))}</td><td><span class="badge ${BADGE[p.status] || ''}">${t('status.' + p.status)}</span></td>${fwd ? html`<td>${f && f.includes(P.proto(p)) ? html`<span class="badge accent" title="${t('forwardedTitle')}">${t('forwarded')}</span>` : html`<span class="muted small">–</span>`}</td>` : ''}<td class="fix-cell">${P.canFix(p) ? fixButton(p, true, 'xs ghost') : ''}</td></tr>`; })}</tbody></table>
    ${fwd ? '' : html`<p class="tiny muted table-note">${t('noRouter')}</p>`}`);
  const taken = fwd ? [...fwd.keys()] : [];
  Hostwerk.render('#free', html`${[['web', 8080], ['db', 3307], ['minecraft', 25565], ['other', 9001]].map(([k, from]) => html`<div class="card card-pad stack free-card"><div class="k">${t('area.' + k)}</div>
    <div class="row-tight free-list">${P.suggest(ports, from, 4, 65535, taken).map((n) => html`<button type="button" class="btn sm ghost mono" data-copy="${n}" aria-label="${t('copyName', { port: n })}" title="${t('copy')}">${n}</button>`)}</div></div>`)}`);
}
/** Knopf „Port ändern“ für genau diesen Dienst (named: mit Namen, wenn mehrere in einer Zeile stehen). */
function fixButton(p, named, cls = 'sm') {
  const i = rows.indexOf(p);
  return html`<button type="button" class="btn ${cls}" data-fix="${i}" aria-label="${t('fixName', { port: p.port, name: p.name })}" title="${t('fixTitle')}">${named && cls === 'sm' ? t('fixFor', { name: p.name }) : t('fix')}</button>`;
}
/** Hostwerk gibt dem gestoppten Dienst einen wirklich freien Port – vorher fragt Hostwerk nach. */
async function fix(p, btn) {
  btn.disabled = true;
  try {
    const r = await Hostwerk.post('/system/ports/fix', P.fixBody(p));
    Hostwerk.toast(t(r.free === false ? 'fixedCheck' : 'fixed', { name: r.name || p.name, old: r.old, port: r.port }), { kind: r.free === false ? 'warn' : 'success' });
  } catch (er) { if (!/declined|abgelehnt/i.test(er.message)) Hostwerk.toast(er.message, { kind: 'error' }); }
  btn.disabled = false;
  reload();
}
/** „Ist der Port frei?“ – fragt Hostwerk, nicht nur die eigene Liste. */
async function check(value) {
  const port = P.parsePort(value);
  if (!port) return Hostwerk.render('#check-result', html`<span class="c-err small" role="alert">${t('checkInvalid')}</span>`);
  Hostwerk.render('#check-result', html`<span class="muted small">${t('checking')}</span>`);
  try {
    const v = P.freeVerdict(await Hostwerk.get(`/system/ports/free?port=${port}`));
    const text = {
      free: t('checkFree', { port }),
      reserved: t('checkReserved', { port, names: v.names.join(', ') }),
      ours: t('checkOurs', { port, names: v.names.join(', ') }),
      taken: t('checkTaken', { port, by: v.by || t('otherProgram') }),
    }[v.state];
    Hostwerk.render('#check-result', html`<span class="badge ${v.state === 'free' ? 'ok' : v.state === 'taken' ? 'err' : 'warn'}">${t('verdict.' + v.state)}</span> <span class="small">${text}</span>`);
  } catch (er) { Hostwerk.render('#check-result', html`<span class="c-err small" role="alert">${er.message}</span>`); }
  return undefined;
}
// Fehler: Kennzahlen leeren (kein ewiges Skelett) und in der Tabelle „Erneut versuchen“ anbieten
async function reload() {
  try { await load(); } catch (e) { Hostwerk.render('#stats', ''); Hostwerk.render('#conflicts', ''); Hostwerk.render('#free', ''); Live.failed(Hostwerk, '#table', e, reload); }
}

document.addEventListener('click', (e) => {
  const c = e.target.closest('[data-copy]');
  if (c) { Hostwerk.copy(c.dataset.copy).then(() => Hostwerk.toast(t('copied', { port: c.dataset.copy }), { kind: 'success' })).catch((er) => Hostwerk.toast(er.message, { kind: 'error' })); return; }
  const f = e.target.closest('[data-fix]');
  if (f) { const p = rows[Number(f.dataset.fix)]; if (p) fix(p, f); }
});
document.getElementById('check-form').addEventListener('submit', (e) => { e.preventDefault(); check(document.getElementById('check-port').value); });

Hostwerk.ready().then(() => {
  reload();
  Live.every(20000, reload);
  Hostwerk.on('service', Live.throttle(reload, 3000));
  Hostwerk.on('lang', reload);
});
