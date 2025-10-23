// Embedded minesweeper API (minimal) - exposes start(container, onFinish)
window.MiniGames = window.MiniGames || {};
MiniGames.Minesweeper = (function(){
  function start(container, onFinish){
    // Inline minesweeper implementation (ported from minigames/minesweeper.html)
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'mg-minesweeper';
    wrapper.innerHTML = `<div class="controls"><button class="ms-reset">Reset</button></div><div class="ms-board"></div>`;
    container.appendChild(wrapper);
    const el = wrapper.querySelector('.ms-board');

    const size = 8, mines = 8;
    let board = [];

    function make(){
      board = Array(size*size).fill(0).map(()=>({mine:false,rev:false,flag:false,adj:0}));
      let placed=0;
      while(placed<mines){
        const idx=Math.floor(Math.random()*board.length);
        if(!board[idx].mine){board[idx].mine=true;placed++}
      }
      for(let r=0;r<size;r++)for(let c=0;c<size;c++){
        const i=r*size+c;
        if(board[i].mine) continue;
        let a=0;
        for(let dr=-1;dr<=1;dr++)for(let dc=-1;dc<=1;dc++){
          const nr=r+dr,nc=c+dc;
          if(nr<0||nr>=size||nc<0||nc>=size) continue;
          if(board[nr*size+nc].mine) a++;
        }
        board[i].adj=a;
      }
      render();
    }

    function render(){
      el.innerHTML='';
      board.forEach((cell,i)=>{
        const d=document.createElement('div');
        d.className='cell'+(cell.rev?' revealed':'')+(cell.mine&&cell.rev?' mine':'');
        if(cell.flag && !cell.rev) { d.textContent = '⚑'; d.classList.add('flagged'); }
        else d.textContent = cell.rev && !cell.mine && cell.adj>0 ? cell.adj : '';
        d.addEventListener('click',()=>reveal(i));
        d.addEventListener('contextmenu',(e)=>{ e.preventDefault(); if(cell.rev) return; cell.flag = !cell.flag; render(); });
        el.appendChild(d);
      });
    }

    function reveal(i){
      const cell = board[i];
      if(cell.rev){
        if(cell.adj <= 0) return;
        const r = Math.floor(i/size), c = i % size;
        let flagged = 0; const neighbors = [];
        for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++){
          const nr = r+dr, nc = c+dc; if(nr<0||nr>=size||nc<0||nc>=size) continue; const idx = nr*size+nc; neighbors.push(idx); if(board[idx].flag) flagged++;
        }
        if(flagged !== cell.adj) return;
        for(const idx of neighbors){ if(board[idx].flag) continue; if(board[idx].mine){ postResult({result:'lose'}); revealAll(); return; } if(!board[idx].rev) reveal(idx); }
        render(); checkWin(); return;
      }
      if(cell.rev || cell.flag) return;
      cell.rev = true;
      if(cell.mine){ postResult({result:'lose'}); revealAll(); return; }
      if(cell.adj === 0){ const r = Math.floor(i/size), c = i%size; for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++){ const nr = r+dr, nc = c+dc; if(nr<0||nr>=size||nc<0||nc>=size) continue; reveal(nr*size+nc); } }
      render(); checkWin();
    }

    function revealAll(){ board.forEach(b=>b.rev=true); render(); }

    function postResult(obj){ if(onFinish){ onFinish(obj); } }

    function checkWin(){ if(board.every(b=>b.rev||b.mine)) postResult({result:'win'}); }

    wrapper.querySelector('.ms-reset').addEventListener('click', make);
    make();

    // cleanup function
    return ()=>{ try{ wrapper.remove(); }catch(e){}};
  }
  return {start};
})();
