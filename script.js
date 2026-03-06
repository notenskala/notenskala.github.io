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

ungerundetCheckbox.addEventListener('change', () => {
  toggleRow.classList.toggle('hidden', ungerundetCheckbox.checked);
  tabelleAktualisieren();
});

rundungToggle.addEventListener('change', tabelleAktualisieren);
inputElement.addEventListener('input', tabelleAktualisieren);

function findeNote(prozent) {
  for (let n of noten) {
    if (prozent >= n.minProz && prozent <= n.maxProz) {
      return n;
    }
  }
  return null;
}

function tabelleAktualisieren() {

  const maxPunkte = parseInt(inputElement.value, 10);
  const istUngerundet = ungerundetCheckbox.checked;
  const istAufrunden = rundungToggle.checked;

  if (!maxPunkte || maxPunkte <= 0) {
    tbody.innerHTML = noten.map(n => `
      <tr>
        <td>${n.note}</td>
        <td>${n.punkte}</td>
        <td>—</td>
      </tr>`).join('');
    return;
  }

  const noteMin = new Array(noten.length).fill(Infinity);
  const noteMax = new Array(noten.length).fill(-Infinity);

  for (let punkte = 0; punkte <= maxPunkte; punkte++) {

    let prozent = (punkte / maxPunkte) * 100;

    if (!istUngerundet) {
      prozent = istAufrunden
        ? Math.ceil(prozent)
        : Math.floor(prozent);
    }

    const note = findeNote(prozent);
    if (!note) continue;

    const index = noten.indexOf(note);

    noteMin[index] = Math.min(noteMin[index], punkte);
    noteMax[index] = Math.max(noteMax[index], punkte);
  }

  let html = '';

  for (let i = 0; i < noten.length; i++) {

    if (noteMin[i] <= noteMax[i]) {

      let wert;

      if (istUngerundet) {

        const min = ((noteMin[i] / maxPunkte) * 100).toFixed(2);
        const max = ((noteMax[i] / maxPunkte) * 100).toFixed(2);

        wert = `${min}% – ${max}%`;

      } else {

        wert = `${noteMin[i]} – ${noteMax[i]}`;

      }

      html += `
      <tr>
        <td>${noten[i].note}</td>
        <td>${noten[i].punkte}</td>
        <td>${wert}</td>
      </tr>`;

    } else {

      html += `
      <tr>
        <td>${noten[i].note}</td>
        <td>${noten[i].punkte}</td>
        <td>—</td>
      </tr>`;
    }
  }

  tbody.innerHTML = html;
}

function getRundungsModus() {
  if (ungerundetCheckbox.checked) return 'ungerundet';
  return rundungToggle.checked ? 'aufgerundet' : 'abgerundet';
}

downloadBtn.addEventListener('click', function() {

  const maxPunkte = inputElement.value.trim();

  if (!maxPunkte || parseInt(maxPunkte) <= 0) {
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

  }).catch(err => {
    console.error(err);
    alert('Fehler beim Erstellen des Bildes.');
  });
});

tabelleAktualisieren();
