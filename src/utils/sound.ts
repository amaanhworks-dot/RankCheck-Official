// src/utils/sound.ts

type SoundType = 
  | 'hit' 
  | 'miss' 
  | 'ace' 
  | 'combo' 
  | 'rankup' 
  | 'start' 
  | 'end'
  | 'button';

const SOUND_URLS: Record<SoundType, string> = {
  hit: '/sounds/hit.mp3',
  miss: '/sounds/miss.mp3',
  ace: '/sounds/ace.mp3',
  combo: '/sounds/combo.mp3',
  rankup: '/sounds/rankup.mp3',
  start: '/sounds/start.mp3',
  end: '/sounds/end.mp3',
  button: '/sounds/button.mp3',
};

// Cache audio objects for faster playback
const audioCache: Record<string, HTMLAudioElement> = {};

function getAudio(type: SoundType): HTMLAudioElement {
  if (!audioCache[type]) {
    audioCache[type] = new Audio(SOUND_URLS[type]);
    audioCache[type].volume = 0.3;
  }
  return audioCache[type];
}

function playSound(type: SoundType, volume: number = 0.3): void {
  try {
    const audio = getAudio(type);
    audio.volume = volume;
    audio.currentTime = 0;
    audio.play().catch(() => {
      // Silent fail
    });
  } catch (error) {
    console.debug('Sound disabled:', error);
  }
}

export { playSound, type SoundType };