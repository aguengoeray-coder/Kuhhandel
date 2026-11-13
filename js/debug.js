// Debug-Modus (nur über ?debug=1): Sichtwechsel, Infofenster, Abkürzungen
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

// Kleine Knöpfe oben links auf dem Spieltisch
export function debugChips(d) {
  const view = d.local ? `<button type="button" class="dchip" data-dbg="cycleView" title="Spieler wechseln">Sicht: <b>${esc(d.viewName)}</b> ⟳</button>` : '';
  return `<div class="dchips">${view}<button type="button" class="dchip red" data-dbg="panel">DEBUG</button></div>`;
}

// Infofenster
export function debugPanel(d) {
  const row = (k, v) => `<div class="drow"><span>${k}</span><b>${v}</b></div>`;
  const onoff = (on) => (on ? 'an' : 'aus');
  const players = d.players.map((p) => `<button type="button" class="dview ${p.id === d.viewAs ? 'on' : ''}" data-dbg="view" data-v="${esc(p.id)}">${esc(p.name)}</button>`).join('');
  const testTools = d.local ? `
    <h3>Testspiel</h3>
    <div class="dviews">Sicht: ${players}</div>
    <div class="dbtns">
      <button type="button" data-dbg="autoView" class="${d.autoView ? 'on' : ''}">Sicht folgt dem, der dran ist: ${onoff(d.autoView)}</button>
      <button type="button" data-dbg="bots" class="${d.bots ? 'on' : ''}">Test-Spieler spielen selbst: ${onoff(d.bots)}</button>
      <button type="button" data-dbg="fast" class="${d.fast ? 'on' : ''}">Countdown 5 s: ${onoff(d.fast)}</button>
    </div>
    <h3>Abkürzungen</h3>
    <div class="dbtns">
      <button type="button" data-dbg="forward">Vorspulen (bis auf 2 Karten verteilen)</button>
      <button type="button" data-dbg="donkey">Esel als nächste Karte</button>
      <button type="button" data-dbg="rat">Ratte als nächste Karte</button>
      <button type="button" data-dbg="special">Spezialkarte als nächste Karte</button>
      <button type="button" data-dbg="news">Börsen-News als nächste Karte</button>
      <button type="button" data-dbg="broke">Geld von „${esc(d.viewName)}“ auf 0 + 10 setzen</button>
      <button type="button" data-dbg="rich">„${esc(d.viewName)}“ bekommt viel Geld (13 Scheine)</button>
      <button type="button" data-dbg="zoo">„${esc(d.viewName)}“ bekommt viele Tiere</button>
      <button type="button" data-dbg="trade22">Kuhhandel 2 gegen 2 vorbereiten</button>
      <button type="button" data-dbg="quartets">Alle Quartette verteilen (du zuerst)</button>
      <button type="button" data-dbg="end" class="red">Spiel sofort beenden (Abrechnung + Siegertreppchen)</button>
    </div>` : '';
  return `<div class="dpanel" role="dialog" aria-label="Debug">
    <div class="dhead"><strong>Debug</strong><button type="button" data-dbg="panel" aria-label="Schließen">✕</button></div>
    <div class="dbody">
      ${testTools}
      <h3>Verbindung</h3>
      ${row('Version', esc(d.version))}
      ${row('Spiel', d.local ? 'Testspiel (nur dieses Gerät)' : esc(d.gameId || '–'))}
      ${row('Live-Verbindung', esc(d.channel))}
      ${row('Letzter Abgleich', esc(d.lastSync))}
      ${row('Uhr-Abweichung zum Server', `${Math.round(d.clockOffset)} ms`)}
      ${row('Spielstand-Version', esc(d.gameVersion))}
      ${row('Phase / am Zug', `${esc(d.phase)} / ${esc(d.turnName)}`)}
      ${row('Online', esc(d.online))}
      ${row('Fehler', d.errors.length ? `<span class="derr">${d.errors.length}</span>` : '0')}
      <div class="dbtns">
        ${d.local ? '' : '<button type="button" data-dbg="reload">Stand neu laden</button>'}
        <button type="button" data-dbg="report" class="on">Fehlerbericht kopieren</button>
      </div>
      ${d.reportText ? `<textarea class="dreport" readonly>${esc(d.reportText)}</textarea><small>Kopieren hat nicht geklappt – Text oben markieren und kopieren.</small>` : ''}
    </div>
  </div>`;
}
