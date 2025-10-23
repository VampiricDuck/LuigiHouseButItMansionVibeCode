// Embedded Tetris API - exposes start(container, onFinish)
window.MiniGames = window.MiniGames || {};
MiniGames.Tetris = (function(){
  function start(container, onFinish){
    container.innerHTML = '';
    const el = document.createElement('div');
    el.style.padding = '8px';
    const iframe = document.createElement('iframe');
    iframe.src = 'minigames/tetris.html?embedded=1';
    iframe.style.width = '520px';
    iframe.style.height = '640px';
    iframe.style.border = '0';
    iframe.setAttribute('title','Tetris minigame');
    el.appendChild(iframe);
    container.appendChild(el);

    function msg(e){
      // simple origin-agnostic check for expected payload
      if(!e.data) return;
      if(e.data.minigame === 'tetris'){
        if(onFinish) onFinish(e.data.result);
        window.removeEventListener('message', msg);
      }
    }
    window.addEventListener('message', msg);

    // return nothing since tetris runs in iframe; no cleanup needed beyond removing iframe
    return () => {
      window.removeEventListener('message', msg);
      try{ container.innerHTML = ''; }catch(e){}
    };
  }
  return {start};
})();
