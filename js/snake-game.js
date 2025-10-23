// Embedded snake minigame: maze-based goal. API: MiniGames.Snake.start(container,onFinish)
window.MiniGames = window.MiniGames || {};
MiniGames.Snake = (function(){
  function start(container, onFinish){
    container.innerHTML = '';
    const canvas = document.createElement('canvas');
    canvas.width = 320; canvas.height = 320; canvas.style.background='#041018'; canvas.style.borderRadius='8px';
    container.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const cw = 16, cols = 20, rows = 20;
    // simple maze: 0=empty,1=wall. Build border + patterned obstacles leaving corridors
    const maze = Array(rows).fill(0).map(()=>Array(cols).fill(0));
    for(let r=0;r<rows;r++){
      for(let c=0;c<cols;c++){
        if(r===0||r===rows-1||c===0||c===cols-1) maze[r][c]=1; // border
      }
    }
    // create horizontal bands with gaps
    for(let r=2;r<rows-2;r+=2){
      for(let c=2;c<cols-2;c++){
        if((c%5)!==0) maze[r][c]=1;
      }
    }
    // vertical connectors with gaps
    for(let c=3;c<cols-3;c+=4){
      for(let r=3;r<rows-3;r++){
        if((r%3)!==0) maze[r][c]=1;
      }
    }
    // make start area
    const start = {x:2,y:2};
    // snake initial length (longer for minigame feel)
    let snake = [];
    for(let i=0;i<6;i++) snake.push({x:start.x-i,y:start.y});
    // place apple somewhere reachable (find a non-wall)
    function findEmpty(){
      for(let r=rows-2;r>1;r--) for(let c=cols-2;c>1;c--){ if(maze[r][c]===0) return {x:c,y:r}; }
      return {x:cols-3,y:rows-3};
    }
    let apple = findEmpty();
    let dir = {x:1,y:0};
    let running = true;
    function draw(){
      ctx.fillStyle='#041018'; ctx.fillRect(0,0,canvas.width,canvas.height);
      // draw maze walls (visible)
      for(let r=0;r<rows;r++) for(let c=0;c<cols;c++){
        if(maze[r][c]){ ctx.fillStyle='#16313a'; ctx.fillRect(c*cw,r*cw,cw-1,cw-1); ctx.fillStyle='#0b1a22'; ctx.fillRect(c*cw+2,r*cw+2,cw-5,cw-5); }
      }
      // draw apple
      ctx.fillStyle='#79ff8a'; ctx.fillRect(apple.x*cw,apple.y*cw,cw-1,cw-1);
      // draw snake
      ctx.fillStyle='#b88cff'; snake.forEach(s=>ctx.fillRect(s.x*cw,s.y*cw,cw-1,cw-1));
    }
    function step(){
      if(!running) return;
      const head = {x:snake[0].x+dir.x,y:snake[0].y+dir.y};
      // collision with walls
      if(maze[head.y][head.x]===1){ running=false; if(onFinish) onFinish({result:'fail'}); return; }
      // move snake
      snake.unshift(head);
      // check apple
      if(head.x===apple.x && head.y===apple.y){ running=false; if(onFinish) onFinish({result:'win'}); return; }
      snake.pop();
      draw();
    }
    document.addEventListener('keydown', onKey);
    function onKey(e){
      if(e.key==='ArrowUp') dir={x:0,y:-1};
      if(e.key==='ArrowDown') dir={x:0,y:1};
      if(e.key==='ArrowLeft') dir={x:-1,y:0};
      if(e.key==='ArrowRight') dir={x:1,y:0};
    }
    const interval = setInterval(step,150);
    // return a cleanup function
    return ()=>{ clearInterval(interval); document.removeEventListener('keydown', onKey); };
  }
  return {start};
})();
