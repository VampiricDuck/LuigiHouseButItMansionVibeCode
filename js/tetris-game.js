// Embedded Tetris API - exposes start(container, onFinish)
window.MiniGames = window.MiniGames || {};
MiniGames.Tetris = (function(){
  function start(container, onFinish){
    // Inline Tetris implementation (ported from minigames/tetris.html)
    container.innerHTML = '';
    const wrap = document.createElement('div'); wrap.className = 'mg-tetris';
    wrap.innerHTML = '<div class="controls"><button class="t-reset">Reset</button></div><div class="t-wrap"><canvas class="t-cvs" width="200" height="400"></canvas></div>';
    container.appendChild(wrap);
    const cvs = wrap.querySelector('.t-cvs'); const ctx = cvs.getContext('2d');
    const cols=10,rows=20,cell=20;
    let grid=Array(rows).fill(0).map(()=>Array(cols).fill(0));
    const pieces=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]],[[0,1,0],[1,1,1]]];
    function rnd(){return pieces[Math.floor(Math.random()*pieces.length)];}
    let piece={shape:rnd(),x:3,y:0};let running=false;
    function draw(){ctx.fillStyle='#041018';ctx.fillRect(0,0,cvs.width,cvs.height);for(let r=0;r<rows;r++)for(let c=0;c<cols;c++){if(grid[r][c]){ctx.fillStyle='#79ff8a';ctx.fillRect(c*cell,r*cell,cell-1,cell-1)}}
      for(let r=0;r<piece.shape.length;r++)for(let c=0;c<piece.shape[r].length;c++){if(piece.shape[r][c]){ctx.fillStyle='#b88cff';ctx.fillRect((piece.x+c)*cell,(piece.y+r)*cell,cell-1,cell-1)}}
    }
    function collide(nx,ny,shape){for(let r=0;r<shape.length;r++)for(let c=0;c<shape[r].length;c++)if(shape[r][c]){const rr=ny+r,cc=nx+c;if(rr<0||rr>=rows||cc<0||cc>=cols||grid[rr][cc]) return true}return false}
    function place(){for(let r=0;r<piece.shape.length;r++)for(let c=0;c<piece.shape[r].length;c++)if(piece.shape[r][c]) grid[piece.y+r][piece.x+c]=1;clearLines();piece={shape:rnd(),x:3,y:0};if(collide(piece.x,piece.y,piece.shape)){running=false; if(onFinish) onFinish({result:'gameover'});} }
    function rotate(s){const h=s.length,w=s[0].length;let out=Array(w).fill(0).map(()=>Array(h).fill(0));for(let r=0;r<h;r++)for(let c=0;c<w;c++)out[c][h-1-r]=s[r][c];return out}
    function clearLines(){for(let r=rows-1;r>=0;r--){if(grid[r].every(v=>v)){grid.splice(r,1);grid.unshift(Array(cols).fill(0));r++;}}}
    function step(){if(!running) return; if(!collide(piece.x,piece.y+1,piece.shape)){piece.y++;}else{place()}draw();setTimeout(step,350)}
    function onKey(e){if(e.key==='ArrowLeft'&&!collide(piece.x-1,piece.y,piece.shape))piece.x--;if(e.key==='ArrowRight'&&!collide(piece.x+1,piece.y,piece.shape))piece.x++;if(e.key==='ArrowDown'&&!collide(piece.x,piece.y+1,piece.shape))piece.y++;if(e.key===' ') {piece.shape=rotate(piece.shape);}if(!running){running=true;step()}draw();}
    document.addEventListener('keydown', onKey);
    wrap.querySelector('.t-reset').addEventListener('click',()=>{grid=Array(rows).fill(0).map(()=>Array(cols).fill(0));piece={shape:rnd(),x:3,y:0};running=false;draw();});
    draw();
    return ()=>{ try{ document.removeEventListener('keydown', onKey); wrap.remove(); }catch(e){} };
  }
  return {start};
})();
