window.MiniGames = window.MiniGames || {};
window.MiniGames.Snake = (function() {
  function start(container, onFinish) {
    container.innerHTML = '<div class="mg-snake"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><button class="sn-reset" style="padding:8px 12px;border-radius:6px;background:#0b2230;color:var(--text);border:1px solid rgba(255,255,255,.04)">Reset</button><div style="color:var(--text)">Score: <span class="score">0</span></div></div><canvas width="400" height="400" style="display:block;background:#021018;border-radius:8px"></canvas></div>';
    const wrapper = container.querySelector('.mg-snake');
    const canvas = wrapper.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const scoreDisplay = wrapper.querySelector('.score');
    const GRID_SIZE = 20;
    const CELL_SIZE = canvas.width / GRID_SIZE;
    const SPEED = 200;
    let snake = [];
    let food = null;
    let walls = [];
    let direction = 'right';
    let nextDirection = 'right';
    let score = 0;
    let applesEaten = 0;
    let gameLoop = null;
    let gameOver = false;
    let gameStarted = false;

    function init() {
      const startX = Math.floor(GRID_SIZE / 2) - 2;
      const startY = Math.floor(GRID_SIZE / 2);
      snake = [{x: startX + 3, y: startY}, {x: startX + 2, y: startY}, {x: startX + 1, y: startY}, {x: startX, y: startY}];
      direction = 'right';
      nextDirection = 'right';
      score = 0;
      applesEaten = 0;
      gameOver = false;
      gameStarted = false;
      if (gameLoop) clearInterval(gameLoop);
      createWalls();
      placeFood();
      scoreDisplay.textContent = '0';
      render();
    }

    function createWalls() {
      walls = [];
      // Create outer walls only
      for (let x = 0; x < GRID_SIZE; x++) {
        walls.push({x, y: 0});
        walls.push({x, y: GRID_SIZE - 1});
      }
      for (let y = 0; y < GRID_SIZE; y++) {
        walls.push({x: 0, y});
        walls.push({x: GRID_SIZE - 1, y});
      }
    }

    function placeFood() {
      let newFood;
      do {
        newFood = {
          x: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1,
          y: Math.floor(Math.random() * (GRID_SIZE - 2)) + 1
        };
      } while (
        snake.some(segment => segment.x === newFood.x && segment.y === newFood.y) ||
        walls.some(wall => wall.x === newFood.x && wall.y === newFood.y)
      );
      food = newFood;
    }    function update() {
      if (gameOver || !gameStarted) return;
      direction = nextDirection;
      const head = {...snake[0]};
      switch (direction) {
        case 'up': head.y--; break;
        case 'down': head.y++; break;
        case 'left': head.x--; break;
        case 'right': head.x++; break;
      }
      if (walls.some(w => w.x === head.x && w.y === head.y) || snake.some(s => s.x === head.x && s.y === head.y)) {
        gameOver = true;
        if (onFinish) onFinish({result: 'lose', score});
        return;
      }
      snake.unshift(head);
      if (food && head.x === food.x && head.y === food.y) {
        score += 10;
        applesEaten++;
        scoreDisplay.textContent = score;
        if (applesEaten >= 5) {
          gameOver = true;
          if (onFinish) onFinish({result: 'win', score});
          return;
        }
        placeFood();
      } else {
        snake.pop();
      }
      render();
    }

    function render() {
      ctx.fillStyle = '#021018';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      walls.forEach(wall => {
        ctx.fillStyle = '#1a3040';
        ctx.fillRect(wall.x * CELL_SIZE, wall.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      });
      snake.forEach((segment, i) => {
        ctx.fillStyle = i === 0 ? '#b88cff' : '#0b2230';
        ctx.fillRect(segment.x * CELL_SIZE + 1, segment.y * CELL_SIZE + 1, CELL_SIZE - 2, CELL_SIZE - 2);
      });
      if (food) {
        ctx.fillStyle = '#79ff8a';
        ctx.beginPath();
        ctx.arc(food.x * CELL_SIZE + CELL_SIZE/2, food.y * CELL_SIZE + CELL_SIZE/2, CELL_SIZE/3, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!gameStarted) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Press arrow keys to start', canvas.width/2, canvas.height/2);
      } else if (gameOver) {
        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.font = 'bold 24px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(score > 0 ? 'You Win!' : 'Game Over', canvas.width/2, canvas.height/2);
      }
    }

    function handleKeydown(e) {
      if (!gameStarted && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        gameStarted = true;
        gameLoop = setInterval(update, SPEED);
      }
      switch (e.key) {
        case 'ArrowUp': if (direction !== 'down') nextDirection = 'up'; break;
        case 'ArrowDown': if (direction !== 'up') nextDirection = 'down'; break;
        case 'ArrowLeft': if (direction !== 'right') nextDirection = 'left'; break;
        case 'ArrowRight': if (direction !== 'left') nextDirection = 'right'; break;
      }
    }

    document.addEventListener('keydown', handleKeydown);
    wrapper.querySelector('.sn-reset').addEventListener('click', init);
    init();
    return () => {
      document.removeEventListener('keydown', handleKeydown);
      if (gameLoop) clearInterval(gameLoop);
      wrapper.remove();
    };
  }
  return { start };
})();
