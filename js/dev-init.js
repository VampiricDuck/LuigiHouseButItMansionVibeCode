// tiny dev init: hook up dev button to open preview
window.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('dev-test-btn');
  const dlg = document.getElementById('dev-dimmer-preview');
  const devClose = document.getElementById('dev-close');
  const devToggle = document.getElementById('dev-toggle-dimmer');
  const bg = document.getElementById('bg');
  if(btn && dlg) btn.addEventListener('click', ()=> dlg.removeAttribute('hidden'));
  if(devClose && dlg) devClose.addEventListener('click', ()=> dlg.setAttribute('hidden',''));
  if(devToggle && bg) devToggle.addEventListener('click', ()=>{
    const cur = bg.style.filter || '';
    bg.style.filter = cur.includes('brightness(.35)') ? cur.replace(' brightness(.35)','') : cur + ' brightness(.35)';
  });

  // open minigame in overlay: ensure all [data-game] anchors call openMinigame and close the dev overlay
  document.querySelectorAll('[data-game]').forEach(a=>{
    a.addEventListener('click', (e)=>{
      e.preventDefault();
      const game = a.getAttribute('data-game');
      try{ openMinigame(game); }catch(err){ console.error('Failed to open minigame',err); }
      if(dlg) dlg.setAttribute('hidden','');
    });
  });

  // close minigame button wiring (safe)
  const mgClose = document.getElementById('minigame-close');
  if(mgClose) mgClose.addEventListener('click', ()=> closeMinigame());
});

let currentCleanup = null;
function openMinigame(name){
  const overlay = document.getElementById('minigame-overlay');
  const container = document.getElementById('minigame-container');
  overlay.removeAttribute('hidden');
  container.innerHTML = '';
  // start known minigames
  if(name === 'minesweeper' && window.MiniGames && MiniGames.Minesweeper){
    // Some minigames may return a cleanup function; capture it if provided
    try{
      const maybeCleanup = MiniGames.Minesweeper.start(container, (res)=>{
        console.log('Minesweeper finished', res);
        closeMinigame();
      });
      if(typeof maybeCleanup === 'function') currentCleanup = maybeCleanup;
    }catch(err){ console.error('Failed to start Minesweeper', err); }
  }
  if(name === 'snake' && window.MiniGames && MiniGames.Snake){
    // Snake.start returns a cleanup; keep track to stop it
    currentCleanup = MiniGames.Snake.start(container, (res)=>{
      console.log('Snake finished', res);
      closeMinigame();
    });
  }
  // Tetris: initialize if available (tetris-game.js provides MiniGames.Tetris.start)
  if(name === 'tetris'){
    if(window.MiniGames && MiniGames.Tetris && typeof MiniGames.Tetris.start === 'function'){
      try{
        const maybeCleanup = MiniGames.Tetris.start(container, (res)=>{
          console.log('Tetris finished', res);
          closeMinigame();
        });
        if(typeof maybeCleanup === 'function') currentCleanup = maybeCleanup;
      }catch(err){ console.error('Failed to start Tetris', err); }
    } else {
      // If Tetris isn't loaded yet, show a small message so user isn't confused
      container.innerHTML = '<div style="padding:12px;color:var(--text)">Tetris is not available yet. Try again in a moment.</div>';
    }
  }
}

function closeMinigame(){
  const overlay = document.getElementById('minigame-overlay');
  const container = document.getElementById('minigame-container');
  overlay.setAttribute('hidden','');
  if(currentCleanup){ currentCleanup(); currentCleanup = null; }
  container.innerHTML = '';
}

