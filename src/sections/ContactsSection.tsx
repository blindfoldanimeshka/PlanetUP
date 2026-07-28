import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { CmsData } from '@/types/cms'
import { scrollToHero } from '@/lib/scroll'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

/* ------------------------------------------------------------------ */
/*  Lazy Yandex Maps iframe — loads only when scrolled into view        */
/* ------------------------------------------------------------------ */

function LazyYandexMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setLoaded(true)
          observer.disconnect()
        }
      },
      { rootMargin: '200px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={containerRef} className="relative h-72 w-full overflow-hidden rounded-sm">
      {loaded ? (
        <iframe
          src="https://yandex.ru/map-widget/v1/?ll=37.6173%2C55.7558&z=15&l=map"
          className="absolute inset-0 h-full w-full border-0"
          title="Студия Планета UP на карте Яндекс"
          loading="lazy"
          allowFullScreen
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-min-surface text-min-muted">
          <p className="text-sm">Загрузка карты…</p>
        </div>
      )}
    </div>
  )
}

const SOCIAL_LABELS: Record<string, string> = {
  vk: 'VK',
  telegram: 'Telegram',
  whatsapp: 'WhatsApp',
}

export function ContactsSection({ cms }: { cms: CmsData }) {
  const { settings } = cms

  return (
    <Section id="contacts">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="mb-12 font-display text-center leading-tight tracking-tight text-min-text md:text-5xl" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
          Контакты
        </h2>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Info */}
          <div className="flex flex-col gap-6">
            <Card className="flex flex-col gap-4">
              <h3 className="text-lg font-semibold text-min-text">Как нас найти</h3>
              <address className="not-italic text-sm leading-relaxed text-min-muted">
                <p className="font-medium">{settings.address}</p>
                <p className="mt-2">
                  <a
                    href={`tel:${settings.phone.replace(/\D/g, '')}`}
                    className="text-min-accent transition-colors hover:text-min-text"
                  >
                    {settings.phone}
                  </a>
                </p>
                <p>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-min-accent transition-colors hover:text-min-text"
                  >
                    {settings.email}
                  </a>
                </p>
              </address>

              {/* Social links */}
              <div className="flex gap-3 pt-2">
                {Object.entries(settings.social).map(([key, url]) => (
                  <a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-sm border border-min-border px-3 py-1.5 text-sm
                      font-medium text-min-muted transition-colors
                      hover:border-min-accent hover:text-min-accent
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-min-accent"
                  >
                    {SOCIAL_LABELS[key] || key}
                  </a>
                ))}
              </div>

              {/* CTA to booking form */}
              <Button
                variant="primary"
                size="md"
                className="mt-2 self-start"
                onClick={scrollToHero}
              >
                Записаться на пробное занятие
              </Button>
            </Card>
          </div>

          {/* Map */}
          <LazyYandexMap />
        </div>
      </motion.div>
    </Section>
  )
}
