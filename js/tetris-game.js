// Embedded Tetris API - exposes start(container, onFinish)
window.MiniGames = window.MiniGames || {};
MiniGames.Tetris = (function(){
  function start(container, onFinish){
    container.innerHTML = '';
    MiniGameLoader.load('minigames/tetris.html?embedded=1', container, (root)=>{
      function msg(e){ if(e.data && e.data.minigame === 'tetris'){ if(onFinish) onFinish(e.data.result); window.removeEventListener('message', msg); }}
      window.addEventListener('message', msg);
      root._minigameCleanup = ()=> window.removeEventListener('message', msg);
    });
    return ()=>{ if(container._minigameCleanup) container._minigameCleanup(); MiniGameLoader.unload(container); };
  }
  return {start};
})();
