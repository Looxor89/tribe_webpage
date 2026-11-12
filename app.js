const T = window.TRIBE, S = window.SITO, $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const euro = n => n === 0 ? 'Gratis' : n.toLocaleString('it-IT') + ' €';
const quando = d => new Date(d).toLocaleString('it-IT', {weekday:'short', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit'});
const ico = p => `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
const IG = ico('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor"/>');
const MAIL = ico('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>');

function home() {
  return `<a class="navcard" href="#uscite"><span>Prossime uscite</span><span aria-hidden="true">→</span></a>
    <section><h2 class="sez">Chi siamo</h2><img class="foto" src="${esc(S.chiSiamo.img)}" alt="${esc(S.chiSiamo.alt)}"><p>${esc(S.chiSiamo.testo)}</p></section>
    <section><h2 class="sez">Social</h2><div class="social">
      <a href="${esc(S.social.instagram)}" target="_blank" rel="noopener">${IG}Instagram</a>
      <a href="mailto:${esc(S.social.email)}">${MAIL}${esc(S.social.email)}</a></div></section>`;
}

const card = e => `<a class="card" href="#${esc(e.id)}"><h2>${esc(e.titolo)}</h2><span class="price">${euro(e.prezzo)}</span><span class="meta">${quando(e.data)} · ${esc(e.citta)}</span></a>`;

function uscite() {
  const ev = T.eventi.filter(e => !e.privato && new Date(e.data) >= new Date()).sort((a, b) => new Date(a.data) - new Date(b.data));
  return `<a class="back" href="#">← Home</a><h1>Prossime uscite</h1><p class="sub">Scegli un evento, tocca Partecipa: ti scriviamo su WhatsApp.</p>` +
    (ev.length ? ev.map(card).join('') : '<p class="empty">Nessun evento in programma. Torna a trovarci presto.</p>');
}

function dettaglio(e) {
  const residui = e.capienza ? Math.max(e.capienza - e.confermati, 0) : null;
  const msg = `Ciao ${e.organizzatore}! Voglio partecipare a "${e.titolo}" (${quando(e.data)}). Il mio nome è: `;
  const riga = (k, v) => v ? `<span><b>${k}</b> ${esc(v)}</span>` : '';
  return `<a class="back" href="#uscite">← Tutte le uscite</a><h1>${esc(e.titolo)}</h1><span class="price big">${euro(e.prezzo)}</span>
    <div class="info">${riga('Quando', quando(e.data))}${riga('Città', e.citta)}${riga('Ritrovo', e.puntoIncontro)}${riga('Evento', e.puntoEvento)}${riga('Organizza', e.organizzatore)}
    <span><b>Confermati</b> ${e.confermati}${residui !== null ? ` · ${residui} posti liberi` : ''}</span></div>
    ${e.descrizione ? `<p>${esc(e.descrizione)}</p>` : ''}
    <p class="sub">La quota si regola con gli organizzatori, fuori dal sito.</p>
    <a class="cta" href="https://wa.me/${esc(e.whatsapp)}?text=${encodeURIComponent(msg)}">Partecipa su WhatsApp</a>
    <p class="note">Si apre WhatsApp con un messaggio già pronto: aggiungi il tuo nome e invialo. Il tuo numero arriva solo agli organizzatori, il sito non salva nulla.</p>`;
}

function render() {
  const h = location.hash.slice(1), e = T.eventi.find(x => x.id === h);
  $('#app').innerHTML = h === 'uscite' ? uscite() : e ? dettaglio(e) : home();
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

if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });

// Aggiornamenti automatici: confronta i file del sito con quelli caricati all'apertura
const FILES = ['index.html', 'style.css', 'app.js', 'config.js', 'eventi.js'];
const hash = s => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
const snapshot = async () => hash((await Promise.all(FILES.map(f => fetch(f, { cache: 'no-cache' }).then(r => r.text())))).join('\0'));
let base = null, bannerShown = false;
function banner() {
  if (bannerShown) return; bannerShown = true;
  const b = document.createElement('div'); b.className = 'banner';
  b.innerHTML = 'Nuova versione disponibile <button type="button">Aggiorna</button>';
  b.querySelector('button').onclick = () => location.reload(); document.body.append(b);
}
async function controlla(auto) {
  try {
    const now = await snapshot();
    if (base === null) { base = now; $('#ver').textContent = 'v. ' + now.slice(0, 6); return; }
    if (now !== base) auto ? location.reload() : banner();
  } catch (e) {}
}
controlla();
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') controlla(true); });
setInterval(() => { if (document.visibilityState === 'visible') controlla(false); }, 300000);
