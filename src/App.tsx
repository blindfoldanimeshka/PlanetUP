import { useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import type { CmsData } from '@/types/cms'
import { getCmsData } from '@/api/cms'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { ErrorBoundary } from '@/components/ErrorBoundary'
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
      <Header />
      <main id="main-content">
        <ErrorBoundary>
          <Hero />
          <MainSections cms={cms} />
        </ErrorBoundary>
      </main>
      {cms && <Footer settings={cms.settings} />}
    </>
  )
}
