import { useState } from 'react'
import { motion } from 'framer-motion'
import type { CmsData, LifePost } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

function LifePostCard({ post, index }: { post: LifePost; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const hasAlbum = post.albumPhotoUrls.length > 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Card className="flex flex-col overflow-hidden p-0">
        <img
          src={post.coverPhotoUrl}
          alt={post.title}
          className="h-52 w-full object-cover"
          loading="lazy"
        />
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div>
            <h3 className="text-lg font-semibold text-light-text">{post.title}</h3>
            <time className="text-xs text-light-muted" dateTime={post.date}>
              {new Date(post.date).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </time>
          </div>
          <p className="text-sm leading-relaxed text-light-muted">{post.text}</p>

          {/* Expandable album */}
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
                      className="h-20 w-20 flex-shrink-0 rounded-md object-cover"
                      loading="lazy"
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export function LifeSection({ cms }: { cms: CmsData }) {
  return (
    <Section id="life" variant="light">
      <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-light-text md:text-4xl">
        Жизнь коллектива
      </h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {cms.lifePosts.map((post, i) => (
          <LifePostCard key={post.id} post={post} index={i} />
        ))}
      </div>
    </Section>
  )
}
