/**
 * SectionDivider — thin gradient line that separates major section groups.
 *
 * Uses the accent color fading from center to transparent on both sides.
 * Purely decorative; hidden from screen readers.
 */
export function SectionDivider() {
  return (
    <div className="flex justify-center px-8" aria-hidden="true">
      <div
        className="h-px w-full max-w-2xl"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, var(--min-accent) 50%, transparent 100%)',
          opacity: 0.2,
        }}
      />
    </div>
  )
}
