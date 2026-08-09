import { useState } from 'react'
import type { CmsData, LifePost } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { CalendarDaysIcon } from 'lucide-animated'

function LifePostCard({ post }: { post: LifePost }) {
  const [expanded, setExpanded] = useState(false)
  const hasAlbum = post.albumPhotoUrls.length > 0

  return (
    <div data-stagger-card className="h-full">
      <Card className="flex flex-col overflow-hidden p-0">
        <img
          src={post.coverPhotoUrl}
          alt={post.title}
          className="h-52 w-full object-cover"
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
            <div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded(!expanded)}
                aria-expanded={expanded}
                className="self-start"
              >
                {expanded ? 'Свернуть альбом' : 'Показать альбом'} ({post.albumPhotoUrls.length})
              </Button>
              {expanded && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
                  {post.albumPhotoUrls.map((url, i) => (
                    <img
                      key={i}
                      src={url}
                      alt={`Фото из альбома «${post.title}»`}
                      className="h-20 w-20 flex-shrink-0 rounded-sm object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

export function LifeSection({ cms }: { cms: CmsData }) {
  return (
    <Section id="life">
      <SectionHeading id="life" icon={CalendarDaysIcon}>Жизнь коллектива</SectionHeading>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cms.lifePosts.map((post) => (
          <LifePostCard key={post.id} post={post} />
        ))}
      </div>
    </Section>
  )
}