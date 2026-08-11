/**
 * Starfield — pure-CSS cosmic background layers.
 *
 * Decorative only. Lives inside a relative container with overflow-hidden.
 */
export function Starfield() {
  return (
    <>
      <div aria-hidden="true" className="starfield-bg" />
      <div aria-hidden="true" className="hero-nebula" />
      <div aria-hidden="true" className="starfield-stars starfield-stars--far" />
      <div aria-hidden="true" className="starfield-stars starfield-stars--near" />
      <div aria-hidden="true" className="starfield-twinkle" />
    </>
  )
}
