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
        <h1 className="text-3xl font-bold text-min-text">Политика конфиденциальности</h1>
        <p className="mt-2 text-sm text-min-muted">
          Действует с 1 августа 2026 г.
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-min-text">1. Оператор персональных данных</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            Оператором персональных данных является <strong>[ЗАПОЛНИТЬ: ИП Фамилия И.О. / ООО «Планета UP»]</strong>,
            ИНН <strong>[ЗАПОЛНИТЬ]</strong>, ОГРН <strong>[ЗАПОЛНИТЬ]</strong>.
            Адрес места нахождения / регистрации: <strong>[ЗАПОЛНИТЬ адрес]</strong>.
            Контактный e-mail: <strong>[ЗАПОЛНИТЬ email]</strong>, телефон: <strong>[ЗАПОЛНИТЬ телефон]</strong>.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-min-text">2. Цели обработки персональных данных</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            Мы обрабатываем персональные данные исключительно для:
          </p>
          <ul className="mt-2 list-disc pl-5 text-min-text leading-relaxed">
            <li>записи на пробное и регулярные занятия в студии;</li>
            <li>обратной связи с клиентами по вопросам расписания и абонементов;</li>
            <li>аналитики посещаемости и улучшения качества услуг (без передачи данных третьим лицам).</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-min-text">3. Категории обрабатываемых персональных данных</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            Через форму записи мы собираем:
          </p>
          <ul className="mt-2 list-disc pl-5 text-min-text leading-relaxed">
            <li><strong>Имя</strong> — для обращения к клиенту;</li>
            <li><strong>Номер телефона</strong> — для связи и подтверждения записи;</li>
            <li><strong>Направление</strong> (взрослые / дети) — для формирования группы;</li>
            <li><strong>Предпочтительное время</strong> — для подбора удобного расписания.</li>
          </ul>
          <p className="mt-2 text-min-text leading-relaxed">
            Мы <strong>не</strong> собираем паспортные данные, адреса проживания, данные о состоянии здоровья и иную чувствительную информацию.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-min-text">4. Сроки хранения и порядок уничтожения</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            Персональные данные хранятся в течение <strong>3 (трёх) лет</strong> с даты последнего посещения занятия
            или до момента отзыва согласия субъекта — в зависимости от того, что наступит раньше.
            По истечении срока или при получении запроса на удаление данные уничтожаются безвозвратно
            из всех систем уведомлений (Telegram, e-mail).
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-min-text">5. Права субъекта персональных данных</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            В соответствии со ст. 14 ФЗ-152 вы имеете право:
          </p>
          <ul className="mt-2 list-disc pl-5 text-min-text leading-relaxed">
            <li>получить информацию о том, какие данные о вас обрабатываются;</li>
            <li>требовать исправления неточных или неполных данных;</li>
            <li>требовать удаления данных (право «быть забытым») при отказе от дальнейших занятий;</li>
            <li>отозвать согласие на обработку в любой момент, направив запрос по контактам ниже.</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-min-text">6. Контакты для обращений по вопросам ПД</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            По всем вопросам, связанным с обработкой персональных данных, обращайтесь:
          </p>
          <ul className="mt-2 list-disc pl-5 text-min-text leading-relaxed">
            <li>E-mail: <strong>[ЗАПОЛНИТЬ email]</strong></li>
            <li>Телефон: <strong>[ЗАПОЛНИТЬ телефон]</strong></li>
            <li>Адрес студии: <strong>[ЗАПОЛНИТЬ адрес]</strong></li>
          </ul>
          <p className="mt-2 text-min-text leading-relaxed">
            Мы обязуемся рассмотреть ваше обращение в течение 10 рабочих дней с момента получения.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-min-text">7. Передача данных третьим лицам</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            Мы не передаём персональные данные третьим лицам. Уведомления о новых заявках
            поступают администратору студии через Telegram и e-mail (Resend) — это внутренние
            каналы связи, а не передача данных внешним организациям.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-min-text">8. Использование cookies и аналитики</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            На сайте установлен счётчик <strong>Яндекс.Метрика</strong> для анализа посещаемости.
            Метрика собирает обезличенные данные (IP-адрес, источник перехода, время на сайте)
            без привязки к имени и телефону, указанным в форме записи.
            Вы можете отключить сбор данных Метрикой через настройки браузера или плагины блокировки трекеров.
          </p>
        </section>

        <a href="/" className="mt-10 inline-block font-medium text-min-accent hover:underline">
          ← На главную
        </a>
      </main>
    </>
  )
}
