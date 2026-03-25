const noten = [
  { note: '1+', punkte: 15, minProz: 95 },
  { note: '1',  punkte: 14, minProz: 90 },
  { note: '1-', punkte: 13, minProz: 85 },
  { note: '2+', punkte: 12, minProz: 80 },
  { note: '2',  punkte: 11, minProz: 75 },
  { note: '2-', punkte: 10, minProz: 70 },
  { note: '3+', punkte: 9,  minProz: 65 },
  { note: '3',  punkte: 8,  minProz: 60 },
  { note: '3-', punkte: 7,  minProz: 55 },
  { note: '4+', punkte: 6,  minProz: 50 },
  { note: '4',  punkte: 5,  minProz: 45 },
  { note: '4-', punkte: 4,  minProz: 40 },
  { note: '5+', punkte: 3,  minProz: 33 },
  { note: '5',  punkte: 2,  minProz: 27 },
  { note: '5-', punkte: 1,  minProz: 20 },
  { note: '6',  punkte: 0,  minProz: 0 }
];

const inputElement = document.getElementById('maxPunkte');
const tbody = document.getElementById('tabellenKoerper');
const ungerundetCheckbox = document.getElementById('ungerundetCheckbox');
const toggleRow = document.getElementById('toggleRow');
const rundungToggle = document.getElementById('rundungToggle');
const downloadBtn = document.getElementById('downloadBtn');

ungerundetCheckbox.addEventListener('change', function() {
  if (this.checked) {
    toggleRow.classList.add('hidden');
  } else {
    toggleRow.classList.remove('hidden');
  }
  tabelleAktualisieren();
});

rundungToggle.addEventListener('change', tabelleAktualisieren);
inputElement.addEventListener('input', tabelleAktualisieren);

function tabelleAktualisieren() {
  let maxPunkte = parseInt(inputElement.value, 10);
  const gueltig = !isNaN(maxPunkte) && maxPunkte > 0;
  const istUngerundet = ungerundetCheckbox.checked;
  const istAufrunden = !istUngerundet && rundungToggle.checked;

  if (!gueltig) {
    tbody.innerHTML = '';
    return;
  }

  const minWerte = noten.map(n => {
    const exakt = (n.minProz / 100) * maxPunkte;
    if (istUngerundet) {
      return exakt;
    } else {
      return istAufrunden ? Math.ceil(exakt) : Math.floor(exakt);
    }
  });

  const maxWerte = new Array(noten.length);
  maxWerte[0] = maxPunkte;
  const delta = istUngerundet ? 0.01 : 1;
  for (let i = 1; i < noten.length; i++) {
    maxWerte[i] = minWerte[i - 1] - delta;
  }

  let htmlString = '';
  for (let i = 0; i < noten.length; i++) {
    const note = noten[i].note;
    const punktzahl = noten[i].punkte;
    let bereichAnzeige = '—';

    const minWert = minWerte[i];
    const maxWert = maxWerte[i];

    if (minWert <= maxWert) {
      if (istUngerundet) {
        bereichAnzeige = `${minWert.toFixed(2)} – ${maxWert.toFixed(2)}`;
      } else {
        bereichAnzeige = `${Math.floor(minWert)} – ${Math.floor(maxWert)}`;
      }
    }

    htmlString += `<tr>
      <td>${note}</td>
      <td>${punktzahl}</td>
      <td>${bereichAnzeige}</td>
    </tr>`;
  }

  tbody.innerHTML = htmlString;
}

function getRundungsModus() {
  if (ungerundetCheckbox.checked) return 'ungerundet';
  return rundungToggle.checked ? 'aufgerundet' : 'abgerundet';
}

downloadBtn.addEventListener('click', function() {
  const maxPunkte = inputElement.value.trim();
  if (maxPunkte === '' || isNaN(parseInt(maxPunkte, 10)) || parseInt(maxPunkte, 10) <= 0) {
    alert('Bitte gültige Maximalpunktzahl eingeben.');
    return;
  }
  const modus = getRundungsModus();
  const filename = `notentabelle_${maxPunkte}p_${modus}.png`;

  const table = document.querySelector('table');

  html2canvas(table, {
    scale: 2,
    backgroundColor: '#ffffff'
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(error => {
    console.error('Fehler beim Erstellen des Bildes:', error);
    alert('Fehler beim Erstellen des Bildes. Bitte versuche es erneut.');
  });
});

tabelleAktualisieren();
