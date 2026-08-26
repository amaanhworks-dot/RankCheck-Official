const STORAGE_KEY = 'rankcheck_uid';

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