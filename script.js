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

function berechneLueckenloseProzentbereiche() {
  let notenSorted = [...noten].sort((a, b) => a.minProz - b.minProz);
  let neueNoten = [];
  for (let i = 0; i < notenSorted.length; i++) {
    let aktuell = notenSorted[i];
    let vorher = notenSorted[i - 1];
    let nachher = notenSorted[i + 1];
    let min, max;
    if (i === 0) {
      min = 0;
      max = (aktuell.maxProz + (nachher ? nachher.minProz : 100)) / 2;
    } else if (i === notenSorted.length - 1) {
      min = (vorher.maxProz + aktuell.minProz) / 2;
      max = 100;
    } else {
      min = (vorher.maxProz + aktuell.minProz) / 2;
      max = (aktuell.maxProz + nachher.minProz) / 2;
    }
    neueNoten.push({
      note: aktuell.note,
      punkte: aktuell.punkte,
      minProz: min,
      maxProz: max
    });
  }
  return neueNoten.sort((a, b) => b.punkte - a.punkte);
}

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
    const lueckenloseNoten = berechneLueckenloseProzentbereiche();
    for (let n of lueckenloseNoten) {
      const minPunkte = (n.minProz / 100) * maxPunkte;
      const maxPunkteBerechnet = (n.maxProz / 100) * maxPunkte;
      const minAngezeigt = minPunkte.toFixed(2);
      const maxAngezeigt = maxPunkteBerechnet.toFixed(2);
      htmlString += `<tr>
        <td>${n.note}</td>
        <td>${n.punkte}</td>
        <td>${minAngezeigt} – ${maxAngezeigt}</td>
      </tr>`;
    }
  } else {
    let noteMin = new Array(noten.length).fill(Infinity);
    let noteMax = new Array(noten.length).fill(-Infinity);

    for (let punktzahl = 0; punktzahl <= maxPunkte; punktzahl++) {
      const prozentExakt = (punktzahl / maxPunkte) * 100;
      const prozentGerundet = istAufrunden ? Math.ceil(prozentExakt) : Math.floor(prozentExakt);

      for (let i = 0; i < noten.length; i++) {
        if (prozentGerundet >= noten[i].minProz && prozentGerundet <= noten[i].maxProz) {
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
