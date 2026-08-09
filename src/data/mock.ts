import type { CmsData } from '@/types/cms'

// MOCK content. Replace via Google Sheets CMS at build time (see docs/PLAN.md).
// Photo URLs are placeholders (picsum/pravatar) — swap for Google Drive links later.

const PLACEHOLDER = '/img-mock/20180729112403927.jpg'
const img = (_seed: string, _w = 800, _h = 600) => PLACEHOLDER
const avatar = (_n: number) => PLACEHOLDER

export const mockCms: CmsData = {
  settings: {
    phone: '+7 (925) 123-45-67',
    address: 'Москва, ул. Звёздная, 12, м. «Космонавтов»',
    email: 'hello@planetaup.ru',
    social: {
      vk: 'https://vk.ru/planetaupacro',
      telegram: 'https://t.me/planetup_acro',
      whatsapp: 'https://wa.me/79991234567',
    },
    hero: {
      title: 'Планета UP — студия акробатики',
      subtitle:
        'Раскройте своё тело в космосе движения. Занятия для взрослых и детей: от первой стойки на руках до воздушной акробатики.',
    },
    seo: {
      title: 'Планета UP — студия акробатики для взрослых и детей',
      description:
        'Студия акробатики в Москве: группы для взрослых и детей, воздушная акробатика, акро-гимнастика. Запишитесь на пробное занятие бесплатно.',
    },
  },

  trainers: [
    {
      id: 't-anna',
      name: 'Анна Северова',
      specialization: 'Воздушная акробатика',
      bio: 'Мастер спорта по художественной гимнастике. 10 лет ведёт взрослые группы по воздушному полотну и кольцам.',
      photoUrl: avatar(5),
      social: 'https://vk.ru/annacro',
    },
    {
      id: 't-dmitry',
      name: 'Дмитрий Орлов',
      specialization: 'Акробатика и партер',
      bio: 'Бывший артист цирка. Специализируется на силовой акробатике, стойках и акробатических связках.',
      photoUrl: avatar(12),
    },
    {
      id: 't-elena',
      name: 'Елена Звягина',
      specialization: 'Детские группы',
      bio: 'Педагог дошкольного и дополнительного образования. Ведёт младшую и среднюю группы с любовью к каждому ребёнку.',
      photoUrl: avatar(9),
    },
    {
      id: 't-maksim',
      name: 'Максим Лебедев',
      specialization: 'Акро-гимнастика и парная акробатика',
      bio: 'Чемпион города по спортивной акробатике. Обожает парные связки и доверие в паре.',
      photoUrl: avatar(33),
    },
  ],

  subscriptions: [
    {
      id: 's-trial',
      name: 'Пробное',
      price: '0 ₽',
      description: 'Одно бесплатное пробное занятие для новичков.',
      conditions: 'По предварительной записи. Доступно один раз.',
      sortOrder: 1,
    },
    {
      id: 's-start',
      name: 'Старт',
      price: '4 500 ₽/мес',
      description: '8 занятий в месяц. Идеально для тех, кто только начинает.',
      conditions: 'Заморозка до 14 дней. Перенос занятия за 12 часов.',
      sortOrder: 2,
    },
    {
      id: 's-comfort',
      name: 'Комфорт',
      price: '6 900 ₽/мес',
      description: '12 занятий в месяц. Гибкое расписание всех направлений.',
      conditions: 'Заморозка до 30 дней. Групповые и индивидуальные.',
      sortOrder: 3,
    },
    {
      id: 's-unlimited',
      name: 'Безлимит',
      price: '9 900 ₽/мес',
      description: 'Безлимитные посещения всех групп и направлений.',
      conditions: 'Заморозка до 30 дней. Приоритетная запись.',
      sortOrder: 4,
    },
  ],

  groups: [
    {
      id: 'g-adult-base',
      name: 'Акробатика. База (взрослые)',
      category: 'adults',
      level: 'Начальный',
      schedule: [
        { day: 'Пн', time: '19:00–20:30' },
        { day: 'Ср', time: '19:00–20:30' },
        { day: 'Сб', time: '11:00–12:30' },
      ],
      description:
        'Основы акробатики: растяжка, опорные стойки, кувырки, подготовка тела. Для тех, кто начинает с нуля.',
      photoUrl: img('adult-base'),
    },
    {
      id: 'g-adult-adv',
      name: 'Акробатика. Продвинутые (взрослые)',
      category: 'adults',
      level: 'Продвинутый',
      schedule: [
        { day: 'Вт', time: '20:00–21:30' },
        { day: 'Чт', time: '20:00–21:30' },
      ],
      description:
        'Сложные связки, стойки на руках, динамическая акробатика. Требуется база.',
      photoUrl: img('adult-adv'),
    },
    {
      id: 'g-aerial',
      name: 'Воздушная акробатика (взрослые)',
      category: 'adults',
      level: 'Средний',
      schedule: [
        { day: 'Пн', time: '20:30–22:00' },
        { day: 'Пт', time: '19:00–20:30' },
      ],
      description: 'Полотно, кольца, трапеция. Работа с гравитацией и полётом.',
      photoUrl: img('aerial'),
    },
    {
      id: 'g-kids-junior',
      name: 'Акробатика. Младшая (дети 4–6)',
      category: 'kids',
      level: 'Младшая',
      schedule: [
        { day: 'Вт', time: '17:00–18:00' },
        { day: 'Чт', time: '17:00–18:00' },
        { day: 'Сб', time: '10:00–11:00' },
      ],
      description:
        'Игровая акробатика, координация, ловкость. Первый шаг в спорт через радость движения.',
      photoUrl: img('kids-junior'),
    },
    {
      id: 'g-kids-mid',
      name: 'Акробатика. Средняя (дети 7–10)',
      category: 'kids',
      level: 'Средняя',
      schedule: [
        { day: 'Пн', time: '17:00–18:15' },
        { day: 'Ср', time: '17:00–18:15' },
        { day: 'Пт', time: '17:00–18:15' },
      ],
      description: 'Базовые элементы, мостик, стойка, акробатические связки в парах.',
      photoUrl: img('kids-mid'),
    },
    {
      id: 'g-kids-acro',
      name: 'Акро-гимнастика (дети 10+)',
      category: 'kids',
      level: 'Старшая',
      schedule: [
        { day: 'Вт', time: '18:15–19:45' },
        { day: 'Чт', time: '18:15–19:45' },
      ],
      description: 'Парная и групповая акробатика, выступления на сборах и фестивалях.',
      photoUrl: img('kids-acro'),
    },
  ],

  faq: [
    {
      id: 'f-1',
      question: 'Нужна ли спортивная подготовка, чтобы начать?',
      answer:
        'Нет. Большинство наших групп — с нуля. Тренер адаптирует нагрузку под ваш уровень.',
      sortOrder: 1,
    },
    {
      id: 'f-2',
      question: 'С какого возраста принимаете детей?',
      answer: 'С 4 лет в младшую группу. Дальше — по возрастным группам до 16+.',
      sortOrder: 2,
    },
    {
      id: 'f-3',
      question: 'Что взять с собой на первое занятие?',
      answer:
        'Удобную одежду по погоде, чешки или босик, воду. Всё остальное — у нас.',
      sortOrder: 3,
    },
    {
      id: 'f-4',
      question: 'Можно ли заморозить абонемент?',
      answer:
        'Да. Абонементы «Старт» и выше можно заморозить на 14–30 дней по уважительной причине.',
      sortOrder: 4,
    },
    {
      id: 'f-5',
      question: 'Есть ли пробное занятие?',
      answer:
        'Да, первое занятие бесплатно по предварительной записи через форму на сайте.',
      sortOrder: 5,
    },
    {
      id: 'f-6',
      question: 'Как часто нужно заниматься для результата?',
      answer: 'Рекомендуем 2 раза в неделю. Заметный прогресс — через 2–3 месяца.',
      sortOrder: 6,
    },
  ],

  testimonials: [
    {
      id: 'r-1',
      name: 'Мария К.',
      text: 'Пришла «ничего не умею», через месяц стою на руках у стенки. Атмосфера — космос!',
      photoUrl: avatar(20),
    },
    {
      id: 'r-2',
      name: 'Игорь П.',
      text: 'Сын в восторге от акро-гимнастики. Тренеры — профессионалы и душа компании.',
    },
    {
      id: 'r-3',
      name: 'Светлана В.',
      text: 'Воздушное полотно — лучший антистресс после работы. Рекомендую всем подругам.',
      photoUrl: avatar(45),
    },
    {
      id: 'r-4',
      name: 'Денис Т.',
      text: 'Пробное было бесплатным, остался на «Комфорт». Гибкое расписание — то, что нужно.',
    },
    {
      id: 'r-5',
      name: 'Ольга Р.',
      text: 'Дочка (5 лет) бежит на занятия как на праздник. Спасибо Елене!',
      photoUrl: avatar(31),
    },
    {
      id: 'r-6',
      name: 'Павел С.',
      text: 'Крутая студия, современный зал, адекватные цены. Нашёл свою форму через акробатику.',
    },
  ],

  lifePosts: [
    {
      id: 'l-1',
      title: 'Фестиваль «Акро-Весна 2026»',
      text: 'Наши группы выступили на городском фестивале. Гордимся каждым! Спасибо родителям за поддержку.',
      date: '2026-05-18',
      coverPhotoUrl: img('life-fest'),
      albumPhotoUrls: [img('life-fest-1'), img('life-fest-2'), img('life-fest-3')],
    },
    {
      id: 'l-2',
      title: 'Летние сборы в Подмосковье',
      text: 'Неделя интенсива: акробатика, воздух, парковые тренировки и вечерний костёр.',
      date: '2026-07-04',
      coverPhotoUrl: img('life-camp'),
      albumPhotoUrls: [img('life-camp-1'), img('life-camp-2')],
    },
    {
      id: 'l-3',
      title: 'Открытый урок для родителей',
      text: 'Показали, чему научились за год. Слёзы счастья и бурные аплодисменты.',
      date: '2026-06-12',
      coverPhotoUrl: img('life-open'),
      albumPhotoUrls: [img('life-open-1'), img('life-open-2'), img('life-open-3'), img('life-open-4')],
    },
  ],

  gallery: [
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `g-ad-${i}`,
      photoUrl: img(`gal-adult-${i}`, 600, 600),
      category: 'adults' as const,
      sortOrder: i,
    })),
    ...Array.from({ length: 10 }, (_, i) => ({
      id: `g-kd-${i}`,
      photoUrl: img(`gal-kids-${i}`, 600, 600),
      category: 'kids' as const,
      sortOrder: i,
    })),
    ...Array.from({ length: 8 }, (_, i) => ({
      id: `g-cm-${i}`,
      photoUrl: img(`gal-comp-${i}`, 600, 600),
      category: 'competitions' as const,
      sortOrder: i,
    })),
  ],
}
