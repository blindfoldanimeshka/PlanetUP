import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion'
import * as Dialog from '@radix-ui/react-dialog'
import { svg, animate } from 'animejs'
import { siteContent } from '@/data/content'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { Starfield } from '@/components/Starfield'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui/Button'
import { BookingForm } from '@/components/BookingForm'

/* ------------------------------------------------------------------ */
/*  Minimal scroll indicator — thin line                               */
/* ------------------------------------------------------------------ */

function ScrollIndicator() {
  return (
    <div
      className="absolute bottom-8 left-1/2 -translate-x-1/2"
      aria-hidden="true"
    >
      <div className="h-12 w-px bg-min-border" />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Hero — cosmic hyper-minimalism                                     */
/* ------------------------------------------------------------------ */

export function Hero() {
  const { title } = siteContent.settings.hero
  const reduced = useReducedMotion()
  const [showForm, setShowForm] = useState(false)

  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 400], [0, -30])

  useEffect(() => {
    if (reduced) return
    const [drawable] = svg.createDrawable('.hero-underline')
    animate(drawable, {
      draw: ['0 0', '1 1'],
      duration: 1500,
      ease: 'inOutQuad',
    })
  }, [reduced])

  const handleCloseForm = () => setShowForm(false)

  return (
    <section
      id="hero"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4"
      aria-label="Главный экран — студия акробатики Планета UP"
    >
      <Starfield />

      <motion.div
        className="relative z-10 mx-auto max-w-4xl text-center"
        style={reduced ? undefined : { y: heroY }}
      >
        {/* Logo mark */}
        <motion.div
          className="mb-8 md:mb-10"
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={reduced ? undefined : { duration: 0.6, ease: 'easeOut' }}
        >
          <Logo src="/media/logo/logo-white.png" />
        </motion.div>

        {/* Eyebrow */}
        <motion.p
          className="mb-6 text-sm font-medium uppercase tracking-[0.2em] text-min-muted"
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={reduced ? undefined : { duration: 0.6, delay: 0.15, ease: 'easeOut' }}
        >
          Студия акробатики
        </motion.p>

        {/* Massive headline */}
        <motion.h1
          className="mb-6 font-display leading-[0.95] tracking-tight text-min-text"
          style={{
            fontSize: 'clamp(3rem, 10vw, 8rem)',
            fontWeight: 900,
            letterSpacing: '-0.05em',
          }}
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={reduced ? undefined : { duration: 0.6, delay: 0.3, ease: 'easeOut' }}
        >
          {title}
        </motion.h1>

        {/* SVG decorative underline — anime.js draw animation */}
        <svg
          width="60"
          height="4"
          viewBox="0 0 60 4"
          className="mx-auto mb-8"
          aria-hidden="true"
        >
          <line
            x1="0"
            y1="2"
            x2="60"
            y2="2"
            className="hero-underline"
            stroke="var(--min-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="60 60"
            strokeDashoffset="60"
          />
        </svg>

        {/* Subtitle */}
        <motion.p
          className="mx-auto mb-10 max-w-md text-lg leading-relaxed text-min-muted"
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={reduced ? undefined : { duration: 0.6, delay: 0.45, ease: 'easeOut' }}
        >
          Занятия для взрослых и детей в Долгопрудном. Пробное занятие — бесплатно.
        </motion.p>

        {/* Booking CTA — opens modal dialog with booking form */}
        <motion.div
          className="mx-auto max-w-2xl"
          initial={reduced ? undefined : { opacity: 0, y: 20 }}
          animate={reduced ? undefined : { opacity: 1, y: 0 }}
          transition={reduced ? undefined : { duration: 0.6, delay: 0.6, ease: 'easeOut' }}
        >
          <Dialog.Root open={showForm} onOpenChange={setShowForm}>
            <Dialog.Trigger asChild>
              <Button
                variant="primary"
                size="lg"
                className="rounded-full border-min-accent bg-transparent px-8 py-4 text-base text-min-accent hover:bg-min-accent hover:text-min-bg hover:shadow-[0_0_30px_var(--min-accent-glow)]"
              >
                Записаться на бесплатную тренировку
              </Button>
            </Dialog.Trigger>
            <Dialog.Portal forceMount>
              <AnimatePresence>
                {showForm && (
                  <>
                    <Dialog.Overlay asChild>
                      <motion.div
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                        initial={reduced ? undefined : { opacity: 0 }}
                        animate={reduced ? undefined : { opacity: 1 }}
                        exit={reduced ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                      />
                    </Dialog.Overlay>
              <Dialog.Content
                asChild
                onOpenAutoFocus={(event) => {
                  // Focus the first form field instead of the close button.
                  const root = event.currentTarget as HTMLElement
                  const firstInput = root.querySelector(
                    'input:not([type="hidden"]):not([tabindex="-1"]):not([aria-hidden="true"]), select, textarea'
                  )
                  if (firstInput instanceof HTMLElement) {
                    event.preventDefault()
                    firstInput.focus()
                  }
                }}
              >
                <motion.div
                  className="fixed left-1/2 top-1/2 z-[60] w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2"
                  initial={reduced ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
                  animate={reduced ? undefined : { opacity: 1, scale: 1, y: 0 }}
                  exit={reduced ? undefined : { opacity: 0, scale: 0.95, y: 10 }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  <div className="glass-surface rounded-2xl">
                    <div className="p-6 text-left md:p-8">
                      <div className="mb-6 flex items-start justify-between gap-4">
                        <Dialog.Title asChild>
                          <h2 className="font-display text-xl font-bold text-min-text md:text-2xl">
                            Запись на пробное занятие
                          </h2>
                        </Dialog.Title>
                        <Dialog.Close asChild>
                          <button
                            type="button"
                            className="text-2xl leading-none text-min-muted transition-colors hover:text-min-text"
                            aria-label="Закрыть форму"
                          >
                            ×
                          </button>
                        </Dialog.Close>
                      </div>
                      <Dialog.Description asChild>
                        <p className="sr-only">
                          Форма записи на бесплатное пробное занятие в студии акробатики «Планета UP»
                        </p>
                      </Dialog.Description>
                      <BookingForm onClose={handleCloseForm} />
                      <div className="mt-4 flex justify-end gap-3">
                        <Dialog.Close asChild>
                          <button
                            type="button"
                            className="rounded-xl px-5 py-2.5 text-sm font-medium text-min-muted transition-colors hover:text-min-text"
                          >
                            Отмена
                          </button>
                        </Dialog.Close>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Dialog.Content>
                  </>
                )}
              </AnimatePresence>
            </Dialog.Portal>
          </Dialog.Root>
          <p className="mt-4 text-xs text-min-muted">
            Пробное занятие — бесплатно. Без обязательств.
          </p>
        </motion.div>
      </motion.div>

      {/* Scroll indicator */}
      <ScrollIndicator />
    </section>
  )
}
