const playerHealthFill = document.getElementById('player-health-fill');
const opponentHealthFill = document.getElementById('opponent-health-fill');
const startOverlay = document.getElementById('start-overlay');
const startButton = document.getElementById('start-button');
const endOverlay = document.getElementById('end-overlay');
const endTitle = document.getElementById('end-title');
const restartButton = document.getElementById('restart-button');
const damageFlash = document.getElementById('damage-flash');
const banterEl = document.getElementById('banter');

export function updateHealth(playerHealth, playerMax, opponentHealth, opponentMax) {
  playerHealthFill.style.width = `${Math.max(0, (playerHealth / playerMax) * 100)}%`;
  opponentHealthFill.style.width = `${Math.max(0, (opponentHealth / opponentMax) * 100)}%`;
}

export function onStart(callback) {
  startButton.addEventListener('click', () => {
    startOverlay.classList.add('hidden');
    callback();
  });
}

export function onRestart(callback) {
  restartButton.addEventListener('click', () => {
    endOverlay.classList.add('hidden');
    callback();
  });
}

export function showEndOverlay(didWin) {
  endTitle.textContent = didWin ? 'You Win' : 'You Lose';
  endOverlay.classList.remove('hidden');
}

export function flashPlayerDamage() {
  damageFlash.classList.remove('flash');
  void damageFlash.offsetWidth; // force reflow so the animation restarts on rapid hits
  damageFlash.classList.add('flash');
}

export function showBanter(text) {
  if (!text) return;
  banterEl.textContent = text;
  banterEl.classList.remove('show');
  void banterEl.offsetWidth; // force reflow so the animation restarts on rapid triggers
  banterEl.classList.add('show');
}

export function hideBanter() {
  banterEl.classList.remove('show');
  banterEl.textContent = '';
}
