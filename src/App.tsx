import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import type { CmsData } from '@/types/cms'
import { getCmsData } from '@/api/cms'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ScrollProgress } from '@/components/scrollytelling/ScrollProgress'
import { StickyTransitionSection } from '@/components/scrollytelling/StickyTransitionSection'
import { PageBackground } from '@/components/PageBackground'
import {
  AdultsSection,
  KidsSection,
  SubscriptionsSection,
  TeamSection,
  GallerySection,
  LifeSection,
  ReviewsSection,
  FaqSection,
  ContactsSection,
} from '@/sections'

function MainSections({ cms }: { cms: CmsData | null }) {
  if (!cms) return null
  return (
    <>
      <StickyTransitionSection>
        <AdultsSection cms={cms} />
      </StickyTransitionSection>
      <StickyTransitionSection>
        <KidsSection cms={cms} />
      </StickyTransitionSection>
      <StickyTransitionSection>
        <SubscriptionsSection cms={cms} />
      </StickyTransitionSection>
      <StickyTransitionSection>
        <TeamSection cms={cms} />
      </StickyTransitionSection>
      <StickyTransitionSection>
        <GallerySection cms={cms} />
      </StickyTransitionSection>
      <StickyTransitionSection>
        <LifeSection cms={cms} />
      </StickyTransitionSection>
      <StickyTransitionSection>
        <ReviewsSection cms={cms} />
      </StickyTransitionSection>
      <StickyTransitionSection>
        <FaqSection cms={cms} />
      </StickyTransitionSection>
      <StickyTransitionSection>
        <ContactsSection cms={cms} />
      </StickyTransitionSection>
    </>
  )
}

export default function App() {
  const [cms, setCms] = useState<CmsData | null>(null)

  useEffect(() => {
    let mounted = true
    getCmsData().then((data) => {
      if (mounted) setCms(data)
    })
    return () => {
      mounted = false
    }
  }, [])

  const seo = cms?.settings.seo

  return (
    <>
      <Helmet>
        <title>{seo?.title ?? 'Планета UP — студия акробатики'}</title>
        <meta
          name="description"
          content={
            seo?.description ??
            'Студия акробатики в Москве: группы для взрослых и детей, воздушная акробатика, акро-гимнастика.'
          }
        />
        <link rel="canonical" href="https://planeta-up.ru/" />
      </Helmet>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-min-text focus:text-min-surface focus:px-4 focus:py-2"
      >
        Перейти к содержимому
      </a>
      <ScrollProgress />
      <Header />
      <main id="main-content" className="relative">
        <PageBackground />
        <ErrorBoundary>
          <StickyTransitionSection isHero>
            <Hero />
          </StickyTransitionSection>
          <MainSections cms={cms} />
        </ErrorBoundary>
      </main>
      {cms && <Footer settings={cms.settings} />}
    </>
  )
}
