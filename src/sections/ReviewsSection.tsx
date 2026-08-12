import type { CmsData } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'
import { SectionHeading } from '@/components/scrollytelling/SectionHeading'
import { MessageSquareIcon } from 'lucide-animated'

export function ReviewsSection({ cms }: { cms: CmsData }) {
  return (
    <Section id="reviews">
      <SectionHeading id="reviews" icon={MessageSquareIcon}>Отзывы</SectionHeading>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cms.testimonials.map((t) => (
          <div key={t.id} data-stagger-card className="h-full">
            <Card className="flex flex-col gap-4 bg-white/15 border-white/30 shadow-lg shadow-black/20">
              {t.photoUrl && (
                <img
                  src={t.photoUrl}
                  alt={t.name}
                  className="h-12 w-12 rounded-full object-cover"
                  loading="lazy"
                />
              )}
              <blockquote className="flex-1 text-sm leading-relaxed text-min-text/90 italic">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <p className="text-sm font-semibold text-min-text">— {t.name}</p>
            </Card>
          </div>
        ))}
      </div>
    </Section>
  )
}