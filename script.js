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
  
  for (let n of noten) {
    const note = n.note;
    const punktzahl = n.punkte;
    let bereichAnzeige = '—';
    
    if (gueltig) {
      const minExakt = (n.minProz / 100) * maxPunkte;
      const maxExakt = (n.maxProz / 100) * maxPunkte;
      
      if (istUngerundet) {
        const minAngezeigt = minExakt;
        const maxAngezeigt = maxExakt;
        if (minAngezeigt <= maxAngezeigt) {
          bereichAnzeige = `${minAngezeigt.toFixed(2)} – ${maxAngezeigt.toFixed(2)}`;
        } else {
          bereichAnzeige = '—';
        }
      } else if (istAufrunden) {
        const minAngezeigt = Math.ceil(minExakt);
        const maxAngezeigt = Math.ceil(maxExakt);
        if (minAngezeigt <= maxAngezeigt) {
          bereichAnzeige = `${minAngezeigt} – ${maxAngezeigt}`;
        } else {
          bereichAnzeige = '—';
        }
      } else {
        const minAngezeigt = Math.floor(minExakt);
        const maxAngezeigt = Math.floor(maxExakt);
        if (minAngezeigt <= maxAngezeigt) {
          bereichAnzeige = `${minAngezeigt} – ${maxAngezeigt}`;
        } else {
          bereichAnzeige = '—';
        }
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

  const wrapper = document.querySelector('.table-wrapper');
  const originalOverflow = wrapper.style.overflow;
  const originalHeight = wrapper.style.height;

  wrapper.style.overflow = 'visible';
  wrapper.style.height = 'auto';

  html2canvas(wrapper, {
    scale: 2,
    backgroundColor: '#ffffff'
  }).then(canvas => {
    wrapper.style.overflow = originalOverflow;
    wrapper.style.height = originalHeight;

    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }).catch(error => {
    console.error('Fehler beim Erstellen des Bildes:', error);
    alert('Fehler beim Erstellen des Bildes.');
    wrapper.style.overflow = originalOverflow;
    wrapper.style.height = originalHeight;
  });
});

tabelleAktualisieren();
