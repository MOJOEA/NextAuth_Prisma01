'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

export default function Profile() {
  const { data: session, status } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [track, setTrack] = useState(null)
  const [loading, setLoading] = useState(false)
  const [volume, setVolume] = useState(0.5)
  const [progress, setProgress] = useState(0)
  const audioRef = useRef(null)
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  const searchiTunes = async () => {
    if (!searchQuery.trim()) return
    setLoading(true)

    try {
      const res = await fetch(`/api/itunes?term=${encodeURIComponent(searchQuery)}`)
      const data = await res.json()

      if (data.results?.length > 0) {
        const item = data.results[0]
        setTrack({
          id: item.trackId,
          name: item.trackName,
          artist: item.artistName,
          previewUrl: item.previewUrl,
          artwork: item.artworkUrl100.replace('100x100', '300x300'),
        })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // 🎚️ sync progress
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const update = () => {
      setProgress((audio.currentTime / audio.duration) * 100 || 0)
    }

    audio.addEventListener('timeupdate', update)
    return () => audio.removeEventListener('timeupdate', update)
  }, [track])

  // 🔊 volume control
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  if (status === 'loading') return <div className="h-screen flex items-center justify-center text-white">Loading...</div>

  return (
    status === 'authenticated' &&
    session.user && (
      <div className="min-h-screen bg-black text-white p-8 flex flex-col items-center gap-6">

        {/* User */}
        <div className="w-full max-w-2xl flex justify-between items-center border-b border-gray-700 pb-3">
          <p className="text-lg">Welcome, {session.user.name}</p>
          <button onClick={() => signOut({ callbackUrl: '/' })} className="text-sm text-red-400">Logout</button>
        </div>

        {/* Search */}
        <div className="w-full max-w-2xl flex gap-2">
          <input
            className="flex-1 bg-gray-900 border border-gray-700 p-3 rounded"
            placeholder="Search music..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && searchiTunes()}
          />
          <button
            onClick={searchiTunes}
            disabled={loading}
            className="px-5 bg-white text-black rounded"
          >
            {loading ? '...' : 'Search'}
          </button>
        </div>

        {/* Player */}
        {track && (
          <div className="w-full max-w-2xl bg-gray-900 rounded-xl p-5 flex gap-5 items-center">

            {/* Cover */}
            <img src={track.artwork} className="w-32 h-32 rounded-lg object-cover" />

            {/* Info + Controls */}
            <div className="flex-1 flex flex-col gap-3">

              <div>
                <p className="text-xl font-semibold">{track.name}</p>
                <p className="text-gray-400">{track.artist}</p>
              </div>

              {/* Progress Bar */}
              <input
                type="range"
                value={progress}
                onChange={(e) => {
                  const audio = audioRef.current
                  const val = e.target.value
                  audio.currentTime = (val / 100) * audio.duration
                  setProgress(val)
                }}
                className="w-full"
              />

              {/* Controls */}
              <div className="flex items-center gap-4">

                <button
                  onClick={() => {
                    if (audioRef.current.paused) audioRef.current.play()
                    else audioRef.current.pause()
                  }}
                  className="px-4 py-2 bg-white text-black rounded"
                >
                  Play / Pause
                </button>

                {/* Volume */}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(e.target.value)}
                />
              </div>

              <audio ref={audioRef} src={track.previewUrl} autoPlay />
            </div>
          </div>
        )}
      </div>
    )
  )
}