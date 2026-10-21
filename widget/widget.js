// Port-Übersicht – Kachel: Konflikte auf einen Blick (je Port einmal gezählt).
const { html, t } = Hostwerk;
async function load() {
  const ports = await Hostwerk.get('/system/ports');
  const cf = PortMap.conflicts(ports);
  document.getElementById('n').textContent = Hostwerk.fmt.number(cf.length);
  Hostwerk.render('#list', cf.length
    ? html`${cf.slice(0, 3).map((x) => html`<div class="small ellipsis"><span class="dot err"></span> ${x.port} · ${x.names.join(', ')}</div>`)}${cf.length > 3 ? html`<div class="tiny muted">${t('more', { n: cf.length - 3 })}</div>` : ''}`
    : html`<div class="small muted"><span class="dot ok"></span> ${t('noConflicts')}</div>`);
}
async function reload() {
  try { await load(); } catch (e) { document.getElementById('n').textContent = ''; Live.failed(Hostwerk, '#list', e, reload, { compact: true }); }
}
Hostwerk.ready().then(() => { reload(); Live.every(30000, reload); Hostwerk.on('service', Live.throttle(reload, 3000)); Hostwerk.on('lang', reload); });
