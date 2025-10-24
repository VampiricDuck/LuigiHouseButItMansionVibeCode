// Embedded minesweeper API (minimal) - exposes start(container, onFinish)
window.MiniGames = window.MiniGames || {};
MiniGames.Minesweeper = (function(){
  function start(container, onFinish){
    container.innerHTML = '';
    const wrapper = document.createElement('div');
    wrapper.className = 'mg-minesweeper';
    wrapper.innerHTML = `<div class="controls"><button class="ms-reset">Reset</button></div><div class="ms-board" style="display:grid;grid-template-columns:repeat(8,34px);gap:6px;margin-top:8px"></div>`;
    container.appendChild(wrapper);
    const boardEl = wrapper.querySelector('.ms-board');

    const size = 8, mines = 8;
    let board = [];

    let firstClick = true;

    function placeMines(excludeIdx){
      // Clear mines and place new ones, avoiding excludeIdx and its neighbors
      board.forEach(cell => { cell.mine = false; cell.adj = 0; });
      
      // Calculate excluded positions (clicked cell and its neighbors)
      const excludedPositions = new Set();
      const r = Math.floor(excludeIdx/size), c = excludeIdx%size;
      for(let dr=-1; dr<=1; dr++) {
        for(let dc=-1; dc<=1; dc++) {
          const nr = r+dr, nc = c+dc;
          if(nr >= 0 && nr < size && nc >= 0 && nc < size) {
            excludedPositions.add(nr*size + nc);
          }
        }
      }
      
      // Create array of available indices excluding safe zone
      const availableIndices = Array.from({length: size * size}, (_, i) => i)
        .filter(i => !excludedPositions.has(i));
      
      // Randomly select mine positions from available indices
      for(let i = 0; i < mines; i++) {
        const randomIndex = Math.floor(Math.random() * availableIndices.length);
        const minePosition = availableIndices[randomIndex];
        board[minePosition].mine = true;
        availableIndices.splice(randomIndex, 1);
      }
      
      // Calculate adjacent mine counts
      for(let r = 0; r < size; r++) {
        for(let c = 0; c < size; c++) {
          const i = r * size + c;
          if(board[i].mine) continue;
          let count = 0;
          for(let dr = -1; dr <= 1; dr++) {
            for(let dc = -1; dc <= 1; dc++) {
              const nr = r + dr, nc = c + dc;
              if(nr < 0 || nr >= size || nc < 0 || nc >= size) continue;
              if(board[nr * size + nc].mine) count++;
            }
          }
          board[i].adj = count;
        }
      }
      render();
    }

    function render(){
      boardEl.innerHTML='';
      board.forEach((cell,i)=>{
        const d=document.createElement('button');
        d.className='cell';
        d.style.width='34px'; d.style.height='34px'; d.style.borderRadius='6px'; d.style.border='1px solid rgba(255,255,255,.04)'; d.style.background='#021018'; d.style.color='var(--text)'; d.style.fontWeight='700';
        if(cell.flag && !cell.rev) { d.textContent = '⚑'; d.style.background='#16313a'; }
        else if(cell.rev){ if(cell.mine){ d.textContent = '✹'; d.style.background='#5a1a1a'; d.style.color='#fff' } else if(cell.adj>0){ d.textContent = cell.adj; d.style.background='#0b2230'; d.style.color='var(--accent)'; } else { d.textContent = ''; d.style.background='#0b2230'; } }

        // left click
        d.addEventListener('click', (e)=>{
          e.preventDefault();
          // if revealed and has number -> chord behaviour
          if(cell.rev && cell.adj>0){
            chord(i);
            return;
          }
          reveal(i);
        });

        // right click -> toggle flag
        d.addEventListener('contextmenu',(e)=>{ e.preventDefault(); if(cell.rev) return; cell.flag = !cell.flag; render(); });
        boardEl.appendChild(d);
      });
    }

    function reveal(i){
      const cell = board[i];
      if(cell.rev || cell.flag) return;
      
      // Handle first click - ensure it's not a mine
      if(firstClick){
        firstClick = false;
        // Place mines avoiding this cell
        placeMines(i);
      }

      cell.rev = true;
      if(cell.mine){ revealAll(); if(onFinish) onFinish({result:'lose'}); return; }
      if(cell.adj === 0){ const r = Math.floor(i/size), c = i%size; for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++){ const nr = r+dr, nc = c+dc; if(nr<0||nr>=size||nc<0||nc>=size) continue; reveal(nr*size+nc); } }
      render(); checkWin();
    }

    // chord: when clicking a revealed numbered cell, if flags around == number, reveal neighbors
    function chord(i){
      const r = Math.floor(i/size), c = i%size;
      const cell = board[i];
      if(!cell.rev || cell.adj<=0) return;
      // count flags among neighbors
      let flagged = 0;
      const neighbors = [];
      for(let dr=-1; dr<=1; dr++) for(let dc=-1; dc<=1; dc++){
        const nr = r+dr, nc = c+dc; if(nr<0||nr>=size||nc<0||nc>=size) continue; const idx = nr*size+nc; neighbors.push(idx); if(board[idx].flag) flagged++;
      }
      if(flagged !== cell.adj) return; // nothing to do

      // reveal all unflagged neighbors; if any is mine -> lose
      for(const idx of neighbors){ if(board[idx].flag) continue; if(board[idx].mine){ revealAll(); if(onFinish) onFinish({result:'lose'}); return; } if(!board[idx].rev) reveal(idx); }
      render(); checkWin();
    }

    function revealAll(){ board.forEach(b=>b.rev=true); render(); }
    function checkWin(){ if(board.every(b=>b.rev||b.mine)){ if(onFinish) onFinish({result:'win'}); } }

    function make() {
      board = [];
      firstClick = true;
      for(let i = 0; i < size * size; i++) {
        board.push({ mine: false, rev: false, flag: false, adj: 0 });
      }
      render();
    }

    wrapper.querySelector('.ms-reset').addEventListener('click', make);
    make();

    // cleanup function
    return ()=>{ try{ wrapper.remove(); }catch(e){} };
  }
  return {start};
})();
