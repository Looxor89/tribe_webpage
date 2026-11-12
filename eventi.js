// Qui gestisci gli eventi. Per aggiungerne uno, copia un blocco { ... } e cambia i valori.
// "confermati" lo aggiorni tu a mano quando una persona ti conferma. "whatsapp": numero con prefisso, senza + (es. 393331234567).
window.TRIBE = {
  eventi: [
    {
      id: 'prova',                       // appare nel link: tuosito/#prova
      titolo: 'Evento di prova',
      data: '2026-12-05T20:00',
      citta: 'Roma',
      prezzo: 10,                        // 0 = Gratis. La quota si paga fuori dal sito
      capienza: 20,
      confermati: 3,
      puntoIncontro: 'Piazza del Popolo',
      puntoEvento: 'Terminillo',
      organizzatore: 'Andrea',
      whatsapp: '393331234567',          // SOSTITUISCI col tuo numero
      descrizione: 'Questo è un evento di prova per vedere come appare la pagina.',
      privato: false                     // true = non compare in elenco, solo da link diretto
    }
  ]
};
