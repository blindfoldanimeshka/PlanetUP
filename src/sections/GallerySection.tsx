import { lazy, Suspense, useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { animate, stagger } from 'animejs'
import 'yet-another-react-lightbox/styles.css'

const Lightbox = lazy(() => import('yet-another-react-lightbox'))
import type { CmsData, GalleryCategory } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { SparklesIcon } from 'lucide-animated'

const CATEGORY_LABELS: Record<GalleryCategory | 'all', string> = {
  all: 'Все',
  adults: 'Взрослые',
  kids: 'Дети',
  competitions: 'Соревнования',
}

export function GallerySection({ cms }: { cms: CmsData }) {
  const [filter, setFilter] = useState<GalleryCategory | 'all'>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const reduced = useReducedMotion()
  const gridRef = useRef<HTMLDivElement>(null)

  const filtered = filter === 'all'
    ? cms.gallery
    : cms.gallery.filter((item) => item.category === filter)

  const sorted = [...filtered].sort((a, b) => a.sortOrder - b.sortOrder)
  const slides = sorted.map((item) => ({ src: item.photoUrl }))

  const handleOpen = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const handleClose = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  useEffect(() => {
    if (reduced) return
    const grid = gridRef.current
    if (!grid) return
    const items = grid.querySelectorAll('.gallery-item')
    if (!items.length) return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return

        animate('.gallery-item', {
          opacity: [0, 1],
          translateY: [20, 0],
          delay: stagger(80, { start: 100 }),
          duration: 600,
          ease: 'outExpo',
        })
        observer.disconnect()
      },
      { threshold: 0.1 },
    )
    observer.observe(grid)
    return () => observer.disconnect()
  }, [filter, reduced])

  return (
    <Section id="gallery">
      <SectionHeading id="gallery" icon={SparklesIcon}>Галерея</SectionHeading>

      {/* Category filter */}
      <div className="mb-10 flex flex-wrap justify-center gap-2" role="group" aria-label="Фильтр галереи">
        {(['all', 'adults', 'kids', 'competitions'] as const).map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setFilter(cat)}
            aria-pressed={filter === cat}
          >
            {CATEGORY_LABELS[cat]}
          </Button>
        ))}
      </div>

      {/* Image grid */}
      <div ref={gridRef} className="columns-2 gap-3 md:columns-3 lg:columns-4">
        <AnimatePresence mode="popLayout">
          {sorted.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              data-stagger-card
              className="gallery-item mb-3 break-inside-avoid cursor-pointer overflow-hidden rounded-sm"
              onClick={() => handleOpen(sorted.indexOf(item))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleOpen(sorted.indexOf(item))
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Открыть фото из категории ${CATEGORY_LABELS[item.category]}`}
            >
              <img
                src={item.photoUrl}
                alt={`Фото из категории ${CATEGORY_LABELS[item.category]}`}
                className="w-full transition-transform duration-300 hover:scale-105"
                loading="lazy"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-min-bg/90">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-min-accent border-t-transparent" />
            </div>
          }
        >
          <Lightbox
            open={lightboxIndex !== null}
            close={handleClose}
            index={lightboxIndex}
            slides={slides}
          />
        </Suspense>
      )}
    </Section>
  )
}