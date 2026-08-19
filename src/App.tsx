import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import type { CmsData } from '@/types/cms'
import { getCmsData } from '@/api/cms'
import { onContentChanged } from '@/lib/cmsSync'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { ScrollProgress } from '@/components/scrollytelling/ScrollProgress'
import { PageBackground } from '@/components/PageBackground'
import {
  AdultsSection,
  KidsSection,
  SubscriptionsSection,
  FeaturesSection,
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
      <FeaturesSection />
      <AdultsSection cms={cms} />
      <KidsSection cms={cms} />
      <SubscriptionsSection cms={cms} />
      <TeamSection cms={cms} />
      <GallerySection cms={cms} />
      <LifeSection cms={cms} />
      <ReviewsSection cms={cms} />
      <FaqSection cms={cms} />
      <ContactsSection cms={cms} />
    </>
  )
}

export default function App() {
  const [cms, setCms] = useState<CmsData | null>(null)

  useEffect(() => {
    let mounted = true
    const load = () => {
      getCmsData().then((data) => {
        if (mounted) setCms(data)
      })
    }
    load()
    const unsubscribe = onContentChanged(load)
    const onVisible = () => {
      if (document.visibilityState === 'visible') load()
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      mounted = false
      unsubscribe()
      document.removeEventListener('visibilitychange', onVisible)
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
            'Студия акробатики в Долгопрудном: группы для взрослых и детей, воздушная акробатика, акро-гимнастика.'
          }
        />
        <link rel="canonical" href="https://planetaup.ru/" />
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
          <Hero cms={cms} />
          <MainSections cms={cms} />
        </ErrorBoundary>
      </main>
      {cms && <Footer settings={cms.settings} />}
    </>
  )
}
