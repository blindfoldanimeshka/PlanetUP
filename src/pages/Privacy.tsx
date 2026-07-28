import { Helmet } from 'react-helmet-async'

export function Privacy() {
  return (
    <>
      <Helmet>
        <title>Политика конфиденциальности — Планета UP</title>
        <meta
          name="description"
          content="Политика обработки персональных данных студии акробатики Планета UP."
        />
      </Helmet>
      <main className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="text-3xl font-bold">Политика конфиденциальности</h1>
      <p className="mt-4 text-[#64748b]">
        Полный текст политики появится перед публикацией (требование 152-ФЗ). Здесь
        описывается, какие данные мы собираем через форму записи и как их обрабатываем.
      </p>
      <a href="/" className="mt-8 inline-block font-medium text-[#7c3aed] hover:underline">
        ← На главную
      </a>
    </main>
    </>
  )
}
