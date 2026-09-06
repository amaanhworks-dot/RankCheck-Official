// src/utils/adScript.ts

type AdZone = 'inpage' | 'vignette' | 'push';

const loadedZones: Record<AdZone, boolean> = {
  inpage: false,
  vignette: false,
  push: false,
};

function loadScript(src: string, id: string, attributes?: Record<string, string>): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(id);
    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');
    script.id = id;
    script.src = src;
    script.async = true;
    script.dataset.cfasync = 'false';
    
    // ⭐ Add any extra attributes
    if (attributes) {
      Object.entries(attributes).forEach(([key, value]) => {
        script.setAttribute(key, value);
      });
    }
    
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
    document.body.appendChild(script);
  });
}

// ⭐ Initialize In-Page Push Ads (Zone: 11738357)
export async function initInPagePush() {
  if (loadedZones.inpage) return;
  try {
    // Use your In-Page Push script
    await loadScript(
      'https://nap5k.com/tag.min.js',
      'monetag-inpage',
      { 'data-zone': '11738357' }
    );
    loadedZones.inpage = true;
    console.log('✅ In-Page Push ads initialized');
  } catch (error) {
    console.error('❌ Failed to load In-Page Push:', error);
  }
}

// ⭐ Initialize Vignette Banner Ads (Zone: 11736721)
export async function initVignetteBanner() {
  if (loadedZones.vignette) return;
  try {
    // Use your Vignette Banner script
    await loadScript(
      'https://n6wxm.com/vignette.min.js',
      'monetag-vignette',
      { 'data-zone': '11736721' }
    );
    loadedZones.vignette = true;
    console.log('✅ Vignette Banner ads initialized');
  } catch (error) {
    console.error('❌ Failed to load Vignette Banner:', error);
  }
}

// ⭐ Initialize Push Notifications (Zone: 11736526)
export async function initPushNotifications() {
  if (loadedZones.push) return;
  try {
    // Use your Push Notification script
    await loadScript(
      'https://5gvci.com/act/files/tag.min.js?z=11736526',
      'monetag-push',
      { 'data-zone': '11736526' }
    );
    loadedZones.push = true;
    console.log('✅ Push Notifications initialized');
  } catch (error) {
    console.error('❌ Failed to load Push Notifications:', error);
  }
}

// ⭐ Initialize all ads
export async function initAllAds() {
  await Promise.all([
    initInPagePush(),
    initVignetteBanner(),
    initPushNotifications(),
  ]);
  console.log('✅ All ads initialized');
}

// ⭐ Reset ads on route change (reloads them)
export async function refreshAds() {
  loadedZones.inpage = false;
  loadedZones.vignette = false;
  loadedZones.push = false;

  await initAllAds();
  console.log('🔄 Ads refreshed');
}