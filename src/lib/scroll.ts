export function scrollToHero(): void {
  document.querySelector('#hero')?.scrollIntoView({ behavior: 'smooth' })
}
