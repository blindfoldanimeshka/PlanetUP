import { motion } from 'framer-motion'
import type { CmsData } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'

export function ReviewsSection({ cms }: { cms: CmsData }) {
  return (
    <Section id="reviews" variant="light">
      <h2 className="mb-8 text-center text-3xl font-bold tracking-tight text-light-text md:text-4xl">
        Отзывы
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cms.testimonials.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.4, delay: i * 0.08 }}
          >
            <Card className="flex flex-col gap-4">
              {t.photoUrl && (
                <img
                  src={t.photoUrl}
                  alt={t.name}
                  className="h-12 w-12 rounded-full object-cover"
                  loading="lazy"
                />
              )}
              <blockquote className="text-sm leading-relaxed text-light-muted italic">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <p className="text-sm font-semibold text-light-text">— {t.name}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
