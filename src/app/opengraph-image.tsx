import { HOME_CONTENT } from '@/lib/content'
import { LIGHT_GRID } from '@/lib/light-grid'
import { headers } from 'next/headers'
import { ImageResponse } from 'next/og'

// Image metadata
export const alt = 'Kilian Tyler | Site Reliability | DevOps Engineer'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/jpeg'

// Helper function to convert ArrayBuffer to base64 using browser-safe APIs
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCodePoint(bytes[i]!)
  }
  return btoa(binary)
}

// Image generation
export default async function OpengraphImage() {
  // Satori doesn't support OKLCH. Use sRGB equivalents close to theme values.
  const COLORS = {
    // deep navy close to var(--background) in dark theme
    background: '#0f172a',
    // near-white grid lines with slight opacity
    grid: 'rgba(230, 239, 252, 0.09)',
    // primary brand blue (reuse grid dot rgb for consistency)
    primary: `rgb(3, 169, 244)`,
    // foreground text
    foreground: 'rgb(250, 250, 250)',
  }

  // Get the base URL from request headers
  const headersList = await headers()
  const host = headersList.get('host') ?? 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  // Fetch assets from the public directory
  const [notoSansData, spaceGroteskData, headshotData] = await Promise.all([
    fetch(`${baseUrl}/ogi/fonts/NotoSans-Black.ttf`).then(res => res.arrayBuffer()),
    fetch(`${baseUrl}/ogi/fonts/SpaceGrotesk-Bold.ttf`).then(res => res.arrayBuffer()),
    fetch(`${baseUrl}/ogi/headshot.jpg`).then(res => res.arrayBuffer()),
  ])

  // Convert headshot ArrayBuffer to base64 data URL
  const headshotBase64 = `data:image/jpeg;base64,${arrayBufferToBase64(headshotData)}`

  const fonts = [
    {
      name: 'Noto Sans',
      data: notoSansData,
      weight: 900 as const,
      style: 'normal' as const,
    },
    {
      name: 'Space Grotesk',
      data: spaceGroteskData,
      weight: 700 as const,
      style: 'normal' as const,
    },
  ]

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          position: 'relative',
          // Match dark mode background color from CSS theme (approx sRGB)
          backgroundColor: COLORS.background,
          // Grid lines color from dark theme var(--grid-color) (sRGB)
          backgroundImage: `linear-gradient(to right, ${COLORS.grid} 1px, transparent 1px), linear-gradient(to bottom, ${COLORS.grid} 1px, transparent 1px)`,
          backgroundSize: `${LIGHT_GRID.GRID_SIZE_PX}px ${LIGHT_GRID.GRID_SIZE_PX}px`,
          backgroundPosition: `${LIGHT_GRID.GRID_OFFSET_PX}px ${LIGHT_GRID.GRID_OFFSET_PX}px`,
          paddingLeft: '60px',
        }}>
        {/* Static grid lights overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'flex-start',
          }}
          aria-hidden>
          {[
            // Place lights exactly on grid intersections (col,row) * GRID_SIZE
            { c: 3, r: 2 },
            { c: 8, r: 4 },
            { c: 13, r: 3 },
            { c: 6, r: 10 },
            { c: 12, r: 12 },
            { c: 17, r: 11 },
            { c: 2, r: 15 },
            { c: 22, r: 1 },
            { c: 27, r: 14 },
          ]
            .map(p => ({
              x: p.c * LIGHT_GRID.GRID_SIZE_PX,
              y: p.r * LIGHT_GRID.GRID_SIZE_PX - size.height / 2,
            }))
            .map((p, i) => (
              <div
                key={i}
                style={{
                  position: 'absolute',
                  left: `${p.x - 7}px`,
                  top: `${p.y - 7}px`,
                  width: `${LIGHT_GRID.DOT_SIZE_PX}px`,
                  height: `${LIGHT_GRID.DOT_SIZE_PX}px`,
                  borderRadius: `${LIGHT_GRID.DOT_SIZE_PX / 2}px`,
                  background: `radial-gradient(circle, rgba(${LIGHT_GRID.COLOR_RGB},0.9) 0%, rgba(${LIGHT_GRID.COLOR_RGB},0.5) 50%, rgba(${LIGHT_GRID.COLOR_RGB},0) 100%)`,
                  boxShadow: `0 0 ${LIGHT_GRID.GLOW_NEAR_PX}px rgba(${LIGHT_GRID.COLOR_RGB},0.7), 0 0 ${LIGHT_GRID.GLOW_FAR_PX}px rgba(${LIGHT_GRID.COLOR_RGB},0.4)`,
                  display: 'block',
                }}
              />
            ))}
        </div>
        {/* Main content row to mirror hero layout */}
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '48px',
            width: '100%',
            maxWidth: '1100px',
            padding: '0 30px 0 0',
          }}>
          {/* Left: Name, Title, Location */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h1
              style={{
                fontSize: '88px',
                fontWeight: 900,
                color: COLORS.foreground,
                margin: 0,
                letterSpacing: '-0.02em',
                fontFamily: 'Noto Sans, Space Grotesk, ui-sans-serif, system-ui, sans-serif',
              }}>
              {HOME_CONTENT.NAME}
            </h1>
            <p
              style={{
                fontSize: '36px',
                fontWeight: 600,
                color: COLORS.primary,
                margin: 0,
                letterSpacing: '-0.01em',
                fontFamily: 'Space Grotesk, Noto Sans, ui-sans-serif, system-ui, sans-serif',
              }}>
              {HOME_CONTENT.TITLE}
            </p>
            <p
              style={{
                fontSize: '32px',
                fontWeight: 600,
                color: COLORS.primary,
                margin: 0,
                fontFamily: 'Space Grotesk, Noto Sans, ui-sans-serif, system-ui, sans-serif',
              }}>
              {HOME_CONTENT.LOCATION}
            </p>
          </div>

          {/* Right: Headshot with crooked square behind */}
          <div style={{ position: 'relative', width: 420, height: 420, flex: '0 0 auto', display: 'flex' }} aria-hidden>
            {/* Crooked square border behind */}
            <div
              style={{
                position: 'absolute',
                top: -16,
                left: -16,
                width: '100%',
                height: '100%',
                transform: 'rotate(-3deg)',
                borderRadius: 16,
                // Use explicit border properties to avoid parser issues
                borderWidth: 8,
                borderStyle: 'solid',
                borderColor: `rgb(${LIGHT_GRID.COLOR_RGB})`,
              }}
            />
            {/* Image */}
            <img
              src={headshotBase64}
              alt="Headshot"
              width={420}
              height={420}
              style={{
                display: 'block',
                borderRadius: 16,
                objectFit: 'cover',
                boxShadow: '0 20px 25px rgba(0,0,0,0.35), 0 10px 10px rgba(0,0,0,0.25)',
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts,
    },
  )
}
