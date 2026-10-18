// Port-Übersicht – Kachel: Konflikte auf einen Blick.
const { html, t } = Hostwerk;
async function load() {
  const ports = await Hostwerk.get('/system/ports');
  const cf = PortMap.conflicts(ports);
  document.getElementById('n').textContent = String(cf.length);
  Hostwerk.render('#list', cf.length ? html`${cf.slice(0, 3).map((x) => html`<div class="hw-small"><span class="hw-dot hw-err"></span> ${x.port} · ${x.name}</div>`)}` : html`<div class="hw-small hw-muted"><span class="hw-dot hw-ok"></span> ${t('noConflicts')}</div>`);
}
Hostwerk.ready().then(() => { load(); setInterval(load, 30000); Hostwerk.on('service', load); });
