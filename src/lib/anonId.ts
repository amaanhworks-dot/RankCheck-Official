const STORAGE_KEY = 'rankcheck_uid';
const GAMERTAG_KEY = 'rankcheck_gamertag';

export function getOrCreateAnonId(): string {
  let id = localStorage.getItem(STORAGE_KEY);
  if (id) return id;

  // Generate new ID: "usr_" + first 8 chars of a random UUID
  const uuid = crypto.randomUUID ? crypto.randomUUID() : String(Math.random()) + String(Date.now());
  const short = uuid.replace(/-/g, '').slice(0, 8);
  id = `usr_${short}`;
  localStorage.setItem(STORAGE_KEY, id);
  return id;
}

// ⭐ NEW: Save gamertag to localStorage
export function saveGamertag(gamertag: string): void {
  localStorage.setItem(GAMERTAG_KEY, gamertag);
}

// ⭐ NEW: Get gamertag from localStorage
export function getGamertag(): string | null {
  return localStorage.getItem(GAMERTAG_KEY);
}

// ⭐ NEW: Check if gamertag exists
export function hasGamertag(): boolean {
  return localStorage.getItem(GAMERTAG_KEY) !== null;
}