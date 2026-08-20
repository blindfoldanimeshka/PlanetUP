import { lazy, Suspense, useState, useCallback } from 'react'
import 'yet-another-react-lightbox/styles.css'

const Lightbox = lazy(() => import('yet-another-react-lightbox'))
import type { CmsData, LifePost } from '@/types/cms'
import type { SectionVariant } from '@/components/ui/Section'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { CalendarDaysIcon } from 'lucide-animated'

function LifePostCard({ post }: { post: LifePost }) {
  const [expanded, setExpanded] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const hasAlbum = post.albumPhotoUrls.length > 0
  const slides = post.albumPhotoUrls.map((url) => ({ src: url }))

  const toggle = useCallback(() => setExpanded((v) => !v), [])

  const openLightbox = useCallback((index: number) => {
    setLightboxIndex(index)
  }, [])

  const closeLightbox = useCallback(() => {
    setLightboxIndex(null)
  }, [])

  return (
    <div data-stagger-card className="h-full">
      <Card className="flex flex-col overflow-hidden p-0">
        {/* Clickable header toggles the album */}
        <div
          role="button"
          tabIndex={0}
          aria-expanded={expanded}
          onClick={toggle}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              toggle()
            }
          }}
          className="group block w-full cursor-pointer text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-min-accent"
        >
          <img
            src={post.coverPhotoUrl}
            alt={post.title}
            className="h-52 w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="flex flex-1 flex-col gap-3 p-5">
            <div>
              <h3 className="text-lg font-semibold text-min-text">{post.title}</h3>
              <time className="text-xs text-min-muted" dateTime={post.date}>
                {new Date(post.date).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </div>
            <p className="text-sm leading-relaxed text-min-muted">{post.text}</p>
            {hasAlbum && (
              <span className="mt-1 inline-flex items-center gap-1 text-sm text-min-accent">
                {expanded ? 'Свернуть' : 'Подробнее'}
                <span aria-hidden="true">{expanded ? '↑' : '↓'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Album thumbnails (open lightbox on click) */}
        {expanded && hasAlbum && (
          <div className="px-5 pb-5">
            <p className="mb-3 text-xs uppercase tracking-widest text-min-muted">
              Фотоотчёт
            </p>
            <div className="grid grid-cols-3 gap-2">
              {post.albumPhotoUrls.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    openLightbox(i)
                  }}
                  className="overflow-hidden rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-min-accent"
                  aria-label={`Открыть фото ${i + 1}: ${post.title}`}
                >
                  <img
                    src={url}
                    alt={`Фото из альбома «${post.title}»`}
                    className="h-24 w-full object-cover transition-transform duration-500 hover:scale-[1.05]"
                    loading="lazy"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

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
            close={closeLightbox}
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
    </div>
  )
}

export function LifeSection({ cms, variant }: { cms: CmsData; variant?: SectionVariant }) {
  if (cms.lifePosts.length === 0) return null
  return (
    <Section id="life" variant={variant}>
      <SectionHeading id="life" icon={CalendarDaysIcon}>
        Жизнь коллектива
      </SectionHeading>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cms.lifePosts.map((post) => (
          <LifePostCard key={post.id} post={post} />
        ))}
      </div>
    </Section>
  )
}
