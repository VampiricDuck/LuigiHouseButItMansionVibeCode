// Manages minigame launches and completions for good choices
const MINIGAMES = ['snake', 'tetris', 'minesweeper'];
const LOCKED_CHOICES_KEY = 'lockedChoices';

// Track which choices have been failed
function getLockedChoices() {
  const saved = localStorage.getItem(LOCKED_CHOICES_KEY);
  return saved ? JSON.parse(saved) : {};
}

function lockChoice(sceneId, choiceText) {
  const locked = getLockedChoices();
  if (!locked[sceneId]) locked[sceneId] = [];
  if (!locked[sceneId].includes(choiceText)) {
    locked[sceneId].push(choiceText);
  }
  localStorage.setItem(LOCKED_CHOICES_KEY, JSON.stringify(locked));
}

function isChoiceLocked(sceneId, choiceText) {
  const locked = getLockedChoices();
  return locked[sceneId] && locked[sceneId].includes(choiceText);
}

function unlockChoice(sceneId, choiceText) {
  const locked = getLockedChoices();
  if (locked[sceneId]) {
    const index = locked[sceneId].indexOf(choiceText);
    if (index > -1) {
      locked[sceneId].splice(index, 1);
      if (locked[sceneId].length === 0) delete locked[sceneId];
      localStorage.setItem(LOCKED_CHOICES_KEY, JSON.stringify(locked));
    }
  }
}

// Launch a random minigame
function launchMinigame(sceneId, choiceText, onWin, onLose) {
  const game = MINIGAMES[Math.floor(Math.random() * MINIGAMES.length)];
  const gameButton = document.querySelector(`[data-game="${game}"]`);
  if (gameButton) {
    // Store the callbacks for the minigame controller to use
    window.currentMinigameCallbacks = {
      onWin: () => {
        unlockChoice(sceneId, choiceText);
        onWin();
      },
      onLose: () => {
        lockChoice(sceneId, choiceText);
        onLose();
      }
    };
    gameButton.click();
  }
}

// Export functions
window.minigameHandler = {
  launchMinigame,
  isChoiceLocked,
  unlockChoice
};