const keysDown = new Set();

const trackedKeys = new Set([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Space',
]);

window.addEventListener('keydown', (event) => {
  if (trackedKeys.has(event.code)) {
    keysDown.add(event.code);
    event.preventDefault();
  }
});

window.addEventListener('keyup', (event) => {
  if (trackedKeys.has(event.code)) {
    keysDown.delete(event.code);
    event.preventDefault();
  }
});

export function isDown(key) {
  return keysDown.has(key);
}
