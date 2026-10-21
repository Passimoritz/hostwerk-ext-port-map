// Port-Übersicht – Seite: welcher Dienst welchen Port nutzt, wo es hakt, was von außen offen ist und was noch frei ist.
const { html, t } = Hostwerk;
const P = PortMap;
const BADGE = { ours: 'ok', free: '', blocked: 'err', duplicate: 'warn', public: 'accent' };

/** Router-Erweiterung (UPnP-Freigaben, öffentliche UDP-Ports) – fehlt sie oder antwortet der Router nicht: ohne Spalte. */
async function router() { try { return await Hostwerk.get('/router'); } catch { return null; } }
/** Apps, um Docker-Container zu erkennen – ohne Antwort einfach ohne Kennzeichnung. */
async function apps() { try { return await Hostwerk.get('/apps'); } catch { return []; } }

async function load() {
  const [raw, rt, ax] = await Promise.all([Hostwerk.get('/system/ports'), router(), apps()]);
  const docker = P.dockerIds(ax);
  const ports = [...(Array.isArray(raw) ? raw : []), ...P.udpRows(rt, raw)].map((p) => ({ ...p, kind: p.kind === 'app' && docker.has(p.id) ? 'docker' : p.kind }));
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
      <button type="button" class="btn sm" data-fix="${x.port}" aria-label="${t('fixName', { port: x.port })}">${t('fix')}</button></div>`)}
    <div class="tiny muted">${t('fixHint')}</div></div>` : '');
  Hostwerk.render('#table', html`<table class="table"><thead><tr><th>${t('port')}</th><th>${t('proto')}</th><th>${t('service')}</th><th>${t('area')}</th><th>${t('state')}</th>${fwd ? html`<th>${t('outside')}</th>` : ''}</tr></thead>
    <tbody>${P.sorted(ports).map((p) => { const f = fwd && fwd.get(p.port); return html`<tr><td class="mono">${p.port}</td><td class="muted small">${P.proto(p)}</td><td>${p.name || t('unnamed')}</td><td class="muted">${t('area.' + P.area(p.port, p.kind))}</td><td><span class="badge ${BADGE[p.status] || ''}">${t('status.' + p.status)}</span></td>${fwd ? html`<td>${f && f.includes(P.proto(p)) ? html`<span class="badge accent" title="${t('forwardedTitle')}">${t('forwarded')}</span>` : html`<span class="muted small">–</span>`}</td>` : ''}</tr>`; })}</tbody></table>
    ${fwd ? '' : html`<p class="tiny muted table-note">${t('noRouter')}</p>`}`);
  const taken = fwd ? [...fwd.keys()] : [];
  Hostwerk.render('#free', html`${[['web', 8080], ['db', 3307], ['minecraft', 25565], ['other', 9001]].map(([k, from]) => html`<div class="card card-pad stack free-card"><div class="k">${t('area.' + k)}</div>
    <div class="row-tight free-list">${P.suggest(ports, from, 4, 65535, taken).map((n) => html`<button type="button" class="btn sm ghost mono" data-copy="${n}" aria-label="${t('copyName', { port: n })}" title="${t('copy')}">${n}</button>`)}</div></div>`)}`);
}
// Fehler: Kennzahlen leeren (kein ewiges Skelett) und in der Tabelle „Erneut versuchen“ anbieten
async function reload() {
  try { await load(); } catch (e) { Hostwerk.render('#stats', ''); Hostwerk.render('#conflicts', ''); Hostwerk.render('#free', ''); Live.failed(Hostwerk, '#table', e, reload); }
}

document.addEventListener('click', (e) => {
  const c = e.target.closest('[data-copy]');
  if (c) { Hostwerk.copy(c.dataset.copy).then(() => Hostwerk.toast(t('copied', { port: c.dataset.copy }), { kind: 'success' })).catch((er) => Hostwerk.toast(er.message, { kind: 'error' })); return; }
  // Hostwerks eigene Port-Prüfung ändert den Port mit einem Klick und prüft dabei, ob der neue wirklich frei ist
  if (e.target.closest('[data-fix]')) Hostwerk.navigate(P.FIX_ROUTE);
});

Hostwerk.ready().then(() => {
  reload();
  Live.every(20000, reload);
  Hostwerk.on('service', Live.throttle(reload, 3000));
  Hostwerk.on('lang', reload);
});
