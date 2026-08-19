import type { CmsData } from '@/types/cms'

const phone = '+7 (962) 908-05-54'
const phoneHref = 'tel:+79629080554'
const address = 'Набережная улица, 25, Долгопрудный, Московская область'
const email = 'aleksandra.danichek@mail.ru'
const vk = 'https://vk.com/planetaupacro'
const telegram = 'https://t.me/planetup_acro'
const whatsapp = 'https://wa.me/79629080554'

function media(path: string): string {
  return `/media/${path}`
}

export const siteContent: CmsData = {
  settings: {
    phone,
    phoneHref,
    address,
    email,
    social: { vk, telegram, whatsapp },
    hero: {
      title: 'Планета UP — студия акробатики',
      subtitle:
        'Занятия для взрослых и детей в Долгопрудном: акробатика, акро-гимнастика, растяжка и танцевальные постановки. Запишитесь на пробное занятие.',
    },
    seo: {
      title: 'Планета UP — студия акробатики для взрослых и детей в Долгопрудном',
      description:
        'Студия акробатики в Долгопрудном. Группы для взрослых и детей от 4 лет, летние сборы, выступления. Запишитесь на пробное занятие.',
    },
  },

  trainers: [
    {
      id: 'alexandra-danichek',
      name: 'Александра Алексеевна',
      specialization: 'Основатель и руководитель студии',
      bio: 'Тренер-преподаватель по спортивной акробатике, хореографии и современной хореографии. Создала «Планету UP» как место, где взрослые и дети открывают своё тело через радость движения.',
      photoUrl: media('team/img-9617.webp'),
      social: vk,
    },
  ],

  subscriptions: [
    {
      id: 'trial',
      name: 'Пробное занятие',
      price: '900 ₽',
      description: 'Первое пробное занятие по предварительной записи.',
      conditions: 'Доступно один раз для новых учеников.',
      sortOrder: 1,
    },
    {
      id: 'single',
      name: 'Разовое посещение',
      price: '900 ₽',
      description: 'Одно занятие в любой группе по расписанию.',
      conditions: 'Оплата на месте или онлайн перед занятием.',
      sortOrder: 2,
    },
    {
      id: 'month-4',
      name: 'Абонемент на 4 занятия',
      price: '3 200 ₽',
      description: '4 занятия в месяц. Подходит для ознакомления или лёгкого режима.',
      conditions: 'Срок действия — 1 месяц. Заморозка по согласованию.',
      sortOrder: 3,
    },
    {
      id: 'month-8',
      name: 'Абонемент на 8 занятий',
      price: '5 600 ₽',
      description: '8 занятий в месяц. Оптимальный темп для стабильного прогресса.',
      conditions: 'Срок действия — 1 месяц. Заморозка до 14 дней.',
      sortOrder: 4,
    },
    {
      id: 'month-12',
      name: 'Абонемент на 12 занятий',
      price: '7 500 ₽',
      description: '12 занятий в месяц. Гибкое расписание всех групп.',
      conditions: 'Срок действия — 1 месяц. Заморозка до 14 дней.',
      sortOrder: 5,
    },
    {
      id: 'individual',
      name: 'Индивидуальное занятие',
      price: '2 500 ₽',
      description: 'Персональная тренировка один на один с тренером. Максимум внимания и прогресса.',
      conditions: 'Длительность — 60 минут. Запись по договорённости.',
      sortOrder: 6,
    },
    {
      id: 'split',
      name: 'Сплит-занятие',
      price: '4 000 ₽',
      description: 'Занятие на двоих: тренируйтесь вдвоём с другом или партнёром по выгодной цене.',
      conditions: 'Длительность — 60 минут. Цена за пару.',
      sortOrder: 7,
    },
  ],

  groups: [
    {
      id: 'adults-base',
      name: 'Акробатика для взрослых — база',
      category: 'adults',
      level: 'Начальный',
      schedule: [
        { day: 'Пн', time: '19:00–20:30' },
        { day: 'Ср', time: '19:00–20:30' },
      ],
      description:
        'Основы акробатики для начинающих: растяжка, опорные стойки, кувырки, акробатические связки и подготовка тела к нагрузкам.',
      photoUrl: media('adults/img-4224.webp'),
    },
    {
      id: 'adults-stretch',
      name: 'Растяжка для взрослых',
      category: 'adults',
      level: 'Любой уровень',
      schedule: [{ day: 'Пт', time: '19:00–20:00' }],
      description:
        'Комплексная растяжка для гибкости, коррекции осанки и восстановления после рабочей недели.',
      photoUrl: media('adults/img-9846.webp'),
    },
    {
      id: 'adults-pro',
      name: 'Акробатика для взрослых — профи',
      category: 'adults',
      level: 'Продвинутый',
      schedule: [
        { day: 'Вт', time: '20:30–22:00' },
        { day: 'Чт', time: '20:30–22:00' },
      ],
      description:
        'Усложнённые связки, работа в парах, подготовка к выступлениям. Для тех, кто уверенно владеет базой.',
      photoUrl: media('adults/img-5223.webp'),
    },
    {
      id: 'kids-4-6',
      name: 'Акробатика для детей 4–6 лет',
      category: 'kids',
      level: 'Младшая группа',
      schedule: [
        { day: 'Вт', time: '17:00–18:00' },
        { day: 'Чт', time: '17:00–18:00' },
      ],
      description:
        'Игровая акробатика, развитие координации, ловкости и гибкости. Первые шаги в спорт через радость движения.',
      photoUrl: media('kids/img-1871.webp'),
    },
    {
      id: 'kids-7-10',
      name: 'Акробатика для детей 7–10 лет',
      category: 'kids',
      level: 'Средняя группа',
      schedule: [
        { day: 'Пн', time: '17:00–18:15' },
        { day: 'Ср', time: '17:00–18:15' },
      ],
      description:
        'Базовые элементы акробатики: мостик, стойка на руках, акробатические связки в парах и групповые постановки.',
      photoUrl: media('kids/img-3366.webp'),
    },
    {
      id: 'kids-10-plus',
      name: 'Акро-гимнастика 10+',
      category: 'kids',
      level: 'Старшая группа',
      schedule: [
        { day: 'Вт', time: '18:15–19:45' },
        { day: 'Чт', time: '18:15–19:45' },
      ],
      description:
        'Парная и групповая акробатика, элементы гимнастики, подготовка к выступлениям и городским фестивалям.',
      photoUrl: media('kids/img-6878.webp'),
    },
  ],

  faq: [
    {
      id: 'faq-1',
      question: 'С какого возраста можно начинать заниматься?',
      answer:
        'Детские группы принимают с 4 лет. Взрослые группы — с 16 лет, без верхней границы и без специальной подготовки.',
      sortOrder: 1,
    },
    {
      id: 'faq-2',
      question: 'Нужна ли спортивная подготовка?',
      answer:
        'Нет, базовые группы рассчитаны на новичков. Тренер подбирает нагрузку индивидуально и контролирует технику.',
      sortOrder: 2,
    },
    {
      id: 'faq-3',
      question: 'Как записаться на пробное занятие?',
      answer:
        'Заполните форму на сайте, выберите направление «Ребёнку» или «Взрослому», и мы свяжемся с вами для согласования времени.',
      sortOrder: 3,
    },
    {
      id: 'faq-4',
      question: 'Что взять с собой на занятие?',
      answer:
        'Удобную спортивную одежду, сменную обувь (чешки или кроссовки), воду. Всё оборудование предоставляет студия.',
      sortOrder: 4,
    },
    {
      id: 'faq-5',
      question: 'Можно ли заморозить абонемент?',
      answer:
        'Да, абонементы можно заморозить на срок до 14 дней по уважительной причине при предупреждении заранее.',
      sortOrder: 5,
    },
    {
      id: 'faq-6',
      question: 'Где находится студия?',
      answer: `Студия расположена по адресу: ${address}. Рядом с Московской улицей, удобный подъезд из центра Долгопрудного.`,
      sortOrder: 6,
    },
  ],

  testimonials: [
    {
      id: 'review-adults-1',
      name: 'Алёна',
      text: 'Александра Алексеевна! Вы — тренер по призванию. Спасибо большое за эти восхитительные полторы недели интенсива, за то, что Вы возились с нашими девочками как со своими дочками! Каждый день был настолько насыщенным, что дочь засыпала максимально счастливой. Лучшее начало лета! Точно останется в памяти надолго.',
    },
    {
      id: 'review-adults-2',
      name: 'Марина',
      text: 'Александра Алексеевна! Я как родитель в полном восторге от вас как от тренера и человека, потому что до вас дочь ни на какие занятия самостоятельно ходить не соглашалась без меня. Но вы абсолютно запали ей в душу, она всю неделю считала дни, когда пойдёт на тренировку. Сборы превзошли все ожидания: великолепная организация, супер разнообразная программа, бассейн, новые достижения, радость побед.',
    },
    {
      id: 'review-adults-3',
      name: 'Анна',
      text: 'Я не оставляю тренировки даже на отдыхе)))',
    },
    {
      id: 'review-adults-4',
      name: 'Надя',
      text: 'Ребята, всем спасибо за сезон! Рада была знакомству! А отдельное спасибо нашему тренеру Александре — это было мощно! Отдыхаем, набираемся сил и возвращаемся ещё круче. До встречи в сентябре.',
    },
    {
      id: 'review-adults-5',
      name: 'Ксения',
      text: 'Спасибо любимому тренеру за проделанную работу, за прекрасную атмосферу на занятиях и, конечно, за результат.',
    },
    {
      id: 'review-parents-1',
      name: 'Анастасия',
      text: 'Сын ходит второй год. Бежит на тренировки с удовольствием! Прогресс был не сразу, но виден уже ощутимый! Сын сдал ГТО на золото, стал более выносливый, гибкий! С удовольствием участвует в постановках!',
    },
    {
      id: 'review-parents-2',
      name: 'Дарья',
      text: 'Дочка занимается 4 месяца и всего 1 раз в неделю. Стала уверенно делать стойки на руках, колесо, мостик... Мечтает научиться делать сальто, поэтому с нетерпением ждём интенсива.',
    },
    {
      id: 'review-parents-3',
      name: 'Ольга',
      text: 'Дочь с удовольствием ходит на тренировки и ждёт летнего лагеря и летних сборов. Быстро научилась прыгать на скакалке и открыла для себя пои.',
    },
    {
      id: 'review-parents-4',
      name: 'Тамара',
      text: 'Очень рекомендую студию акробатики Планета UP! Есть пробное занятие, тренерский состав — замечательный! Мне нравится подход к детям, профессионализм педагогов.',
    },
    {
      id: 'review-parents-5',
      name: 'Наталья',
      text: 'Александра Алексеевна, спасибо, что вы так легко находите общий язык с детишками. Моя дочь с вашими занятиями раскрылась, на акробатику и на вашу хореографию ходила с огромным удовольствием. Вы прекрасный тренер! Мы вас очень любим.',
    },
  ],

  lifePosts: [
    {
      id: 'life-camp-2026',
      title: 'Летние сборы 2026',
      text: 'Неделя интенсива, бассейн, новые связки и много радости. Спасибо всем участникам — было мощно!',
      date: '2026-07-04',
      coverPhotoUrl: media('life/camp-2026/img-7332.webp'),
      albumPhotoUrls: [
        media('life/camp-2026/img-1635.webp'),
        media('life/camp-2026/img-7509.webp'),
        media('life/camp-2026/img-7787.webp'),
        media('life/camp-2026/img-7872.webp'),
      ],
    },
    {
      id: 'life-new-year',
      title: 'Новогодние выступления',
      text: 'Праздничная постановка, яркие костюмы и настроение волшебства. Дети блестяще выступили перед родителями.',
      date: '2025-12-28',
      coverPhotoUrl: media('life/new-year/img-3419.webp'),
      albumPhotoUrls: [
        media('life/new-year/img-3420.webp'),
        media('life/new-year/img-3421.webp'),
        media('life/new-year/img-3437-2025-г.webp'),
      ],
    },
    {
      id: 'life-performances',
      title: 'Выступления и фестивали',
      text: 'Наши группы регулярно участвуют в городских мероприятиях: открытые уроки, фестивали, концерты.',
      date: '2026-05-18',
      coverPhotoUrl: media('life/performances/img-5271.webp'),
      albumPhotoUrls: [
        media('life/performances/img-5280.webp'),
        media('life/performances/img-5298.webp'),
        media('life/performances/img-5311.webp'),
      ],
    },
  ],

  gallery: [
    { id: 'g-ad-1', photoUrl: media('adults/img-6249.webp'), category: 'adults', sortOrder: 1 },

    { id: 'g-kd-1', photoUrl: media('kids/img-1871.webp'), category: 'kids', sortOrder: 11 },
    { id: 'g-kd-2', photoUrl: media('kids/img-2609.webp'), category: 'kids', sortOrder: 12 },
    { id: 'g-kd-3', photoUrl: media('kids/img-3115.webp'), category: 'kids', sortOrder: 13 },
    { id: 'g-kd-4', photoUrl: media('kids/img-3366.webp'), category: 'kids', sortOrder: 14 },
    { id: 'g-kd-5', photoUrl: media('kids/img-4060.webp'), category: 'kids', sortOrder: 15 },

    { id: 'g-cm-1', photoUrl: media('gallery/img-8977.webp'), category: 'competitions', sortOrder: 21 },
    { id: 'g-cm-2', photoUrl: media('gallery/img-9030.webp'), category: 'competitions', sortOrder: 22 },
    { id: 'g-cm-3', photoUrl: media('gallery/img-9089.webp'), category: 'competitions', sortOrder: 23 },
    { id: 'g-cm-4', photoUrl: media('gallery/img-9142.webp'), category: 'competitions', sortOrder: 24 },
    { id: 'g-cm-5', photoUrl: media('gallery/img-9168.webp'), category: 'competitions', sortOrder: 25 },
    { id: 'g-cm-6', photoUrl: media('gallery/img-9203.webp'), category: 'competitions', sortOrder: 26 },
    { id: 'g-cm-7', photoUrl: media('gallery/img-9221.webp'), category: 'competitions', sortOrder: 27 },
    { id: 'g-cm-8', photoUrl: media('gallery/img-9295.webp'), category: 'competitions', sortOrder: 28 },
  ],
}
