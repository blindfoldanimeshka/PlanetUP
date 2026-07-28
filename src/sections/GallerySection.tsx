import { lazy, Suspense, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import 'yet-another-react-lightbox/styles.css'

const Lightbox = lazy(() => import('yet-another-react-lightbox'))
import type { CmsData, GalleryCategory } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'

const CATEGORY_LABELS: Record<GalleryCategory | 'all', string> = {
  all: 'Все',
  adults: 'Взрослые',
  kids: 'Дети',
  competitions: 'Соревнования',
}

export function GallerySection({ cms }: { cms: CmsData }) {
  const [filter, setFilter] = useState<GalleryCategory | 'all'>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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

  return (
    <Section id="gallery" variant="light">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-6 text-center text-3xl font-bold tracking-tight text-light-text md:text-4xl">
          Галерея
        </h2>

        {/* Category filter */}
        <div className="mb-8 flex flex-wrap justify-center gap-2" role="group" aria-label="Фильтр галереи">
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
        <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
          {sorted.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.03 }}
              className="mb-3 break-inside-avoid cursor-pointer overflow-hidden rounded-lg"
              onClick={() => handleOpen(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleOpen(i)
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
        </div>
      </motion.div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Suspense fallback={null}>
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
