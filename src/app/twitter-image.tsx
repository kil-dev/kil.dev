import OpengraphImage from './opengraph-image'

// Image metadata
export const alt = 'Kilian Tyler | Site Reliability | DevOps Engineer'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/jpeg'

// Image generation
export default async function TwitterImage() {
  return await OpengraphImage()
}
