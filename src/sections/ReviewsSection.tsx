import { motion } from 'framer-motion'
import type { CmsData } from '@/types/cms'
import { Section } from '@/components/ui/Section'
import { Card } from '@/components/ui/Card'

export function ReviewsSection({ cms }: { cms: CmsData }) {
  return (
    <Section id="reviews">
      <h2 className="mb-12 font-display text-center leading-tight tracking-tight text-min-text md:text-5xl" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, letterSpacing: '-0.03em' }}>
        Отзывы
      </h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {cms.testimonials.map((t, i) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
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
              <blockquote className="text-sm leading-relaxed text-min-muted italic">
                &ldquo;{t.text}&rdquo;
              </blockquote>
              <p className="text-sm font-semibold text-min-text">— {t.name}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </Section>
  )
}
