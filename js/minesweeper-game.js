// Embedded minesweeper API (minimal) - exposes start(container, onFinish)
window.MiniGames = window.MiniGames || {};
MiniGames.Minesweeper = (function(){
  function start(container, onFinish){
    container.innerHTML = '';
    const el = document.createElement('div');
    el.style.padding='12px';
    el.innerHTML = `<iframe src="minigames/minesweeper.html?embedded=1" style="width:420px;height:420px;border:0;background:#041018"></iframe>`;
    container.appendChild(el);
    // listen for postMessage
    function msg(e){
      if(e.data && e.data.minigame === 'minesweeper' && onFinish){
        onFinish(e.data.result);
        window.removeEventListener('message', msg);
      }
    }
    window.addEventListener('message', msg);
  }
  return {start};
})();
