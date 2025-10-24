window.MiniGames = window.MiniGames || {};
window.MiniGames.Tetris = (function() {
	function start(container, onFinish) {
		container.innerHTML = `
			<div class="mg-tetris" style="color:var(--text);font-family:sans-serif">
				<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
					<div>
						<button class="t-reset" style="padding:6px 10px;border-radius:6px;background:#0b2230;color:var(--text);border:1px solid rgba(255,255,255,.04)">Reset</button>
						<button class="t-pause" style="padding:6px 10px;border-radius:6px;margin-left:6px;background:#0b2230;color:var(--text);border:1px solid rgba(255,255,255,.04)">Pause</button>
					</div>
					<div>Score: <span class="score">0</span></div>
					<div>Lines: <span class="lines">0</span></div>
				</div>
				<div style="display:flex;gap:12px;align-items:flex-start">
					<canvas width="200" height="400" style="background:#021018;border-radius:6px"></canvas>
					<div style="min-width:140px;color:var(--text)">
						<h4 style="margin:0 0 6px 0">Controls</h4>
						<div style="line-height:1.6">
							<div><strong>← / →</strong> Move</div>
							<div><strong>↑</strong> Rotate</div>
							<div><strong>Space</strong> Hard drop</div>
							<div><strong>↓</strong> Soft drop</div>
							<div><strong>P</strong> Pause</div>
						</div>
						<p style="margin-top:10px;font-size:12px;opacity:.9">Clear 3 rows to complete the level.</p>
					</div>
				</div>
			</div>`;

		const wrapper = container.querySelector('.mg-tetris');
		const canvas = wrapper.querySelector('canvas');
		const ctx = canvas.getContext('2d');
		const scoreDisplay = wrapper.querySelector('.score');
		const linesDisplay = wrapper.querySelector('.lines');
		const resetBtn = wrapper.querySelector('.t-reset');
		const pauseBtn = wrapper.querySelector('.t-pause');

		const COLS = 10;
		const ROWS = 20;
		const CELL = canvas.width / COLS;
		const DROP_INTERVAL = 800;

		const SHAPES = {
			I: [[1,1,1,1]],
			O: [[1,1],[1,1]],
			T: [[0,1,0],[1,1,1]],
			S: [[0,1,1],[1,1,0]],
			Z: [[1,1,0],[0,1,1]],
			J: [[1,0,0],[1,1,1]],
			L: [[0,0,1],[1,1,1]]
		};
		const COLORS = {I:'#79fffe',O:'#ffd86b',T:'#b88cff',S:'#79ff8a',Z:'#ff8a8a',J:'#8fb7ff',L:'#ffb88f'};

		let board, cur, curPos, dropTimer, paused=false, score=0, lines=0, gameOver=false;

		function makeBoard(){
			board = Array.from({length:ROWS}, ()=>Array(COLS).fill(0));
		}

		function randShape(){
			const keys = Object.keys(SHAPES);
			const k = keys[Math.floor(Math.random()*keys.length)];
			return {shape: SHAPES[k], key:k};
		}

		function rotate(matrix){
			const h = matrix.length, w = matrix[0].length;
			const res = Array.from({length:w},()=>Array(h).fill(0));
			for(let r=0;r<h;r++) for(let c=0;c<w;c++) res[c][h-1-r]=matrix[r][c];
			return res;
		}

		function spawn(){
			const s = randShape();
			cur = {mat: s.shape, key: s.key};
			curPos = {x: Math.floor((COLS - cur.mat[0].length)/2), y: 0};
			if(collides(cur.mat, curPos.x, curPos.y)){
				endGame(false);
			}
		}

		function collides(mat, ox, oy){
			for(let r=0;r<mat.length;r++) for(let c=0;c<mat[r].length;c++){
				if(mat[r][c]){
					const x = ox + c, y = oy + r;
					if(x<0 || x>=COLS || y<0 || y>=ROWS) return true;
					if(board[y][x]) return true;
				}
			}
			return false;
		}

		function lockPiece(){
			const mat = cur.mat, ox=curPos.x, oy=curPos.y;
			for(let r=0;r<mat.length;r++) for(let c=0;c<mat[r].length;c++){
				if(mat[r][c]) board[oy+r][ox+c] = cur.key;
			}
			clearLines();
			spawn();
		}

		function clearLines(){
			let clearCount=0;
			for(let r=ROWS-1;r>=0;r--){
				if(board[r].every(cell=>cell)){
					board.splice(r,1);
					board.unshift(Array(COLS).fill(0));
					clearCount++;
					r++; // recheck same row index after splice
				}
			}
			if(clearCount>0){
				lines += clearCount;
				score += clearCount * 100;
				scoreDisplay.textContent = score;
				linesDisplay.textContent = lines;
				if(lines >= 3){
					endGame(true);
				}
			}
		}

		function endGame(win){
			gameOver = true;
			clearInterval(dropTimer);
			draw();
			ctx.fillStyle = 'rgba(0,0,0,0.6)';
			ctx.fillRect(0,0,canvas.width,canvas.height);
			ctx.fillStyle = '#fff';
			ctx.font = '20px sans-serif';
			ctx.textAlign = 'center';
			ctx.fillText(win? 'You cleared 3 rows!':'Game Over', canvas.width/2, canvas.height/2);
			if(onFinish) onFinish({result: win? 'win':'lose', score});
		}

		function step(){
			if(paused || gameOver) return;
			if(!cur) spawn();
			if(!collides(cur.mat, curPos.x, curPos.y+1)){
				curPos.y++;
			} else {
				lockPiece();
			}
			draw();
		}

		function hardDrop(){
			while(!collides(cur.mat, curPos.x, curPos.y+1)) curPos.y++;
			lockPiece();
			draw();
		}

		function move(dx){
			if(!cur) return;
			if(!collides(cur.mat, curPos.x+dx, curPos.y)) curPos.x += dx;
			draw();
		}

		function rotateCur(){
			const r = rotate(cur.mat);
			if(!collides(r, curPos.x, curPos.y)) cur.mat = r;
			draw();
		}

		function draw(){
			// background
			ctx.fillStyle = '#021018';
			ctx.fillRect(0,0,canvas.width,canvas.height);
			// draw board cells
			for(let r=0;r<ROWS;r++) for(let c=0;c<COLS;c++){
				if(board[r][c]){
					ctx.fillStyle = COLORS[board[r][c]] || '#666';
					ctx.fillRect(c*CELL, r*CELL, CELL-1, CELL-1);
				}
			}
			// draw current piece
			if(cur){
				for(let r=0;r<cur.mat.length;r++) for(let c=0;c<cur.mat[r].length;c++){
					if(cur.mat[r][c]){
						ctx.fillStyle = COLORS[cur.key] || '#fff';
						const x = (curPos.x+c)*CELL, y = (curPos.y+r)*CELL;
						ctx.fillRect(x, y, CELL-1, CELL-1);
					}
				}
			}

			// draw subtle grid lines to make cell boundaries and playfield edges obvious
			ctx.save();
			ctx.strokeStyle = 'rgba(255,255,255,0.04)';
			ctx.lineWidth = 1;
			// vertical grid lines
			for(let i=1;i<COLS;i++){
				const x = Math.round(i*CELL) + 0.5;
				ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke();
			}
			// horizontal grid lines
			for(let i=1;i<ROWS;i++){
				const y = Math.round(i*CELL) + 0.5;
				ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvas.width, y); ctx.stroke();
			}
			// outer border to clearly show where the playfield ends
			ctx.strokeStyle = 'rgba(255,255,255,0.08)';
			ctx.lineWidth = 2;
			ctx.strokeRect(1, 1, canvas.width-2, canvas.height-2);
			ctx.restore();
		}

		function handleKey(e){
			if(gameOver) return;
			const key = e.code;
			if(key === 'KeyP'){
				paused = !paused;
				if(!paused && !gameOver){ clearInterval(dropTimer); dropTimer = setInterval(step, DROP_INTERVAL); }
				return;
			}
			if(paused) return;
			switch(key){
				case 'ArrowLeft': move(-1); break;
				case 'ArrowRight': move(1); break;
				case 'ArrowUp': rotateCur(); break;
				case 'ArrowDown': // soft drop
					if(!collides(cur.mat, curPos.x, curPos.y+1)) curPos.y++;
					draw();
					break;
				case 'Space': hardDrop(); break;
			}
		}

		function reset(){
			clearInterval(dropTimer);
			paused = false; gameOver = false; score=0; lines=0; scoreDisplay.textContent='0'; linesDisplay.textContent='0';
			makeBoard(); cur = null; curPos = null;
			spawn(); draw();
			dropTimer = setInterval(step, DROP_INTERVAL);
		}

		// Init
		makeBoard(); reset();

		document.addEventListener('keydown', handleKey);
		resetBtn.addEventListener('click', reset);
		pauseBtn.addEventListener('click', ()=>{ paused=!paused; if(!paused){ clearInterval(dropTimer); dropTimer=setInterval(step, DROP_INTERVAL);} });

		return () => {
			document.removeEventListener('keydown', handleKey);
			clearInterval(dropTimer);
			wrapper.remove();
		};
	}
	return { start };
})();
