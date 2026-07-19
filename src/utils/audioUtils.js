/**
 * Audio URL utility functions
 * Detects audio type (direct file vs YouTube) and extracts YouTube video IDs
 */

const YOUTUBE_REGEX = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/

/**
 * Detect the type of audio URL
 * @param {string} url
 * @returns {'youtube' | 'direct' | null}
 */
export function detectAudioType(url) {
  if (!url || typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  if (YOUTUBE_REGEX.test(trimmed)) return 'youtube'

  // Check if it looks like a valid URL
  try {
    new URL(trimmed)
    return 'direct'
  } catch {
    return null
  }
}

/**
 * Extract YouTube video ID from a URL
 * Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/, youtube.com/shorts/
 * @param {string} url
 * @returns {string|null}
 */
export function extractYouTubeId(url) {
  if (!url) return null
  const match = url.match(YOUTUBE_REGEX)
  return match ? match[1] : null
}
