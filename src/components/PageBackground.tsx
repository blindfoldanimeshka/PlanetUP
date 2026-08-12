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
            #2a1f55 12%,
            #3d3066 24%,
            #4a3a7a 36%,
            #3d3066 48%,
            #2a1f55 60%,
            #1B1035 72%,
            #1B1035 84%,
            #1B1035 100%
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
