import { useEffect, useRef, useState } from 'react'
import type { CmsData } from '@/types/cms'
import { scrollToHero } from '@/lib/scroll'
import type { SectionVariant } from '@/components/ui/Section'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { MapPinIcon } from 'lucide-animated'

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
          src="https://yandex.ru/map-widget/v1/?ll=37.520518%2C55.963214&z=17&mode=search&text=%D0%9D%D0%B0%D0%B1%D0%B5%D1%80%D0%B5%D0%B6%D0%BD%D0%B0%D1%8F%20%D1%83%D0%BB%D0%B8%D1%86%D0%B0%2025%2C%20%D0%94%D0%BE%D0%BB%D0%B3%D0%BE%D0%BF%D1%80%D1%83%D0%B4%D0%BD%D1%8B%D0%B9"
          className="absolute inset-0 h-full w-full border-0"
          title="Студия Планета UP на карте Яндекс (Набережная улица, 25, Долгопрудный)"
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

export function ContactsSection({ cms, variant }: { cms: CmsData; variant?: SectionVariant }) {
  const { settings } = cms

  return (
    <Section id="contacts" variant={variant}>
      <SectionHeading id="contacts" icon={MapPinIcon}>Контакты</SectionHeading>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Info */}
        <div className="flex flex-col gap-6 h-full" data-stagger-card>
          <Card className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold text-min-text">Как нас найти</h3>
              <address className="not-italic text-sm leading-relaxed text-min-muted">
                {settings.address && (
                  <p className="font-medium">{settings.address}</p>
                )}
                {settings.phone && (
                  <p className="mt-2">
                    <a
                      href={`tel:${settings.phone.replace(/\D/g, '')}`}
                      className="text-min-accent transition-colors hover:text-min-text"
                    >
                      {settings.phone}
                    </a>
                  </p>
                )}
                {settings.email && (
                  <p>
                    <a
                      href={`mailto:${settings.email}`}
                      className="text-min-accent transition-colors hover:text-min-text"
                    >
                      {settings.email}
                    </a>
                  </p>
                )}
              </address>
            <div className="flex gap-3 pt-2">
              {Object.entries(settings.social)
                .filter(([, url]) => url && url.trim() !== '')
                .map(([key, url]) => (
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
            <Button
              variant="primary"
              size="md"
              className="mt-4 self-stretch"
              onClick={scrollToHero}
            >
              Записаться на пробное занятие
            </Button>
          </Card>
        </div>

        {/* Map */}
        <div data-stagger-card>
          <LazyYandexMap />
        </div>
      </div>
    </Section>
  )
}