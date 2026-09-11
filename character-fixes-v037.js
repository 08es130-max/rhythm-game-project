// Ver.0.3.7 character label and image fixes
(function(){
  if (!Array.isArray(window.CHARACTER_LIBRARY)) return;

  const stripSeries = (name) => String(name || '').replace(/【[^】]+】$/u, '');

  for (const c of window.CHARACTER_LIBRARY) {
    if (!c) continue;
    const base = stripSeries(c.name);
    if (c.id === 'default' || base === '三船栞子' && /【アイコン】$/u.test(c.name || '')) {
      c.name = '三船栞子【アイコン】';
      continue;
    }
    c.name = `${base}【音符ロリータ】`;
  }

  const emma = window.CHARACTER_LIBRARY.find(c => stripSeries(c.name) === 'エマ・ヴェルデ');
  if (emma) {
    emma.icon = 'emma-music-lolita-256.jpg?v=0.3.7';
    emma.home = emma.icon;
  }

  const setsuna = window.CHARACTER_LIBRARY.find(c => stripSeries(c.name) === '優木せつ菜');
  if (setsuna) {
    setsuna.icon = 'setsuna-music-lolita-256.jpg?v=0.3.7';
    setsuna.home = setsuna.icon;
  }

  const shiorikoLolita = window.CHARACTER_LIBRARY.find(c => c.id !== 'default' && stripSeries(c.name) === '三船栞子');
  if (shiorikoLolita) {
    shiorikoLolita.name = '三船栞子【音符ロリータ】';
    shiorikoLolita.icon = 'shioriko-music-lolita-256.jpg?v=0.3.7';
    shiorikoLolita.home = shiorikoLolita.icon;
  }
})();
