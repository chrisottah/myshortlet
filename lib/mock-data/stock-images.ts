// Deterministic stock-image picker: maps any ID (opportunity, property)
// to a stable Unsplash photo so the same item always shows the same image
// across renders/deploys, without needing a real image field per record.

const PHOTO_IDS = [
  "1522708323590-d24dbb6b0267", // interior, bright living room
  "1502672260266-1c1ef2d93688", // modern apartment building
  "1512918728675-ed5a9ecdebfd", // living room, neutral tones
  "1493809842364-78817add7ffb", // bedroom
  "1600585154340-be6161a56a0c", // bathroom
  "1600607687939-ce8a6c25118c", // interior, open plan
  "1571003123894-1f0594d2b5d9", // apartment exterior, dusk
  "1512917774080-9991f1c4c750", // living room, bright
  "1560185127-6ed189bf02f4", // kitchen
  "1502005229762-cf1b2da7c5d6", // city skyline
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function buildUrl(photoId: string, width: number): string {
  return `https://images.unsplash.com/photo-${photoId}?q=80&w=${width}&auto=format&fit=crop`;
}

/** One stable image for a card/thumbnail. */
export function getImageForId(id: string, width = 800): string {
  const index = hashString(id) % PHOTO_IDS.length;
  return buildUrl(PHOTO_IDS[index], width);
}

/** `count` distinct stable images for a gallery, seeded from the same id. */
export function getGalleryForId(id: string, count = 3, width = 1000): string[] {
  const start = hashString(id) % PHOTO_IDS.length;
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    const index = (start + i) % PHOTO_IDS.length;
    result.push(buildUrl(PHOTO_IDS[index], width));
  }
  return result;
}

/** Wide hero/background image, independent of any record id. */
export const HERO_IMAGE_URL = buildUrl("1560448204-e02f11c3d0e2", 2000);