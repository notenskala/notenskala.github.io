const basisNoten = [
  { note: '1+', punkte: 15, basisProz: 95 },
  { note: '1',  punkte: 14, basisProz: 90 },
  { note: '1-', punkte: 13, basisProz: 85 },
  { note: '2+', punkte: 12, basisProz: 80 },
  { note: '2',  punkte: 11, basisProz: 75 },
  { note: '2-', punkte: 10, basisProz: 70 },
  { note: '3+', punkte: 9,  basisProz: 65 },
  { note: '3',  punkte: 8,  basisProz: 60 },
  { note: '3-', punkte: 7,  basisProz: 55 },
  { note: '4+', punkte: 6,  basisProz: 50 },
  { note: '4',  punkte: 5,  basisProz: 45 },
  { note: '4-', punkte: 4,  basisProz: 40 },
  { note: '5+', punkte: 3,  basisProz: 33 },
  { note: '5',  punkte: 2,  basisProz: 27 },
  { note: '5-', punkte: 1,  basisProz: 20 },
  { note: '6',  punkte: 0,  basisProz: 0 }
];

const inputElement = document.getElementById('maxPunkte');
const bestehenInputElement = document.getElementById('bestehenProzent');
const anpassenBestehenCheckbox = document.getElementById('anpassenBestehenCheckbox');
const bestehenRow = document.getElementById('bestehenRow');
const tbody = document.getElementById('tabellenKoerper');
const ungerundetCheckbox = document.getElementById('ungerundetCheckbox');
const halbRundenCheckbox = document.getElementById('halbRundenCheckbox');
const toggleRow = document.getElementById('toggleRow');
const rundungToggle = document.getElementById('rundungToggle');
const downloadBtn = document.getElementById('downloadBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const downloadTableBtn = document.getElementById('downloadTableBtn');
const downloadSpiegelBtn = document.getElementById('downloadSpiegelBtn');

let aktuelleNoten = JSON.parse(JSON.stringify(basisNoten));

downloadBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  dropdownMenu.classList.toggle('show');
});

document.addEventListener('click', (e) => {
  if (!downloadBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
    dropdownMenu.classList.remove('show');
  }
});

anpassenBestehenCheckbox.addEventListener('change', function() {
  if (this.checked) {
    bestehenRow.classList.remove('hidden');
  } else {
    bestehenRow.classList.add('hidden');
    bestehenInputElement.value = 45;
  }
  tabelleAktualisieren();
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
bestehenInputElement.addEventListener('input', tabelleAktualisieren);

function berechneDynamischeProzentwerte(neueGrenzeNote4) {
  aktuelleNoten = basisNoten.map(n => {
    let angepassterProzentwert = n.basisProz;
    
    if (n.punkte === 5) {
      angepassterProzentwert = neueGrenzeNote4;
    } else if (n.punkte > 5) {
      const basisSpanne = 95 - 45;
      const neueSpanne = 95 - neueGrenzeNote4;
      angepassterProzentwert = neueGrenzeNote4 + ((n.basisProz - 45) * neueSpanne / basisSpanne);
    } else if (n.punkte < 5 && n.punkte > 0) {
      const basisSpanne = 45 - 0;
      const neueSpanne = neueGrenzeNote4 - 0;
      angepassterProzentwert = 0 + ((n.basisProz - 0) * neueSpanne / basisSpanne);
    }
    
    if (n.punkte === 15) angepassterProzentwert = 95; 
    if (n.punkte === 0) angepassterProzentwert = 0;

    return {
      note: n.note,
      punkte: n.punkte,
      minProz: Math.max(0, Math.min(100, angepassterProzentwert))
    };
  });
}

function tabelleAktualisieren() {
  let maxPunkte = parseInt(inputElement.value, 10);
  let neueGrenzeNote4 = parseInt(bestehenInputElement.value, 10);
  
  if (isNaN(neueGrenzeNote4) || neueGrenzeNote4 < 1 || neueGrenzeNote4 > 94) {
    neueGrenzeNote4 = 45;
  }

  const gueltig = !isNaN(maxPunkte) && maxPunkte > 0;
  const istUngerundet = ungerundetCheckbox.checked;
  const istHalbRunden = !istUngerundet && halbRundenCheckbox.checked;
  const istAufrunden = !istUngerundet && !istHalbRunden && rundungToggle.checked;

  if (!gueltig) {
    tbody.innerHTML = '';
    return;
  }

  berechneDynamischeProzentwerte(neueGrenzeNote4);

  const minWerte = aktuelleNoten.map(n => {
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
  const maxWerte = new Array(aktuelleNoten.length);
  
  maxWerte[0] = maxPunkte;
  for (let i = 1; i < aktuelleNoten.length; i++) {
    maxWerte[i] = minWerte[i - 1] - delta;
  }

  let htmlString = '';
  for (let i = 0; i < aktuelleNoten.length; i++) {
    const note = aktuelleNoten[i].note;
    const punktzahl = aktuelleNoten[i].punkte;
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
  
  const wrapper = document.querySelector('.table-wrapper');
  const table = document.querySelector('table');
  const ths = table.querySelectorAll('th');

  const alterScrollStand = wrapper.scrollTop;
  wrapper.scrollTop = 0;
  
  ths.forEach(th => th.style.position = 'static');

  const modus = getRundungsModus();
  const filename = `notentabelle_${maxPunkte}p_${modus}.png`;

  html2canvas(table, {
    scale: 2,
    backgroundColor: '#ffffff'
  }).then(canvas => {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    ths.forEach(th => th.style.position = 'sticky');
    wrapper.scrollTop = alterScrollStand;
    
    dropdownMenu.classList.remove('show');
  }).catch(error => {
    ths.forEach(th => th.style.position = 'sticky');
    wrapper.scrollTop = alterScrollStand;
    console.error('Fehler beim Erstellen des Bildes:', error);
    alert('Fehler beim Erstellen des Bildes.');
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
  const punkte = aktuelleNoten.map(n => n.punkte);

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
