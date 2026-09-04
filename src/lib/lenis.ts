import type Lenis from 'lenis'

let instance: Lenis | null = null

export function setLenis(lenis: Lenis | null) {
  instance = lenis
}

export function getLenis(): Lenis | null {
  return instance
}

export function stopLenis() {
  instance?.stop()
}

export function startLenis() {
  instance?.start()
}
