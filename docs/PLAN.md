# PlanetUP — План реализации

Сайт-визитка студии акробатики «Планета UP». SPA на React + Vite, статическая сборка (Vercel), контент — локальный TypeScript-модуль.

## Domain-модель и решения

- [CONTEXT.md](../CONTEXT.md) — глоссарий устоявшихся решений (навигация, форма, CMS, контент, инфраструктура, дизайн, SEO, legal).
- [ADR-0001: Google Sheets как CMS](./adr/0001-google-sheets-as-cms.md) — superseded
- [ADR-0002: Serverless-only, без БД](./adr/0002-serverless-only-no-database.md)
- [ADR-0003: Локальный CMS-модуль](./adr/ADR-0003-local-cms.md)

## Технологический стек

| Слой | Технология |
|------|-----------|
| Build / Framework | React 18 + Vite |
| Routing | react-router-dom (только `/privacy` отдельно; остальное — якоря) |
| Styling | Tailwind CSS (mobile-first) |
| Animation | Framer Motion (starfield hero, scroll transitions) |
| UI primitives | Radix UI (FAQ accordion, modals, tabs расписания) |
| Forms | react-hook-form + zod (валидация, телефон auto-format) |
| Gallery | yet-another-react-lightbox (lazy load) |
| Backend | Vercel Serverless Function (form handler) |
| Notifications | Telegram Bot API (primary) + Resend (email copy) |
| CMS | `src/data/content.ts` (TypeScript, version-controlled) |
| Media | `public/media/*.webp` (optimized local assets) |
| Analytics | Яндекс.Метрика |
| Maps | Яндекс.Карты (iframe, lazy-load) |
| SEO | React Helmet (per-section meta), sitemap.xml, robots.txt |

## Структура контента (`src/data/content.ts`)

1. `trainers` — name, specialization, bio, photo, social
2. `subscriptions` — name, price, description, conditions, sort
3. `groups` — name, category (adults/kids), level, schedule, description, photo
4. `faq` — question, answer, sort
5. `testimonials` — name, text (10 entries from OCR screenshots)
6. `life_posts` — title, text, date, cover photo, album photos
7. `gallery` — photo, category, sort (~24 фото)
8. `settings` — phone, phoneHref, address, email, social (VK/TG/WhatsApp), hero text, SEO

## Этапы работ

### Этап 1 — Сборка каркаса и контент
- [x] Инициализация Vite + React + Tailwind + зависимости
- [x] Структура проекта (components, sections, lib, api)
- [x] Локальный контент для всех 8 сущностей в `src/data/content.ts`
- [x] Оптимизация медиа в `public/media/` (WebP)

### Этап 2 — Дизайн-система и hero
- [ ] Палитра (космос: `#0B1026` bg, `#7C3AED` accent, `#F8FAFC` light) и шрифты (Inter + декоративный заголовок)
- [ ] Hero-блок: starfield (Canvas/CSS), glow, parallax, форма записи visible above fold
- [ ] Плавный градиент hero → светлый контент

### Этап 3 — Контентные секции (все 10 разделов)
- [ ] Header (sticky, anchor nav) + Footer (соцсети, ссылка на `/privacy`)
- [ ] Взрослым / Детям — карточки групп + tabs расписания + кнопка «Записаться» (pre-fill interest)
- [ ] Абонементы — карточки тарифов + CTA
- [ ] Наша команда — карточки тренеров
- [ ] Галерея — сетка + lazy load + lightbox + фильтр по категориям
- [ ] Жизнь коллектива — лента карточек + альбомы фото
- [ ] Отзывы — карточки (ручной ввод)
- [ ] FAQ — accordion (Radix UI)
- [ ] Контакты — Яндекс.Карты (lazy iframe) + соцсети + дубль формы

### Этап 4 — Форма записи и backend
- [x] react-hook-form + zod: детская/взрослая формы, телефон (auto-format), источник
- [x] Honeypot + rate limit (1/IP/min)
- [x] Галочка согласия 152-ФЗ (обязательна)
- [x] Serverless function → Telegram + Resend
- [x] Экран/сообщение об успехе

### Этап 5 — SEO, a11y, перформанс
- [ ] React Helmet per-section meta (title/description)
- [ ] Semantic landmarks, alt-тексты, контраст, клавиатурная навигация
- [ ] sitemap.xml, robots.txt
- [ ] Оптимизация изображений (WebP, lazy), Lighthouse ≥ 80 mobile

### Этап 6 — Публикация
- [x] Статическая сборка без внешних CMS-зависимостей
- [ ] Привязка собственного домена и деплой на Vercel
- [ ] Яндекс.Метрика counter
- [ ] Публикация на Vercel (stagind: `planeta-up.vercel.app`)
- [ ] **Open: привязка custom домена (спросить заказчика)**

## Open Questions

- **Домен** — заказчик регистрирует отдельно; привязать перед go-live.
- **Логотип** — текстовый плейсхолдер «Планета UP»; заменить на SVG/PNG когда пришлют.

## Заметки

- Контент живёт в `src/data/content.ts`: для изменений редактируется TypeScript-файл, а новые фото проходят через `scripts/optimize-media.mjs`.
- Все CTA → единая форма записи с pre-fill поля «interest».
- Покупка абонемента происходит офлайн; сайт — только capture лидов.
