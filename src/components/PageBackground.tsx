/**
 * PageBackground — full-site Iris Petal gradient with noise.
 *
 * Place as first child inside `<main className="relative">`.
 * The gradient stretches to match `<main>` height and scrolls with content.
 * Sections must drop their opaque bg-min-bg to let the gradient show through.
 */

export function PageBackground() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      {/* Gradient layer */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(180deg,
            #1B1035 0%,
            #2a1f55 6%,
            #4A3A8C 14%,
            #7B5AA9 20%,
            #B58AC9 26%,
            #E5C6E0 32%,
            #c0a0b8 40%,
            #604070 50%,
            #2a1a40 58%,
            #0f0a1a 66%,
            #0a0a0a 74%,
            #0a0a0a 100%
          )`,
        }}
      />

      {/* Noise overlay */}
      <svg
        aria-hidden="true"
        className="absolute inset-0 h-full w-full opacity-[0.08] mix-blend-overlay"
      >
        <filter id="page-noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#page-noise)" />
      </svg>
    </div>
  )
}
