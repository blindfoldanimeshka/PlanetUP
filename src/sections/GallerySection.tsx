import { lazy, Suspense, useState, useCallback } from 'react'
import { AnimatePresence } from 'framer-motion'
import 'yet-another-react-lightbox/styles.css'

const Lightbox = lazy(() => import('yet-another-react-lightbox'))
import type { CmsData, GalleryCategory } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { SparklesIcon } from 'lucide-animated'
import { AccordionGallery } from '@/components/gallery/AccordionGallery'

const CATEGORY_LABELS: Record<GalleryCategory | 'all', string> = {
  all: 'Все',
  adults: 'Взрослые',
  kids: 'Дети',
  competitions: 'Соревнования',
}

const ACCORDION_ITEMS = 6

export function GallerySection({ cms }: { cms: CmsData }) {
  const [filter, setFilter] = useState<GalleryCategory | 'all'>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered =
    filter === 'all'
      ? cms.gallery
      : cms.gallery.filter((item) => item.category === filter)

  const sorted = [...filtered].sort((a, b) => a.sortOrder - b.sortOrder)
  const slides = sorted.map((item) => ({ src: item.photoUrl }))

  // First N images for the accordion showcase
  const accordionItems = sorted.slice(0, ACCORDION_ITEMS).map((item, i) => ({
    image: item.photoUrl,
    label: CATEGORY_LABELS[item.category],
    index: i,
  }))

  const handleOpen = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const handleClose = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  const handleFilterChange = useCallback(
    (cat: GalleryCategory | 'all') => {
      setFilter(cat)
      setLightboxIndex(null)
    },
    [setFilter]
  )

  return (
    <Section id="gallery">
      <SectionHeading id="gallery" icon={SparklesIcon}>
        Галерея
      </SectionHeading>

      {/* Category filter */}
      <div
        className="mb-10 flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Фильтр галереи"
      >
        {(['all', 'adults', 'competitions'] as const).map((cat) => (
          <Button
            key={cat}
            variant={filter === cat ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => handleFilterChange(cat)}
            aria-pressed={filter === cat}
          >
            {CATEGORY_LABELS[cat]}
          </Button>
        ))}
      </div>

      {/* Interactive accordion gallery */}
      <AnimatePresence mode="wait">
        <AccordionGallery
          key={filter}
          items={accordionItems}
          defaultIndex={0}
          expandRatio={0.55}
          trigger="hover"
          accentColor="#A855F7"
          overlayColor="rgba(10, 0, 16, 0.4)"
          textColor="#ffffff"
          grayscale
          showLabels
          duration={0.6}
          ease="power3.out"
          parallax={0.5}
          tilt={6}
          stagger={0.06}
          height={460}
          gap={10}
          radius={16}
          orientation="horizontal"
          onSelect={handleOpen}
        />
      </AnimatePresence>

      {/* View all button if more images exist */}
      {sorted.length > ACCORDION_ITEMS && (
        <div className="mt-6 flex justify-center">
          <Button
            variant="secondary"
            size="md"
            onClick={() => handleOpen(ACCORDION_ITEMS)}
          >
            Смотреть все ({sorted.length})
          </Button>
        </div>
      )}

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
