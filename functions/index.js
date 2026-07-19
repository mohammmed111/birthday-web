import { onRequest } from 'firebase-functions/v2/https'
import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

// ── Firebase Admin ────────────────────────────────────────────────────
initializeApp()
const db = getFirestore()

// ── Paths ─────────────────────────────────────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const FONT_PATH = path.join(__dirname, 'fonts', 'Tajawal-Bold.ttf')
const TEMPLATE_PATH = path.join(__dirname, 'index-template.html')

// ── Defaults ──────────────────────────────────────────────────────────
const DEFAULT_TITLE = 'بطاقة عيد ميلاد 🎂'
const DEFAULT_DESC = 'أنشئ رابط تهنئة مخصص بتجربة تفاعلية فريدة — كيك، شموع، وموسيقى.'
const DOMAIN = 'https://birthdayweb-ae7a4.web.app'

// ── Helper: read data from Firestore ────────────────────────────────────
async function getBirthdayData(docId) {
  try {
    const snap = await db.collection('birthdays').doc(docId).get()
    if (snap.exists) {
      return snap.data()
    }
  } catch (err) {
    console.error('Firestore read error:', err.message)
  }
  return null
}

// ══════════════════════════════════════════════════════════════════════
// 1) renderPage — serves /b/:id with injected meta tags
// ══════════════════════════════════════════════════════════════════════
export const renderPage = onRequest(
  { region: 'us-central1', memory: '256MiB' },
  async (req, res) => {
    try {
      // Extract doc ID from path: /b/abc123 → abc123
      const segments = req.path.split('/').filter(Boolean) // ['b', 'abc123']
      const docId = segments[1] || ''

      // Read data from Firestore
      const data = docId ? await getBirthdayData(docId) : null
      const name = data?.name || null

      // Build meta values
      const title = name
        ? `بطاقة عيد ميلاد لـ ${name} 🎂`
        : DEFAULT_TITLE
      const description = name
        ? `تهنئة عيد ميلاد خاصة بانتظار ${name} — كيك، شموع، وموسيقى 🎉`
        : DEFAULT_DESC
      const ogImageUrl = name
        ? `${DOMAIN}/api/og-image?id=${encodeURIComponent(docId)}`
        : `${DOMAIN}/og-image.png`

      // Read the HTML template
      let html = fs.readFileSync(TEMPLATE_PATH, 'utf-8')

      // Inject/replace meta tags in <head>
      // Replace <title>
      html = html.replace(
        /<title>[^<]*<\/title>/,
        `<title>${escapeHtml(title)}</title>`
      )
      // Replace og:title
      html = html.replace(
        /<meta property="og:title"[^>]*\/>/,
        `<meta property="og:title" content="${escapeAttr(title)}" />`
      )
      // Replace og:description
      html = html.replace(
        /<meta property="og:description"[^>]*\/>/,
        `<meta property="og:description" content="${escapeAttr(description)}" />`
      )
      // Replace og:image
      html = html.replace(
        /<meta property="og:image" content="[^"]*" \/>/,
        `<meta property="og:image" content="${escapeAttr(ogImageUrl)}" />`
      )
      // Replace og:url
      html = html.replace(
        /<meta property="og:url"[^>]*\/>/,
        `<meta property="og:url" content="${DOMAIN}/b/${escapeAttr(docId)}" />`
      )
      // Replace twitter:title
      html = html.replace(
        /<meta name="twitter:title"[^>]*\/>/,
        `<meta name="twitter:title" content="${escapeAttr(title)}" />`
      )
      // Replace twitter:description
      html = html.replace(
        /<meta name="twitter:description"[^>]*\/>/,
        `<meta name="twitter:description" content="${escapeAttr(description)}" />`
      )
      // Replace twitter:image
      html = html.replace(
        /<meta name="twitter:image"[^>]*\/>/,
        `<meta name="twitter:image" content="${escapeAttr(ogImageUrl)}" />`
      )
      // Replace meta description
      html = html.replace(
        /<meta name="description"[^>]*\/>/,
        `<meta name="description" content="${escapeAttr(description)}" />`
      )

      res.set('Cache-Control', 'public, max-age=300, s-maxage=600')
      res.status(200).send(html)
    } catch (err) {
      console.error('renderPage error:', err)
      // Fallback: serve the original template as-is
      try {
        const html = fs.readFileSync(TEMPLATE_PATH, 'utf-8')
        res.status(200).send(html)
      } catch {
        res.status(500).send('Internal Server Error')
      }
    }
  }
)

// ══════════════════════════════════════════════════════════════════════
// 2) ogImage — serves /api/og-image?id=xxx → dynamic PNG
// ══════════════════════════════════════════════════════════════════════

// Lazy-load the font (once per cold start)
let fontBuffer = null
function getFont() {
  if (!fontBuffer) {
    fontBuffer = fs.readFileSync(FONT_PATH)
  }
  return fontBuffer
}

export const ogImage = onRequest(
  { region: 'us-central1', memory: '512MiB' },
  async (req, res) => {
    try {
      const docId = req.query.id || ''
      const data = docId ? await getBirthdayData(docId) : null
      const name = data?.name || null
      const theme = data?.theme || 'sapphire'
      
      const headline = name
        ? `بطاقة عيد ميلاد لـ ${name} 🎂`
        : 'بطاقة عيد ميلاد 🎂'

      const font = getFont()

      // Theme colors
      const themeColors = {
        sapphire: {
          background: 'linear-gradient(to bottom, #051937, #020B18)',
          primary: '#0F52BA',
          secondary: '#E8B54D',
          muted: '#7C93B0',
          textMain: '#FBF3E7'
        },
        rose: {
          background: 'linear-gradient(to bottom, #1A0410, #0F0209)',
          primary: '#F66C89',
          secondary: '#F27798',
          muted: '#566B81',
          textMain: '#F5F5F5'
        }
      }
      const tc = themeColors[theme] || themeColors.sapphire

      // Build the design as Satori JSX-like objects
      const element = {
        type: 'div',
        props: {
          style: {
            width: '1200px',
            height: '630px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundImage: tc.background,
            fontFamily: 'Tajawal',
            position: 'relative',
            overflow: 'hidden',
          },
          children: [
            // Sparkles
            ...createSparkles(tc.secondary),
            // Content wrapper
            {
              type: 'div',
              props: {
                style: {
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: '-40px',
                },
                children: [
                  // Circular seal
                  {
                    type: 'div',
                    props: {
                      style: {
                        width: '110px',
                        height: '110px',
                        borderRadius: '50%',
                        border: `2px solid ${tc.secondary}`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '30px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      },
                      children: [
                        {
                          type: 'div',
                          props: {
                            style: { fontSize: '48px' },
                            children: '🎂',
                          },
                        },
                      ],
                    },
                  },
                  // Headline
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: name ? '72px' : '84px',
                        fontWeight: 700,
                        color: tc.textMain,
                        marginBottom: '20px',
                        lineHeight: 1.2,
                        textAlign: 'center',
                        maxWidth: '1100px',
                        direction: 'rtl',
                      },
                      children: headline,
                    },
                  },
                  // Tagline
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '30px',
                        fontWeight: 700,
                        color: tc.muted,
                        textAlign: 'center',
                        direction: 'rtl',
                      },
                      children: 'احتفل بلحظة مميزة... بطريقة لا تُنسى',
                    },
                  },
                ],
              },
            },
            // Footer strip
            {
              type: 'div',
              props: {
                style: {
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  width: '100%',
                  height: '80px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0 50px',
                  borderTop: '1px solid rgba(124, 147, 176, 0.2)',
                  backgroundColor: 'rgba(2, 11, 24, 0.8)',
                },
                children: [
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '18px',
                        color: tc.muted,
                        direction: 'rtl',
                      },
                      children: 'أنشئ تهنئتك التفاعلية الآن — كيك، شموع، وموسيقى',
                    },
                  },
                  {
                    type: 'div',
                    props: {
                      style: {
                        fontSize: '16px',
                        color: tc.muted,
                        opacity: 0.7,
                      },
                      children: 'birthdayweb-ae7a4.web.app',
                    },
                  },
                ],
              },
            },
          ],
        },
      }

      // Render SVG with Satori
      const svg = await satori(element, {
        width: 1200,
        height: 630,
        fonts: [
          {
            name: 'Tajawal',
            data: font,
            weight: 700,
            style: 'normal',
          },
        ],
      })

      // Convert SVG → PNG
      const resvg = new Resvg(svg, {
        fitTo: { mode: 'width', value: 1200 },
      })
      const png = resvg.render().asPng()

      res.set('Content-Type', 'image/png')
      res.set('Cache-Control', 'public, max-age=86400, s-maxage=604800')
      res.status(200).send(Buffer.from(png))
    } catch (err) {
      console.error('ogImage error:', err)
      // Fallback: redirect to static image
      res.redirect(302, `${DOMAIN}/og-image.png`)
    }
  }
)

// ── Sparkle helpers ───────────────────────────────────────────────────
function createSparkles(color) {
  const positions = [
    { top: '15%', left: '20%', size: '30px', opacity: 0.2 },
    { top: '25%', right: '15%', size: '20px', opacity: 0.15 },
    { bottom: '30%', left: '10%', size: '25px', opacity: 0.2 },
    { bottom: '20%', right: '25%', size: '35px', opacity: 0.1 },
    { top: '50%', left: '5%', size: '15px', opacity: 0.1 },
    { top: '60%', right: '5%', size: '22px', opacity: 0.15 },
  ]
  return positions.map((p) => ({
    type: 'div',
    props: {
      style: {
        position: 'absolute',
        top: p.top,
        bottom: p.bottom,
        left: p.left,
        right: p.right,
        color: color,
        opacity: p.opacity,
        fontSize: p.size,
      },
      children: '✦',
    },
  }))
}

// ── HTML escaping ─────────────────────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function escapeAttr(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}
