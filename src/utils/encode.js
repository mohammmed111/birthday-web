import LZString from 'lz-string'

/**
 * Encode birthday data to a URL-safe string
 * Uses lz-string's compressToEncodedURIComponent (safe base64 alphabet, no +/=)
 * @param {Object} data - { name, message, audioUrl }
 * @returns {string} URL-safe encoded string
 */
export function encodeData(data) {
  try {
    const json = JSON.stringify(data)
    // compressToEncodedURIComponent uses a URL-safe alphabet (only A-Za-z0-9$@-)
    const compressed = LZString.compressToEncodedURIComponent(json)
    return compressed
  } catch (err) {
    console.error('encodeData error:', err)
    throw new Error('فشل في تشفير البيانات')
  }
}

/**
 * Decode URL-safe string back to birthday data object.
 *
 * Why the space-to-plus fix?
 * React Router's useParams() calls decodeURIComponent on path segments.
 * lz-string's encodedURIComponent alphabet includes the character '+'.
 * But decodeURIComponent does NOT convert '+' to ' ' — only application/x-www-form-urlencoded does.
 * However, some servers/browsers might encode '+' as '%2B' then decode back.
 * We try both the original and the space→plus-replaced variants for robustness.
 *
 * @param {string} encoded - param from useParams() (already decoded by React Router)
 * @returns {Object|null} - { name, message, audioUrl } or null on failure
 */
export function decodeData(encoded) {
  try {
    if (!encoded || typeof encoded !== 'string') {
      throw new Error('البيانات فارغة')
    }

    // Attempt 1: direct decode
    let json = LZString.decompressFromEncodedURIComponent(encoded)

    // Attempt 2: replace spaces with '+' (handles www-form-urlencoded decoding quirks)
    if (!json) {
      const restored = encoded.replace(/ /g, '+')
      json = LZString.decompressFromEncodedURIComponent(restored)
    }

    // Attempt 3: try decoding as if it was double-encoded
    if (!json) {
      try {
        const decoded = decodeURIComponent(encoded)
        json = LZString.decompressFromEncodedURIComponent(decoded)
      } catch {}
    }

    if (!json) {
      throw new Error('فشل فك الضغط')
    }

    const data = JSON.parse(json)
    if (!data || typeof data !== 'object') {
      throw new Error('تنسيق البيانات غير صالح')
    }
    return data
  } catch (err) {
    console.error('decodeData error:', err)
    return null
  }
}
