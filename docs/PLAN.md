# PlanetUP — План реализации

Сайт-визитка студии акробатики «Планета UP». SPA на React + Vite, статическая сборка (Vercel), контент через Google Sheets.

## Domain-модель и решения

- [CONTEXT.md](../CONTEXT.md) — глоссарий устоявшихся решений (навигация, форма, CMS, контент, инфраструктура, дизайн, SEO, legal).
- [ADR-0001: Google Sheets как CMS](./adr/0001-google-sheets-as-cms.md)
- [ADR-0002: Serverless-only, без БД](./adr/0002-serverless-only-no-database.md)

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
| CMS | Google Sheets (8 листов) + webhook → Vercel Deploy Hook |
| Media | Google Drive (публичные ссылки) |
| Analytics | Яндекс.Метрика |
| Maps | Яндекс.Карты (iframe, lazy-load) |
| SEO | React Helmet (per-section meta), sitemap.xml, robots.txt |

## Структура контента (Google Sheets — 8 листов)

1. `trainers` — name, specialization, bio, photo, social
2. `subscriptions` — name, price, description, conditions, sort
3. `groups` — name, category (adults/kids), level, schedule, description, photo
4. `faq` — question, answer, sort
5. `testimonials` — name, text, photo (optional, manual only)
6. `life_posts` — title, text, date, cover photo, album photos
7. `gallery` — photo, category, sort (~30 фото старт)
8. `site_settings` — phone, address, email, social (VK/TG/WhatsApp), hero text, SEO

## Этапы работ

### Этап 1 — Сборка каркаса и MOCK-данные
- [ ] Инициализация Vite + React + Tailwind + зависимости
- [ ] Структура проекта (components, sections, lib, api)
- [ ] MOCK-данные для всех 8 сущностей (реалистичные, русский язык)
- [ ] Шаблон Google Sheets + скрипт экспорта в JSON (build-time fetch)

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
- [ ] react-hook-form + zod: Имя, Телефон (auto-format), Направление (pre-fill), Время/день
- [ ] Honeypot + rate limit (1/IP/min)
- [ ] Галочка согласия 152-ФЗ (обязательна)
- [ ] Serverless function → Telegram + Resend
- [ ] Экран/сообщение об успехе

### Этап 5 — SEO, a11y, перформанс
- [ ] React Helmet per-section meta (title/description)
- [ ] Semantic landmarks, alt-тексты, контраст, клавиатурная навигация
- [ ] sitemap.xml, robots.txt
- [ ] Оптимизация изображений (WebP, lazy), Lighthouse ≥ 80 mobile

### Этап 6 — Интеграция CMS и публикация
- [ ] Скрипт сборки: fetch Sheets → JSON → build
- [ ] Webhook (Apps Script) → Vercel Deploy Hook
- [ ] Яндекс.Метрика counter
- [ ] Публикация на Vercel (stagind: `planeta-up.vercel.app`)
- [ ] **Open: привязка custom домена (спросить заказчика)**

## Open Questions

- **Домен** — заказчик регистрирует отдельно; привязать перед go-live.
- **Логотип** — текстовый плейсхолдер «Планета UP»; заменить на SVG/PNG когда пришлют.

## Заметки

- Контент MOCK-first: реальные тексты/фото подставляются в Google Sheets без код-изменений.
- Все CTA → единая форма записи с pre-fill поля «interest».
- Покупка абонемента происходит офлайн; сайт — только capture лидов.
