const T = window.TRIBE, $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const euro = n => n === 0 ? 'Gratis' : n.toLocaleString('it-IT') + ' €';
const quando = d => new Date(d).toLocaleString('it-IT', {weekday:'short', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit'});

const card = e => `<a class="card" href="#${esc(e.id)}"><h2>${esc(e.titolo)}</h2><span class="price">${euro(e.prezzo)}</span><span class="meta">${quando(e.data)} · ${esc(e.citta)}</span></a>`;

function lista() {
  const ev = T.eventi.filter(e => !e.privato && new Date(e.data) >= new Date()).sort((a, b) => new Date(a.data) - new Date(b.data));
  return `<h1>Prossime uscite</h1><p class="sub">Scegli un evento, tocca Partecipa: ti scriviamo su WhatsApp.</p>` +
    (ev.length ? ev.map(card).join('') : '<p class="empty">Nessun evento in programma. Torna a trovarci presto.</p>');
}

function dettaglio(e) {
  const residui = e.capienza ? Math.max(e.capienza - e.confermati, 0) : null;
  const msg = `Ciao ${e.organizzatore}! Voglio partecipare a "${e.titolo}" (${quando(e.data)}). Il mio nome è: `;
  const riga = (k, v) => v ? `<span><b>${k}</b> ${esc(v)}</span>` : '';
  return `<a class="back" href="#">← Tutti gli eventi</a><h1>${esc(e.titolo)}</h1><span class="price big">${euro(e.prezzo)}</span>
    <div class="info">${riga('Quando', quando(e.data))}${riga('Città', e.citta)}${riga('Ritrovo', e.puntoIncontro)}${riga('Evento', e.puntoEvento)}${riga('Organizza', e.organizzatore)}
    <span><b>Confermati</b> ${e.confermati}${residui !== null ? ` · ${residui} posti liberi` : ''}</span></div>
    ${e.descrizione ? `<p>${esc(e.descrizione)}</p>` : ''}
    <p class="sub">La quota si regola con gli organizzatori, fuori dal sito.</p>
    <a class="cta" href="https://wa.me/${esc(e.whatsapp)}?text=${encodeURIComponent(msg)}">Partecipa su WhatsApp</a>
    <p class="note">Si apre WhatsApp con un messaggio già pronto: aggiungi il tuo nome e invialo. Il tuo numero arriva solo agli organizzatori, il sito non salva nulla.</p>`;
}

function render() {
  const e = T.eventi.find(x => x.id === location.hash.slice(1));
  $('#app').innerHTML = e ? dettaglio(e) : lista();
  scrollTo(0, 0);
}
addEventListener('hashchange', render); render();

// Installazione sulla home
const dlg = $('#install'); let dp = null;
const tab = t => {
  document.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.tab === t)));
  document.querySelectorAll('[data-pane]').forEach(p => p.hidden = p.dataset.pane !== t);
};
addEventListener('beforeinstallprompt', ev => { ev.preventDefault(); dp = ev; $('#one-tap').hidden = false; });
if (matchMedia('(display-mode: standalone)').matches || navigator.standalone) $('#btn-install').hidden = true;
$('#btn-install').onclick = () => { tab(/android/i.test(navigator.userAgent) ? 'android' : 'iphone'); dlg.showModal(); };
dlg.querySelector('.x').onclick = () => dlg.close();
document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => tab(b.dataset.tab));
$('#one-tap').onclick = async () => { if (dp) { dp.prompt(); await dp.userChoice; dlg.close(); } };

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');
