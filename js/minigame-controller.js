// Minigame controller - manages game overlays and win/lose conditions
document.addEventListener('click', (e) => {
  const target = e.target;
  
  // Handle minigame launch buttons
  if (target.matches('[data-game]')) {
    const gameType = target.dataset.game;
    const container = document.getElementById('minigame-container');
    const overlay = document.getElementById('minigame-overlay');
    const title = document.getElementById('minigame-title');
    
    // Clear any existing game
    container.innerHTML = '';
    
    // Set title
    title.textContent = gameType.charAt(0).toUpperCase() + gameType.slice(1);
    
    // Show overlay
    overlay.removeAttribute('hidden');
    
    // Create game-specific elements
    switch (gameType) {
      case 'tetris':
        const canvas = document.createElement('canvas');
        canvas.id = 'tetris';
        container.appendChild(canvas);
        window.initTetris(); // Defined in tetris-game.js
        break;
      case 'snake':
        const snakeCanvas = document.createElement('canvas');
        snakeCanvas.id = 'snake';
        container.appendChild(snakeCanvas);
        window.initSnake(); // Defined in snake-game.js
        break;
      case 'minesweeper':
        const msDiv = document.createElement('div');
        msDiv.id = 'minesweeper';
        container.appendChild(msDiv);
        window.initMinesweeper(); // Defined in minesweeper-game.js
        break;
    }
  }
  
  // Handle minigame close button
  if (target.matches('#minigame-close')) {
    const overlay = document.getElementById('minigame-overlay');
    overlay.setAttribute('hidden', '');
    
    // Consider closing the game a loss unless explicitly won
    if (window.currentMinigameCallbacks?.onLose) {
      window.currentMinigameCallbacks.onLose();
    }
    
    // Clear callbacks
    window.currentMinigameCallbacks = null;
  }
});

// Export win/lose handlers for games to use
window.minigameComplete = (success) => {
  // Short delay to show the win/lose state
  setTimeout(() => {
    // Hide the overlay
    const overlay = document.getElementById('minigame-overlay');
    overlay.setAttribute('hidden', '');
    
    // Call the appropriate callback
    if (success && window.currentMinigameCallbacks?.onWin) {
      window.currentMinigameCallbacks.onWin();
    } else if (!success && window.currentMinigameCallbacks?.onLose) {
      window.currentMinigameCallbacks.onLose();
    }
    
    // Clear callbacks
    window.currentMinigameCallbacks = null;
  }, 500);
};
