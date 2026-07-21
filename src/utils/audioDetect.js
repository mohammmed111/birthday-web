/**
 * Web Audio API blow detection — energy-accumulation model.
 *
 * Instead of "one blow → all candles out", blow energy accumulates
 * over time proportional to sound intensity above the ambient baseline.
 * Each candle has an energy threshold; when blowEnergy exceeds it, that candle goes out.
 */

let audioContext = null
let analyser = null
let microphone = null
let stream = null
let animationId = null

const THRESHOLD_ABOVE_BASELINE = 0.018  // RMS above baseline to count as blowing
const CALIBRATION_DURATION = 1000        // ms to measure ambient noise
const MAX_ENERGY = 1.0                   // total energy to extinguish all candles

/**
 * Start energy-based blow detection.
 *
 * @param {Object} opts
 * @param {number}   opts.candleCount        - Number of candles
 * @param {Function} opts.onCandleOut(index) - Called when candle at index should extinguish
 * @param {Function} opts.onVolume(v)        - Called each frame with normalised volume 0–1
 * @param {Function} opts.onCalibrationDone  - Called when baseline calibration finishes
 * @param {Function} opts.onError(err)       - Called if mic access fails
 * @param {Function} opts.onEnergy(e)        - Called each frame with current blowEnergy 0–MAX
 */
export async function startBlowDetection({
  candleCount = 5,
  onCandleOut,
  onVolume,
  onCalibrationDone,
  onError,
  onEnergy,
}) {
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

    // ── Build remaining candles array ──
    let remainingCandles = Array.from({length: candleCount}, (_, i) => i)
    // Randomize order so candles go out unpredictably
    remainingCandles.sort(() => Math.random() - 0.5)

    let baseline = 0
    let calibrating = true
    let calibrationSamples = []
    let calibrationStart = performance.now()
    let lastFrameTime = null
    let lastExtinguishTime = 0
    let visualEnergy = 0

    function getRMS() {
      analyser.getByteTimeDomainData(dataArray)
      let sum = 0
      for (let i = 0; i < bufferLength; i++) {
        const v = (dataArray[i] - 128) / 128
        sum += v * v
      }
      return Math.sqrt(sum / bufferLength)
    }

    function analyse(now) {
      if (!analyser) return

      const rms = getRMS()

      // ── Calibration phase ──
      if (calibrating) {
        calibrationSamples.push(rms)
        if (onVolume) onVolume(0)
        if (now - calibrationStart >= CALIBRATION_DURATION) {
          baseline = calibrationSamples.reduce((a, b) => a + b, 0) / calibrationSamples.length
          calibrating = false
          lastFrameTime = now
          if (onCalibrationDone) onCalibrationDone()
        }
        animationId = requestAnimationFrame(analyse)
        return
      }

      // ── Detection phase ──
      const dt = lastFrameTime ? (now - lastFrameTime) / 1000 : 0.016
      lastFrameTime = now

      const excessVolume = rms - baseline
      if (onVolume) onVolume(Math.min(Math.max(excessVolume, 0) / 0.12, 1))

      if (excessVolume > 0.02) {
        let candlesToExtinguish = 0
        let cooldown = 400

        if (excessVolume > 0.12) {
          // قوية جداً: كل الشموع المتبقية
          candlesToExtinguish = remainingCandles.length
          cooldown = 0
        } else if (excessVolume > 0.06) {
          // متوسطة: شمعتين إلى 3
          candlesToExtinguish = Math.min(Math.floor(Math.random() * 2) + 2, remainingCandles.length)
          cooldown = 200
        } else {
          // خفيفة: شمعة واحدة
          candlesToExtinguish = 1
          cooldown = 400
        }

        if (now - lastExtinguishTime > cooldown && candlesToExtinguish > 0) {
          for (let i = 0; i < candlesToExtinguish; i++) {
            if (remainingCandles.length > 0) {
              const idx = remainingCandles.pop()
              if (onCandleOut) onCandleOut(idx)
            }
          }
          lastExtinguishTime = now
        }
      }

      // Smooth visual energy for UI
      visualEnergy = Math.max(0, visualEnergy - dt * 1.5)
      if (excessVolume > 0.02) {
        visualEnergy += excessVolume * dt * 8
      }
      visualEnergy = Math.min(visualEnergy, 1)
      if (onEnergy) onEnergy(visualEnergy)

      if (remainingCandles.length === 0) {
        // All candles extinguished — stop
        stopBlowDetection()
        return
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
