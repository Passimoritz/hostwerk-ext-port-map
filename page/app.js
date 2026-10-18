// Port-Übersicht – Seite: welcher Dienst welchen Port nutzt, wo es hakt und was noch frei ist.
const { html, t } = Hostwerk;
const P = PortMap;
const BADGE = { ours: 'ok', free: '', blocked: 'err', duplicate: 'warn' };
async function load() {
  const ports = await Hostwerk.get('/system/ports');
  const c = P.counts(ports);
  Hostwerk.render('#stats', html`
    <div class="card card-pad stat"><div class="k">${t('inUse')}</div><div class="v">${c.ours}</div></div>
    <div class="card card-pad stat"><div class="k">${t('reserved')}</div><div class="v">${c.free}</div></div>
    <div class="card card-pad stat"><div class="k">${t('problems')}</div><div class="v">${c.problems}</div></div>`);
  const cf = P.conflicts(ports);
  Hostwerk.render('#conflicts', cf.length ? html`<div class="card card-pad problem"><h3 class="card-title" style="margin:0 0 8px;font-size:14px">${t('conflictsTitle')}</h3>${cf.map((x) => html`<div class="small"><b class="mono">${x.port}</b> · ${x.name} – ${x.kind === 'blocked' ? t('blockedBy', { by: x.by || t('otherProgram') }) : t('sharedWith', { with: x.with.join(', ') })}</div>`)}<div class="tiny muted" style="margin-top:6px">${t('fixHint')}</div></div>` : '');
  Hostwerk.render('#table', html`<table class="table"><thead><tr><th>${t('port')}</th><th>${t('service')}</th><th>${t('area')}</th><th>${t('state')}</th></tr></thead><tbody>${P.sorted(ports).map((p) => html`<tr><td class="mono">${p.port}</td><td>${p.name}</td><td class="muted">${t('area.' + P.area(p.port))}</td><td><span class="badge ${BADGE[p.status] || ''}">${t('status.' + p.status)}</span></td></tr>`)}</tbody></table>`);
  Hostwerk.render('#free', html`${[['web', 8080], ['db', 3306], ['minecraft', 25565]].map(([k, from]) => html`<div class="card card-pad"><div class="k">${t('area.' + k)}</div><div class="mono">${P.suggest(ports, from, 4).join(' · ')}</div></div>`)}`);
}
Hostwerk.ready().then(() => { load(); setInterval(load, 20000); Hostwerk.on('service', load); Hostwerk.on('lang', load); });
