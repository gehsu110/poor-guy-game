import { useEffect } from 'react'
let context
function audioContext() {
  const Audio = window.AudioContext || window.webkitAudioContext
  if (!Audio) return null
  context ??= new Audio()
  return context
}
function note(audio, frequency, start, duration, volume) {
  const oscillator = audio.createOscillator(), gain = audio.createGain()
  oscillator.type = 'sine'
  oscillator.frequency.value = frequency
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + .025)
  gain.gain.exponentialRampToValueAtTime(.0001, start + duration)
  oscillator.connect(gain); gain.connect(audio.destination)
  oscillator.start(start); oscillator.stop(start + duration + .04)
  oscillator.onended = () => { oscillator.disconnect(); gain.disconnect() }
}
export function playGameSound(kind, preferences = {}) {
  if (preferences.soundEnabled === false || document.hidden || context?.state !== 'running') return
  const audio = context
  const tones = kind === 'reward' ? [523.25,659.25,783.99] : [659.25,783.99]
  tones.forEach((frequency, index) => note(audio, frequency, audio.currentTime + index * .09, .26, .035))
}
export function useGameAudio(preferences) {
  const musicEnabled = !!preferences?.musicEnabled
  useEffect(() => {
    let interval, step = 0
    const melody = [261.63,0,329.63,392,0,329.63,293.66,0,261.63,0,392,440,0,392,329.63,0]
    const play = () => {
      if (document.hidden || !musicEnabled || context?.state !== 'running') return
      const frequency = melody[step++ % melody.length]
      if (frequency) note(context, frequency, context.currentTime, 1.1, .015)
    }
    const unlock = () => {
      if (preferences?.soundEnabled === false && !musicEnabled) return
      const audio = audioContext()
      audio?.resume().catch(() => {})
    }
    document.addEventListener('pointerdown', unlock)
    document.addEventListener('keydown', unlock)
    if (musicEnabled) interval = setInterval(play, 1400)
    return () => {
      clearInterval(interval)
      document.removeEventListener('pointerdown', unlock)
      document.removeEventListener('keydown', unlock)
    }
  }, [musicEnabled, preferences?.soundEnabled])
}
