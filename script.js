const noten = [
  { note: '1+', punkte: 15, minProz: 95, maxProz: 100 },
  { note: '1',  punkte: 14, minProz: 90, maxProz: 94 },
  { note: '1-', punkte: 13, minProz: 85, maxProz: 89 },
  { note: '2+', punkte: 12, minProz: 80, maxProz: 84 },
  { note: '2',  punkte: 11, minProz: 75, maxProz: 79 },
  { note: '2-', punkte: 10, minProz: 70, maxProz: 74 },
  { note: '3+', punkte: 9,  minProz: 65, maxProz: 69 },
  { note: '3',  punkte: 8,  minProz: 60, maxProz: 64 },
  { note: '3-', punkte: 7,  minProz: 55, maxProz: 59 },
  { note: '4+', punkte: 6,  minProz: 50, maxProz: 54 },
  { note: '4',  punkte: 5,  minProz: 45, maxProz: 49 },
  { note: '4-', punkte: 4,  minProz: 40, maxProz: 44 },
  { note: '5+', punkte: 3,  minProz: 33, maxProz: 39 },
  { note: '5',  punkte: 2,  minProz: 27, maxProz: 32 },
  { note: '5-', punkte: 1,  minProz: 20, maxProz: 26 },
  { note: '6',  punkte: 0,  minProz: 0,  maxProz: 19 }
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

  let htmlString = '';

  if (!gueltig) {
    for (let n of noten) {
      htmlString += `<tr>
        <td>${n.note}</td>
        <td>${n.punkte}</td>
        <td>—</td>
      </tr>`;
    }
    tbody.innerHTML = htmlString;
    return;
  }

  if (istUngerundet) {
    // Exakte Punkte aus den Prozenten berechnen
    let minPunkte = noten.map(n => (n.minProz / 100) * maxPunkte);
    let maxPunkteArr = noten.map(n => (n.maxProz / 100) * maxPunkte);

    // Auf zwei Nachkommastellen runden
    minPunkte = minPunkte.map(v => Math.round(v * 100) / 100);
    maxPunkteArr = maxPunkteArr.map(v => Math.round(v * 100) / 100);

    // Überschneidungen korrigieren: Die bessere Note (höhere Punktzahl) bekommt den gemeinsamen Grenzwert,
    // die schlechtere Note beginnt beim nächsthöheren Wert.
    for (let i = 0; i < noten.length - 1; i++) {
      // i ist die bessere Note (oben in der Liste), i+1 die schlechtere
      if (maxPunkteArr[i] >= minPunkte[i + 1]) {
        // Grenze verschieben: Die schlechtere Note beginnt bei maxPunkte[i] + 0.01
        minPunkte[i + 1] = maxPunkteArr[i] + 0.01;
        // Erneut auf zwei Stellen runden (wegen Rundungsfehlern)
        minPunkte[i + 1] = Math.round(minPunkte[i + 1] * 100) / 100;
      }
    }

    // Ausgabe
    for (let i = 0; i < noten.length; i++) {
      const n = noten[i];
      const min = minPunkte[i].toFixed(2);
      const max = maxPunkteArr[i].toFixed(2);
      htmlString += `<tr>
        <td>${n.note}</td>
        <td>${n.punkte}</td>
        <td>${min} – ${max}</td>
      </tr>`;
    }
  } else {
    // Auf‑ oder Abrunden: Jede ganze Punktzahl einer Note zuordnen (unverändert)
    let noteMin = new Array(noten.length).fill(Infinity);
    let noteMax = new Array(noten.length).fill(-Infinity);

    for (let punktzahl = 0; punktzahl <= maxPunkte; punktzahl++) {
      const prozentExakt = (punktzahl / maxPunkte) * 100;
      const prozentGerundet = istAufrunden ? Math.ceil(prozentExakt) : Math.floor(prozentExakt);

      for (let i = 0; i < noten.length; i++) {
        const n = noten[i];
        if (prozentGerundet >= n.minProz && prozentGerundet <= n.maxProz) {
          noteMin[i] = Math.min(noteMin[i], punktzahl);
          noteMax[i] = Math.max(noteMax[i], punktzahl);
          break;
        }
      }
    }

    for (let i = 0; i < noten.length; i++) {
      if (noteMin[i] <= noteMax[i]) {
        htmlString += `<tr>
          <td>${noten[i].note}</td>
          <td>${noten[i].punkte}</td>
          <td>${noteMin[i]} – ${noteMax[i]}</td>
        </tr>`;
      } else {
        htmlString += `<tr>
          <td>${noten[i].note}</td>
          <td>${noten[i].punkte}</td>
          <td>—</td>
        </tr>`;
      }
    }
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
