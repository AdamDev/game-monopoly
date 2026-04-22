const BUCKET = 'ai-project-1-484515-monopoly-avatars'
const BASE = `https://storage.googleapis.com/${BUCKET}`

const AVATAR_MAP: Record<string, string> = {
  'אגם': `${BASE}/agam.png`,
  'אדם': `${BASE}/adam.png`,
  'טוי': `${BASE}/toy.png`,
  'סיון': `${BASE}/sivan.png`,
  'רוני': `${BASE}/roni.png`,
}

function normalize(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '').normalize('NFC')
}

const NORMALIZED_MAP: Record<string, string> = Object.fromEntries(
  Object.entries(AVATAR_MAP).map(([k, v]) => [normalize(k), v])
)

export function getAvatarForName(name: string): string | null {
  return NORMALIZED_MAP[normalize(name)] || null
}
