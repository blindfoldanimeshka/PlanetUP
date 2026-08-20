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
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="mx-auto max-w-3xl px-4 py-16">
        <h1 className="text-3xl font-bold text-min-text">Политика конфиденциальности</h1>
        <p className="mt-2 text-sm text-min-muted">
          Действует с 1 августа 2026 г. Черновик — перед запуском рекламы необходима
          проверка юристом (п. 1.1 аудита).
        </p>

        <section className="mt-8">
          <h2 className="text-xl font-semibold text-min-text">1. Оператор персональных данных</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            Оператором персональных данных является студия акробатики «Планета UP»
            (далее — Оператор). Реквизиты индивидуального предпринимателя (ИНН, ОГРН)
            уточняются владельцем при актуализации политики.
          </p>
          <p className="mt-2 text-min-text leading-relaxed">
            Контактные данные Оператора:
          </p>
          <ul className="mt-2 list-disc pl-5 text-min-text leading-relaxed">
            <li>Адрес студии: Набережная улица, 25, Долгопрудный, Московская область;</li>
            <li>E-mail: aleksandra.danichek@mail.ru;</li>
            <li>Телефон: +7 (962) 908-05-54.</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-min-text">2. Цели обработки персональных данных</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            Мы обрабатываем персональные данные исключительно для:
          </p>
          <ul className="mt-2 list-disc pl-5 text-min-text leading-relaxed">
            <li>записи на пробные и регулярные занятия в студии;</li>
            <li>обратной связи с клиентами по вопросам расписания и абонементов;</li>
            <li>аналитики посещаемости сайта и улучшения качества услуг.</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-min-text">3. Категории обрабатываемых персональных данных</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            Через форму записи мы собираем следующие данные:
          </p>
          <ul className="mt-2 list-disc pl-5 text-min-text leading-relaxed">
            <li><strong>Фамилия, имя, отчество</strong> — для обращения к клиенту;</li>
            <li><strong>Номер телефона</strong> — для связи и подтверждения записи;</li>
            <li><strong>Возраст</strong> — для подбора подходящей группы;</li>
            <li>
              <strong>Сведения об опыте занятий и спортивной подготовке</strong> — для
              формирования группы;
            </li>
            <li>
              <strong>Сведения о травмах и медицинских ограничениях</strong> — относятся к
              данным о состоянии здоровья (специальная категория по ст. 10 ФЗ-152) и
              обрабатываются только с явного согласия субъекта для обеспечения безопасности
              занятий;
            </li>
            <li>
              Для обработки сведений о состоянии здоровья (травмах/ограничениях) от
              субъекта дополнительно собирается отдельное согласие в порядке, предусмотренном
              ст. 10 и ч. 4 ст. 9 Федерального закона № 152-ФЗ.
            </li>
            <li><strong>Источник, откуда вы о нас узнали</strong> — для статистики.</li>
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-min-text">4. Обработка данных несовершеннолетних</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            При записи ребёнка мы обрабатываем данные несовершеннолетнего (имя, возраст) и
            данные его законного представителя (ФИО родителя, телефон). Обработка данных
            ребёнка осуществляется только на основании согласия законного представителя,
            выраженного через отметку в форме записи. Законный представитель вправе в любой
            момент отозвать согласие и потребовать удаления данных ребёнка.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-min-text">5. Передача данных третьим лицам и обработчики</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            Оператор использует сторонних обработчиков для работы сервиса:
          </p>
          <ul className="mt-2 list-disc pl-5 text-min-text leading-relaxed">
            <li>
              <strong>Telegram</strong> — доставка уведомлений о новых заявках
              администратору студии;
            </li>
            <li>
              <strong>Resend</strong> — отправка копии заявки на корпоративную почту
              Оператора;
            </li>
            <li>
              <strong>Яндекс.Метрика</strong> — сбор обезличенной статистики посещаемости
              сайта (включая Webvisor). Поля ввода ФИО и телефона в форме записи замаскированы
              от записи (маскирование полей формы включено в настройках счётчика).
            </li>
          </ul>
          <p className="mt-2 text-min-text leading-relaxed">
            Данные не передаются иным третьим лицам, кроме случаев, предусмотренных
            законодательством РФ.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-min-text">6. Сроки хранения и порядок уничтожения</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            Персональные данные хранятся в течение <strong>3 (трёх) лет</strong> с даты
            последнего посещения занятия или до момента отзыва согласия субъекта — в
            зависимости от того, что наступит раньше. По истечении срока или при получении
            запроса на удаление данные уничтожаются безвозвратно из всех систем уведомлений
            (Telegram, e-mail).
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-min-text">7. Права субъекта персональных данных</h2>
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
          <h2 className="text-xl font-semibold text-min-text">8. Контакты для обращений по вопросам ПД</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            По всем вопросам, связанным с обработкой персональных данных, обращайтесь:
          </p>
          <ul className="mt-2 list-disc pl-5 text-min-text leading-relaxed">
            <li>E-mail: aleksandra.danichek@mail.ru</li>
            <li>Телефон: +7 (962) 908-05-54</li>
            <li>Адрес студии: Набережная улица, 25, Долгопрудный, Московская область</li>
          </ul>
          <p className="mt-2 text-min-text leading-relaxed">
            Мы обязуемся рассмотреть ваше обращение в течение 10 рабочих дней с момента
            получения.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="text-xl font-semibold text-min-text">9. Использование cookies и аналитики</h2>
          <p className="mt-2 text-min-text leading-relaxed">
            На сайте установлен счётчик <strong>Яндекс.Метрика</strong> для анализа
            посещаемости. Метрика собирает обезличенные данные (IP-адрес, источник перехода,
            время на сайте) без привязки к имени и телефону, указанным в форме записи. Вы
            можете отключить сбор данных Метрикой через настройки браузера или плагины
            блокировки трекеров.
          </p>
        </section>

        <a href="/" className="mt-10 inline-block font-medium text-min-accent hover:underline">
          ← На главную
        </a>
      </main>
    </>
  )
}
