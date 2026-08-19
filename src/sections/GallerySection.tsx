import { lazy, Suspense, useState, useCallback } from 'react'
import 'yet-another-react-lightbox/styles.css'

const Lightbox = lazy(() => import('yet-another-react-lightbox'))
import type { CmsData, GalleryCategory } from '@/types/cms'
import type { SectionVariant } from '@/components/ui/Section'
import { Section } from '@/components/ui/Section'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { SparklesIcon } from 'lucide-animated'

const CATEGORY_LABELS: Record<GalleryCategory | 'all', string> = {
  all: 'Все',
  adults: 'Взрослые',
  kids: 'Дети',
  competitions: 'Соревнования',
}

const FILTERS: (GalleryCategory | 'all')[] = ['all', 'kids', 'adults', 'competitions']

export function GallerySection({ cms, variant }: { cms: CmsData; variant?: SectionVariant }) {
  const [filter, setFilter] = useState<GalleryCategory | 'all'>('all')
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const filtered =
    filter === 'all'
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

  const handleFilterChange = useCallback(
    (cat: GalleryCategory | 'all') => {
      setFilter(cat)
      setLightboxIndex(null)
    },
    [setFilter]
  )

  if (cms.gallery.length === 0) return null

  return (
    <Section id="gallery" variant={variant}>
      <SectionHeading id="gallery" icon={SparklesIcon}>
        Галерея
      </SectionHeading>

      {/* Category filter */}
      <div
        className="mb-10 flex flex-wrap justify-center gap-2"
        role="group"
        aria-label="Фильтр галереи"
      >
        {FILTERS.map((cat) => (
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

      {/* Grid gallery — masonry columns keep full photos (no cropped bodies) */}
      <div className="columns-2 gap-3 md:columns-3 lg:columns-4 [column-fill:_balance]">
        {sorted.map((item, i) => (
          <button
            key={item.id}
            type="button"
            onClick={() => handleOpen(i)}
            className="group mb-3 block w-full break-inside-avoid overflow-hidden rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-min-accent"
            aria-label={`Открыть фото ${i + 1}: ${CATEGORY_LABELS[item.category] ?? item.category}`}
          >
            <img
              src={item.photoUrl}
              alt={`Фотография — ${CATEGORY_LABELS[item.category] ?? item.category}`}
              loading="lazy"
              className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
            />
          </button>
        ))}
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
            labels={{
              Close: 'Закрыть',
              Previous: 'Предыдущее фото',
              Next: 'Следующее фото',
            }}
          />
        </Suspense>
      )}
    </Section>
  )
}
