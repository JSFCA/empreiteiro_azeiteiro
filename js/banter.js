const banter = { ON_HIT_PLAYER: [], ON_TAKE_DAMAGE: [], ON_WIN: [] };

function parseBanter(text) {
  let section = null;
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const sectionMatch = line.match(/^\[(.+)\]$/);
    if (sectionMatch) {
      section = sectionMatch[1].trim();
      continue;
    }
    if (section && banter[section]) {
      banter[section].push(line);
    }
  }
}

async function loadBanter() {
  try {
    const res = await fetch(new URL('../banter.txt', import.meta.url));
    parseBanter(await res.text());
  } catch (err) {
    console.error('Failed to load banter.txt', err);
  }
}

// Top-level await: importers wait for this to resolve before their own code runs.
await loadBanter();

export function randomBanter(category) {
  const lines = banter[category];
  if (!lines || lines.length === 0) return '';
  return lines[Math.floor(Math.random() * lines.length)];
}
