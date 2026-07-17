/**
 * Web Audio API blow detection utility
 * Uses RMS energy analysis to detect blowing sound
 */

let audioContext = null
let analyser = null
let microphone = null
let stream = null
let animationId = null
let detectionInterval = null

const BLOW_THRESHOLD = 0.035   // RMS threshold for blow detection
const CONFIRM_DURATION = 350   // ms of sustained blow to confirm

/**
 * Start microphone blow detection
 * @param {Function} onBlow - Called when a blow is confirmed
 * @param {Function} onError - Called when mic access fails
 * @param {Function} onVolume - Called each frame with current volume (0-1)
 * @returns {Promise<void>}
 */
export async function startBlowDetection({ onBlow, onError, onVolume }) {
  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false })
    audioContext = new (window.AudioContext || window.webkitAudioContext)()
    analyser = audioContext.createAnalyser()
    analyser.fftSize = 256
    analyser.smoothingTimeConstant = 0.7

    microphone = audioContext.createMediaStreamSource(stream)
    microphone.connect(analyser)

    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)

    let blowStartTime = null
    let blowDetected = false

    function analyse() {
      if (!analyser) return

      analyser.getByteTimeDomainData(dataArray)

      // Calculate RMS (Root Mean Square) energy
      let sumSquares = 0
      for (let i = 0; i < bufferLength; i++) {
        const normalized = (dataArray[i] - 128) / 128
        sumSquares += normalized * normalized
      }
      const rms = Math.sqrt(sumSquares / bufferLength)

      // Emit volume for visual feedback (0-1 scale)
      if (onVolume) onVolume(Math.min(rms / 0.15, 1))

      if (rms > BLOW_THRESHOLD) {
        if (!blowStartTime) {
          blowStartTime = Date.now()
        } else if (Date.now() - blowStartTime >= CONFIRM_DURATION && !blowDetected) {
          blowDetected = true
          onBlow()
          stopBlowDetection()
          return
        }
      } else {
        blowStartTime = null
      }

      animationId = requestAnimationFrame(analyse)
    }

    animationId = requestAnimationFrame(analyse)
  } catch (err) {
    console.error('Microphone error:', err)
    if (onError) onError(err)
  }
}

/**
 * Stop microphone and clean up audio resources
 */
export function stopBlowDetection() {
  if (animationId) {
    cancelAnimationFrame(animationId)
    animationId = null
  }
  if (detectionInterval) {
    clearInterval(detectionInterval)
    detectionInterval = null
  }
  if (microphone) {
    microphone.disconnect()
    microphone = null
  }
  if (analyser) {
    analyser.disconnect()
    analyser = null
  }
  if (audioContext) {
    audioContext.close()
    audioContext = null
  }
  if (stream) {
    stream.getTracks().forEach(track => track.stop())
    stream = null
  }
}

/**
 * Check if microphone permission is available
 * @returns {Promise<'granted'|'denied'|'prompt'|'unavailable'>}
 */
export async function checkMicrophonePermission() {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return 'unavailable'
  }
  try {
    const result = await navigator.permissions.query({ name: 'microphone' })
    return result.state
  } catch {
    return 'prompt'
  }
}
