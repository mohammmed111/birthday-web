import React, { useEffect, useRef, useState } from 'react'

/**
 * Hidden YouTube IFrame Player — plays audio-only from a YouTube video.
 * Visually hidden (opacity:0, pointer-events:none) so only sound plays.
 *
 * Uses YouTube IFrame Player API loaded dynamically.
 */
export default function YouTubePlayer({ videoId, autoPlay = false, loop = true }) {
  const containerRef = useRef(null)
  const playerRef = useRef(null)
  const [apiReady, setApiReady] = useState(!!window.YT?.Player)

  // Load YT IFrame API script if not already loaded
  useEffect(() => {
    if (window.YT?.Player) {
      setApiReady(true)
      return
    }

    // Set up the global callback
    const prevCallback = window.onYouTubeIframeAPIReady
    window.onYouTubeIframeAPIReady = () => {
      setApiReady(true)
      if (prevCallback) prevCallback()
    }

    // Only add script if not already present
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      document.head.appendChild(tag)
    }
  }, [])

  // Create player when API is ready
  useEffect(() => {
    if (!apiReady || !videoId || !containerRef.current) return

    // Destroy previous player
    if (playerRef.current) {
      try { playerRef.current.destroy() } catch {}
    }

    playerRef.current = new window.YT.Player(containerRef.current, {
      videoId,
      width: 1,
      height: 1,
      playerVars: {
        autoplay: autoPlay ? 1 : 0,
        controls: 0,
        disablekb: 1,
        fs: 0,
        modestbranding: 1,
        playsinline: 1,
        rel: 0,
        loop: loop ? 1 : 0,
        playlist: loop ? videoId : undefined, // needed for loop to work
      },
      events: {
        onReady: (event) => {
          event.target.setVolume(70)
          if (autoPlay) {
            event.target.playVideo()
          }
        },
        onStateChange: (event) => {
          // If loop and video ended, replay
          if (loop && event.data === window.YT.PlayerState.ENDED) {
            event.target.playVideo()
          }
        },
      },
    })

    return () => {
      if (playerRef.current) {
        try { playerRef.current.destroy() } catch {}
        playerRef.current = null
      }
    }
  }, [apiReady, videoId, autoPlay, loop])

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        opacity: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
      }}
    >
      <div ref={containerRef} />
    </div>
  )
}
