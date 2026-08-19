import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

export function NotFound() {
  return (
    <>
      <Helmet>
        <title>Страница не найдена — Планета UP</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-32 text-center">
        <p className="font-display text-7xl font-bold text-min-accent">404</p>
        <h1 className="mt-4 text-2xl font-semibold text-min-text">Страница не найдена</h1>
        <p className="mt-2 text-min-muted">
          Возможно, она была перемещена или удалена.
        </p>
        <Link to="/" className="mt-6">
          <Button variant="primary">На главную</Button>
        </Link>
      </main>
    </>
  )
}
