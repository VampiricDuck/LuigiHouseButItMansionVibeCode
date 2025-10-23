// Embedded minesweeper API (minimal) - exposes start(container, onFinish)
window.MiniGames = window.MiniGames || {};
MiniGames.Minesweeper = (function(){
  function start(container, onFinish){
    container.innerHTML = '';
    // use MiniGameLoader to inject the HTML so it becomes part of the overlay DOM
    MiniGameLoader.load('minigames/minesweeper.html?embedded=1', container, (root)=>{
      // listen for postMessage from the embedded game (or the embedded script can call parent functions)
      function msg(e){
        if(e.data && e.data.minigame === 'minesweeper'){
          if(onFinish) onFinish(e.data.result);
          window.removeEventListener('message', msg);
        }
      }
      window.addEventListener('message', msg);
      // attach cleanup hook onto the container for external use
      root._minigameCleanup = ()=> window.removeEventListener('message', msg);
    });
    // return a cleanup function that unloads the injected markup
    return ()=>{ if(container._minigameCleanup) container._minigameCleanup(); MiniGameLoader.unload(container); };
  }
  return {start};
})();
