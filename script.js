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
const halbRundenCheckbox = document.getElementById('halbRundenCheckbox');
const toggleRow = document.getElementById('toggleRow');
const rundungToggle = document.getElementById('rundungToggle');
const downloadBtn = document.getElementById('downloadBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const downloadTableBtn = document.getElementById('downloadTableBtn');
const downloadSpiegelBtn = document.getElementById('downloadSpiegelBtn');

downloadBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
  if (!downloadBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.classList.remove('show');
  }
});

ungerundetCheckbox.addEventListener('change', function() {
  if (this.checked) {
    toggleRow.classList.add('hidden');
    halbRundenCheckbox.disabled = true;
    halbRundenCheckbox.parentElement.classList.add('disabled');
  } else {
    toggleRow.classList.remove('hidden');
    halbRundenCheckbox.disabled = false;
    halbRundenCheckbox.parentElement.classList.remove('disabled');
  }
  tabelleAktualisieren();
});

rundungToggle.addEventListener('change', tabelleAktualisieren);
halbRundenCheckbox.addEventListener('change', tabelleAktualisieren);
inputElement.addEventListener('input', tabelleAktualisieren);

function tabelleAktualisieren() {
  let maxPunkte = parseInt(inputElement.value, 10);
  const gueltig = !isNaN(maxPunkte) && maxPunkte > 0;
  const istUngerundet = ungerundetCheckbox.checked;
  const istHalbRunden = !istUngerundet && halbRundenCheckbox.checked;
  const istAufrunden = !istUngerundet && !istHalbRunden && rundungToggle.checked;

  if (!gueltig) {
    tbody.innerHTML = '';
    return;
  }

  const minWerte = noten.map(n => {
    const exakt = (n.minProz / 100) * maxPunkte;
    if (istUngerundet) {
      return exakt;
    } else if (istHalbRunden) {
      return Math.round(exakt * 2) / 2;
    } else {
      return istAufrunden ? Math.ceil(exakt) : Math.floor(exakt);
    }
  });

  const delta = istUngerundet ? 0.01 : (istHalbRunden ? 0.5 : 1);
  const maxWerte = new Array(noten.length);
  maxWerte[0] = maxPunkte;
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
      } else if (istHalbRunden) {
        bereichAnzeige = `${minWert.toFixed(1)} – ${maxWert.toFixed(1)}`;
      } else {
        bereichAnzeige = `${Math.floor(minWert)} – ${Math.floor(maxWert)}`;
      }
    }

    htmlString += `
      <tr>
        <td>${note}</td>
        <td>${punktzahl}</td>
        <td>${bereichAnzeige}</td>
      </tr>
    `;
  }

  tbody.innerHTML = htmlString;
}

function getRundungsModus() {
  if (ungerundetCheckbox.checked) return 'ungerundet';
  if (halbRundenCheckbox.checked) return 'halbgerundet';
  return rundungToggle.checked ? 'aufgerundet' : 'abgerundet';
}

downloadTableBtn.addEventListener('click', function() {
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
    dropdownMenu.classList.remove('show');
  }).catch(error => {
    console.error('Fehler beim Erstellen des Bildes:', error);
    alert('Fehler beim Erstellen des Bildes. Bitte versuche es erneut.');
  });
});

downloadSpiegelBtn.addEventListener('click', function() {
  const maxPunkte = inputElement.value.trim();
  if (maxPunkte === '' || isNaN(parseInt(maxPunkte, 10)) || parseInt(maxPunkte, 10) <= 0) {
    alert('Bitte gültige Maximalpunktzahl eingeben.');
    return;
  }

  const rows = tbody.querySelectorAll('tr');
  const bereiche = [];
  for (let row of rows) {
    const td = row.cells[2];
    if (td) {
      let bereich = td.innerText.trim();
      if (bereich !== '—') {
        const teile = bereich.split(' – ');
        if (teile.length === 2) {
          bereich = `${teile[1]} – ${teile[0]}`;
        }
      }
      bereiche.push(bereich);
    }
  }
  const punkte = noten.map(n => n.punkte);

  const wrapper = document.createElement('div');
  wrapper.style.position = 'absolute';
  wrapper.style.left = '-9999px';
  wrapper.style.top = '0';
  wrapper.style.backgroundColor = 'white';
  wrapper.style.padding = '20px';
  wrapper.style.fontFamily = 'system-ui, sans-serif';
  wrapper.style.display = 'inline-block';
  wrapper.style.borderRadius = '8px';
  wrapper.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';

  const table = document.createElement('table');
  table.style.borderCollapse = 'collapse';
  table.style.whiteSpace = 'nowrap';
  table.style.width = 'auto';
  table.style.tableLayout = 'auto';

  const thead = document.createElement('thead');
  const headerRow = document.createElement('tr');
  for (let p of punkte) {
    const th = document.createElement('th');
    th.textContent = p;
    th.style.padding = '8px 12px';
    th.style.border = '1px solid #ccc';
    th.style.backgroundColor = '#f0f0f0';
    th.style.fontWeight = '600';
    th.style.textAlign = 'center';
    headerRow.appendChild(th);
  }
  thead.appendChild(headerRow);
  table.appendChild(thead);

  const tbodySpiegel = document.createElement('tbody');
  const dataRow = document.createElement('tr');
  for (let b of bereiche) {
    const td = document.createElement('td');
    td.textContent = b;
    td.style.padding = '8px 12px';
    td.style.border = '1px solid #ccc';
    td.style.textAlign = 'center';
    td.style.backgroundColor = '#fff';
    dataRow.appendChild(td);
  }
  tbodySpiegel.appendChild(dataRow);
  table.appendChild(tbodySpiegel);

  wrapper.appendChild(table);
  document.body.appendChild(wrapper);

  html2canvas(wrapper, {
    scale: 2,
    backgroundColor: '#ffffff'
  }).then(canvas => {
    const link = document.createElement('a');
    const modus = getRundungsModus();
    link.download = `klausurspiegel_${maxPunkte}p_${modus}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    document.body.removeChild(wrapper);
    dropdownMenu.classList.remove('show');
  }).catch(error => {
    console.error('Fehler beim Erstellen des Klausurspiegels:', error);
    alert('Fehler beim Erstellen des Klausurspiegels.');
    document.body.removeChild(wrapper);
  });
});

tabelleAktualisieren();
