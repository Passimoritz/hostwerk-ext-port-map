// Port-Übersicht – Seite: welcher Dienst welchen Port nutzt, wo es hakt und was noch frei ist.
const { html, t } = Hostwerk;
const P = PortMap;
const BADGE = { ours: 'hw-ok', free: '', blocked: 'hw-err', duplicate: 'hw-warn' };
async function load() {
  const ports = await Hostwerk.get('/system/ports');
  const c = P.counts(ports);
  Hostwerk.render('#stats', html`
    <div class="hw-card hw-stat"><div class="hw-k">${t('inUse')}</div><div class="hw-v">${c.ours}</div></div>
    <div class="hw-card hw-stat"><div class="hw-k">${t('reserved')}</div><div class="hw-v">${c.free}</div></div>
    <div class="hw-card hw-stat"><div class="hw-k">${t('problems')}</div><div class="hw-v">${c.problems}</div></div>`);
  const cf = P.conflicts(ports);
  Hostwerk.render('#conflicts', cf.length ? html`<div class="hw-card problem"><h3 class="hw-h3">${t('conflictsTitle')}</h3>${cf.map((x) => html`<div class="hw-small"><b class="hw-mono">${x.port}</b> · ${x.name} – ${x.kind === 'blocked' ? t('blockedBy', { by: x.by || t('otherProgram') }) : t('sharedWith', { with: x.with.join(', ') })}</div>`)}<div class="hw-tiny hw-muted" style="margin-top:6px">${t('fixHint')}</div></div>` : '');
  Hostwerk.render('#table', html`<table class="hw-table"><thead><tr><th>${t('port')}</th><th>${t('service')}</th><th>${t('area')}</th><th>${t('state')}</th></tr></thead><tbody>${P.sorted(ports).map((p) => html`<tr><td class="hw-mono">${p.port}</td><td>${p.name}</td><td class="hw-muted">${t('area.' + P.area(p.port))}</td><td><span class="hw-badge ${BADGE[p.status] || ''}">${t('status.' + p.status)}</span></td></tr>`)}</tbody></table>`);
  Hostwerk.render('#free', html`${[['web', 8080], ['db', 3306], ['minecraft', 25565]].map(([k, from]) => html`<div class="hw-card"><div class="hw-k">${t('area.' + k)}</div><div class="hw-mono">${P.suggest(ports, from, 4).join(' · ')}</div></div>`)}`);
}
Hostwerk.ready().then(() => { load(); setInterval(load, 20000); Hostwerk.on('service', load); Hostwerk.on('lang', load); });
