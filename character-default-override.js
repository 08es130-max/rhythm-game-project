(function(){
  if (!Array.isArray(window.CHARACTER_LIBRARY)) return;
  window.CHARACTER_LIBRARY = window.CHARACTER_LIBRARY.filter(c => c.id !== 'default');
  window.CHARACTER_LIBRARY.unshift({
    id: 'default',
    name: '三船栞子',
    icon: 'icon-180-v029.png',
    home: 'icon-180-v029.png'
  });
})();
