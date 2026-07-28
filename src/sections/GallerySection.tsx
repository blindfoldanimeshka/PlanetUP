import { lazy, Suspense, useState, useCallback, useRef } from 'react'
import { motion, useScroll, useTransform, type MotionValue } from 'framer-motion'
import 'yet-another-react-lightbox/styles.css'

const Lightbox = lazy(() => import('yet-another-react-lightbox'))
import type { CmsData, GalleryCategory } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const CATEGORY_LABELS: Record<GalleryCategory | 'all', string> = {
  all: 'Все',
  adults: 'Взрослые',
  kids: 'Дети',
  competitions: 'Соревнования',
}

const COL_OFFSETS = [0, -15, -45, -20]

function GalleryImage({
  item,
  index,
  scrollYProgress,
  handleOpen,
}: {
  item: CmsData['gallery'][number]
  index: number
  scrollYProgress: MotionValue<number>
  handleOpen: (index: number) => void
}) {
  const reduced = useReducedMotion()

  const colIndex = index % 4
  const colOffset = COL_OFFSETS[colIndex]

  const itemStart = 0.05 + index * 0.02
  const itemEnd = Math.min(itemStart + 0.12, 1)

  const y = useTransform(scrollYProgress, [0, 1], [0, colOffset])
  const scale = useTransform(scrollYProgress, [itemStart, itemEnd], [0.9, 1])
  const opacity = useTransform(
    scrollYProgress,
    [itemStart, itemStart + 0.05],
    [0, 1],
  )

  if (reduced) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, delay: index * 0.03 }}
        className="mb-3 break-inside-avoid cursor-pointer overflow-hidden rounded-lg"
        onClick={() => handleOpen(index)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleOpen(index)
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
    )
  }

  return (
    <motion.div
      style={{ y, scale, opacity }}
      className="mb-3 break-inside-avoid cursor-pointer overflow-hidden rounded-lg"
      onClick={() => handleOpen(index)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleOpen(index)
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
  )
}

export function GallerySection({ cms }: { cms: CmsData }) {
  const [filter, setFilter] = useState<GalleryCategory | 'all'>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const sectionRef = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()

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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const titleOpacity = useTransform(scrollYProgress, [0, 0.15], [0, 1])
  const titleY = useTransform(scrollYProgress, [0, 0.15], [30, 0])

  return (
    <div ref={sectionRef}>
      <Section id="gallery" variant="light">
      <motion.div
        style={reduced ? undefined : { opacity: titleOpacity, y: titleY }}
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
            <GalleryImage
              key={item.id}
              item={item}
              index={i}
              scrollYProgress={scrollYProgress}
              handleOpen={handleOpen}
            />
          ))}
        </div>
      </motion.div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Suspense
          fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-cosmic-accent-2 border-t-transparent" />
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
    </div>
  )
}
