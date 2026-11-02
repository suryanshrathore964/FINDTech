/** Local authentic 2026 studio laptop photos (served from /public/images/laptops). */
export const SAMPLE_LAPTOP_IMAGES = [
  '/images/laptops/apple-macbook-pro.jpg',
  '/images/laptops/dell-xps.jpg',
  '/images/laptops/razer-blade.jpg',
  '/images/laptops/asus-rog-zephyrus.jpg',
  '/images/laptops/lenovo-thinkpad.jpg',
  '/images/laptops/dell-alienware.jpg',
  '/images/laptops/apple-macbook-air.jpg',
  '/images/laptops/microsoft-surface.jpg',
  '/images/laptops/hp-spectre.jpg',
  '/images/laptops/samsung-galaxy-book.jpg',
  '/images/laptops/acer-predator.jpg',
  '/images/laptops/framework-laptop.jpg',
  '/images/laptops/msi-gaming.jpg',
] as const

export const DEFAULT_LAPTOP_IMAGE = SAMPLE_LAPTOP_IMAGES[0]

const MODEL_IMAGE_MAP: [string, string][] = [
  ['macbook pro', '/images/laptops/apple-macbook-pro.jpg'],
  ['macbook air', '/images/laptops/apple-macbook-air.jpg'],
  ['apple', '/images/laptops/apple-macbook-pro.jpg'],
  ['alienware', '/images/laptops/dell-alienware.jpg'],
  ['xps', '/images/laptops/dell-xps.jpg'],
  ['dell', '/images/laptops/dell-xps.jpg'],
  ['thinkpad', '/images/laptops/lenovo-thinkpad.jpg'],
  ['legion', '/images/laptops/lenovo-thinkpad.jpg'],
  ['yoga', '/images/laptops/lenovo-thinkpad.jpg'],
  ['lenovo', '/images/laptops/lenovo-thinkpad.jpg'],
  ['zephyrus', '/images/laptops/asus-rog-zephyrus.jpg'],
  ['strix', '/images/laptops/asus-rog-zephyrus.jpg'],
  ['zenbook', '/images/laptops/asus-rog-zephyrus.jpg'],
  ['vivobook', '/images/laptops/asus-rog-zephyrus.jpg'],
  ['tuf', '/images/laptops/asus-rog-zephyrus.jpg'],
  ['asus', '/images/laptops/asus-rog-zephyrus.jpg'],
  ['spectre', '/images/laptops/hp-spectre.jpg'],
  ['omen', '/images/laptops/hp-spectre.jpg'],
  ['envy', '/images/laptops/hp-spectre.jpg'],
  ['victus', '/images/laptops/hp-spectre.jpg'],
  ['hp', '/images/laptops/hp-spectre.jpg'],
  ['blade', '/images/laptops/razer-blade.jpg'],
  ['razer', '/images/laptops/razer-blade.jpg'],
  ['predator', '/images/laptops/acer-predator.jpg'],
  ['nitro', '/images/laptops/acer-predator.jpg'],
  ['swift', '/images/laptops/acer-predator.jpg'],
  ['acer', '/images/laptops/acer-predator.jpg'],
  ['surface', '/images/laptops/microsoft-surface.jpg'],
  ['microsoft', '/images/laptops/microsoft-surface.jpg'],
  ['galaxy book', '/images/laptops/samsung-galaxy-book.jpg'],
  ['samsung', '/images/laptops/samsung-galaxy-book.jpg'],
  ['raider', '/images/laptops/msi-gaming.jpg'],
  ['stealth', '/images/laptops/msi-gaming.jpg'],
  ['cyborg', '/images/laptops/msi-gaming.jpg'],
  ['titan', '/images/laptops/msi-gaming.jpg'],
  ['msi', '/images/laptops/msi-gaming.jpg'],
  ['framework', '/images/laptops/framework-laptop.jpg'],
]

function imageIndexFromId(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = (hash + id.charCodeAt(i)) % 9973
  }
  return hash % SAMPLE_LAPTOP_IMAGES.length
}

function isMissingImage(url: string | undefined | null): boolean {
  if (!url || !url.trim()) return true
  const lower = url.trim().toLowerCase()
  if (lower === 'null' || lower === 'undefined' || lower === 'none') return true
  if (lower.includes('placeholder') && lower.includes('no-image')) return true
  return false
}

const OLD_GENERIC_IMAGES = new Set([
  '/images/laptops/magicbook-ultrabook.png',
  '/images/laptops/premium-dual-laptop.png',
  '/images/laptops/gaming-hyperx.png',
  '/images/laptops/asus-expertbook.png',
  '/images/laptops/gaming-setup.png',
  '/images/laptops/asus-rog.png',
  '/images/laptops/acer-nitro-17.png',
])

/** Resolve a display URL — upgrades old generic images to authentic 2026 studio photos. */
export function getLaptopImageUrl(
  imageUrl: string | undefined | null,
  laptopId?: string,
  modelNameOrAlt?: string
): string {
  // If model name / alt is provided, use brand/model matching first
  if (modelNameOrAlt) {
    const text = modelNameOrAlt.toLowerCase()
    for (const [kw, path] of MODEL_IMAGE_MAP) {
      if (text.includes(kw)) {
        return path
      }
    }
  }

  // If a valid new studio image is already specified, use it directly
  if (!isMissingImage(imageUrl)) {
    const trimmed = imageUrl!.trim()
    if (trimmed.startsWith('/images/laptops/') && !OLD_GENERIC_IMAGES.has(trimmed)) {
      return trimmed
    }
    if (!trimmed.includes('unsplash.com') && !OLD_GENERIC_IMAGES.has(trimmed)) {
      return trimmed
    }
  }

  // Try matching against imageUrl path
  if (imageUrl) {
    const imgLower = imageUrl.toLowerCase()
    for (const [kw, path] of MODEL_IMAGE_MAP) {
      if (imgLower.includes(kw)) {
        return path
      }
    }
  }

  const idx = laptopId ? imageIndexFromId(laptopId) : 0
  return SAMPLE_LAPTOP_IMAGES[idx]
}

