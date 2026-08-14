<div align="center">

# 🪐 Планета UP — Студия акробатики

[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000?style=flat&logo=vercel)](https://planetaup.vercel.app)
[![CI](https://img.shields.io/github/actions/workflow/status/blindfoldanimeshka/PlanetUP/ci.yml?label=CI&logo=github)](https://github.com/blindfoldanimeshka/PlanetUP/actions)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178c6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)](https://react.dev/)

**Сайт-визитка студии акробатики в Долгопрудном.**
Занятия для взрослых и детей, воздушная акробатика, акро-гимнастика, растяжка.

[🌐 Сайт](https://planetaup.vercel.app) · [📋 План реализации](docs/PLAN.md) · [📐 ADR](docs/adr/)

</div>

---

## ✨ Возможности

| Фронтенд | Бэкенд | Админка |
|-----------|--------|---------|
| 🎨 Космический дизайн с анимациями | 📩 Запись на пробное занятие | 🤖 Telegram-бот для управления контентом |
| 🖼 Интерактивная галерея (accordion) | 📲 Уведомления в Telegram | 📅 Редактирование расписания |
| 📱 Адаптивный (mobile-first) | 📧 Email-копия через Resend | 💳 Управление абонементами |
| ♿ Accessibility (a11y) | 🛡 Honeypot + rate limit | 👥 Управление командой тренеров |
| ⚡ Статическая сборка (Vercel) | 🔒 Валидация (Zod) | 🖼 Загрузка фото |

---

## 🚀 Быстрый старт

### Требования

- **Node.js 22+** (см. `.nvmrc`)
- **npm** (или pnpm/yarn)

### Установка

```bash
# 1. Клонировать
git clone https://github.com/blindfoldanimeshka/PlanetUP.git
cd PlanetUP

# 2. Установить зависимости
npm ci

# 3. Создать .env.local (см. раздел "Переменные окружения")
cp .env.example .env.local

# 4. Запустить dev-сервер
npm run dev
```

Открой [http://localhost:5173](http://localhost:5173)

### Основные команды

| Команда | Описание |
|---------|----------|
| `npm run dev` | Dev-сервер (Vite + локальный API) |
| `npm run build` | Production сборка (`tsc -b && vite build`) |
| `npm run preview` | Просмотр production сборки |
| `npm run test` | Unit-тесты (vitest) |
| `npm run lint` | Лinting (oxlint) |

---

## 🗂 Структура проекта

```
PlanetUP/
├── api/                          # Vercel Serverless Functions
│   ├── submit-form.ts            # Обработка формы записи → Telegram + Email
│   ├── content.ts                # Публичный API контента (Redis)
│   └── tg/
│       ├── webhook.ts            # Webhook для Telegram-бота
│       └── bot.ts                # Логика бота (команды, state machine)
├── src/
│   ├── components/               # UI-компоненты
│   │   ├── Hero.tsx              # Главный экран + форма записи
│   │   ├── Header.tsx            # Навигация (CardNav, hide-on-scroll)
│   │   ├── gallery/
│   │   │   └── AccordionGallery.tsx  # Интерактивная галерея
│   │   ├── groups/
│   │   │   ├── GroupCard.tsx     # Карточка группы
│   │   │   └── ScheduleTabs.tsx  # Табы расписания
│   │   └── ...
│   ├── sections/                 # Контентные секции
│   │   ├── AdultsSection.tsx
│   │   ├── KidsSection.tsx
│   │   ├── SubscriptionsSection.tsx
│   │   ├── TeamSection.tsx
│   │   ├── GallerySection.tsx
│   │   ├── LifeSection.tsx
│   │   ├── ReviewsSection.tsx
│   │   ├── FaqSection.tsx
│   │   └── ContactsSection.tsx
│   ├── data/
│   │   └── content.ts            # Статичный контент (fallback)
│   ├── lib/
│   │   ├── storage.ts            # Redis CRUD (Upstash)
│   │   ├── validation.ts         # Zod-схемы
│   │   └── scroll.ts             # Утилиты скролла
│   ├── hooks/
│   │   ├── useScrollDirection.ts
│   │   └── useReducedMotion.ts
│   └── index.css                 # Tailwind + анимации
├── public/media/                 # Оптимизированные медиа (WebP)
├── scripts/
│   ├── seed-redis.ts             # Миграция контента в Redis
│   ├── set-webhook.mjs           # Регистрация Telegram webhook
│   └── telegram-test.mjs         # Тест Telegram API
├── tests/                        # Unit-тесты
│   ├── submit-form.test.ts
│   ├── validation.test.ts
│   └── content.test.ts
├── docs/
│   ├── PLAN.md                   # План реализации
│   └── adr/                      # Architecture Decision Records
└── .opencode/skills/             # AI-skills (ui-ux-pro-max)
```

---

## 🔧 Технологический стек

| Слой | Технология |
|------|-----------|
| **Framework** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS 4 + CSS-анимации |
| **Animation** | Framer Motion 12, Anime.js 4 |
| **UI** | Radix UI (Dialog, Accordion, Tabs, DropdownMenu) |
| **Forms** | react-hook-form + Zod |
| **Backend** | Vercel Serverless Functions (Node.js) |
| **Storage** | Upstash Redis (контент + сессии) |
| **Notifications** | Telegram Bot API + Resend (email) |
| **CI/CD** | GitHub Actions + Vercel |
| **Testing** | Vitest, Playwright |

---

## 🔐 Переменные окружения

Создай `.env.local` из `.env.example`:

```env
# Telegram (обязательно для уведомлений)
TELEGRAM_BOT_TOKEN=твой_токен_от_BotFather
TELEGRAM_CHAT_ID=твой_chat_id

# Email через Resend (опционально)
RESEND_API_KEY=re_твой_ключ
NOTIFICATION_EMAIL=admin@example.com

# Upstash Redis (обязательно для бота + контента)
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=твой_токен

# Admin-панель (/admin) — ТОЛЬКО сервер, высокая энтропия (16+ символов).
# Не используйте префикс VITE_ — эти значения не должны попадать в браузер.
ADMIN_PASSWORD=надёжный_пароль_админа
ADMIN_SESSION_SECRET=случайный_секрет_для_подписи_сессий
TELEGRAM_WEBHOOK_SECRET=случайный_секрет_для_заголовка_вебхука
```

### Где взять значения

| Переменная | Источник |
|-----------|----------|
| `TELEGRAM_BOT_TOKEN` | [@BotFather](https://t.me/BotFather) → `/newbot` |
| `TELEGRAM_CHAT_ID` | Напиши боту `/start` → `https://api.telegram.org/bot<TOKEN>/getUpdates` |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |
| `UPSTASH_REDIS_REST_URL/TOKEN` | [Upstash Console](https://console.upstash.com) → твоя БД |

---

## 🤖 Telegram-бот (админка)

Бот — универсальный инструмент для управления контентом сайта + приём заявок.

### Настройка

```bash
# 1. Сидни Redis (один раз)
npx tsx scripts/seed-redis.ts

# 2. Зарегистрируй webhook (нужен VPN)
node scripts/set-webhook.mjs https://твой-домен.vercel.app

# 3. Напиши боту /start
```

### Команды бота

| Команда | Описание |
|---------|----------|
| `/start` | Главное меню (inline-кнопки) |
| `/menu` | Показать главное меню |
| `/help` | Список всех команд |
| `/schedule` | Управление расписанием |
| `/subscriptions` | Управление абонементами |
| `/team` | Управление командой |
| `/gallery` | Управление галереей |
| `/life` | Управление жизнью коллектива |
| `/reviews` | Управление отзывами |
| `/contacts` | Редактирование контактов |

### Архитектура бота

```
Telegram → /api/tg/webhook → bot.ts (commands + state machine)
                                      ↓
                              Redis (storage.ts)
                                      ↓
                              /api/content → Frontend
```

---

## 📡 API Endpoints

| Endpoint | Метод | Описание |
|----------|-------|----------|
| `/api/submit-form` | `POST` | Запись на занятие → Telegram + Email |
| `/api/content` | `GET` | Получить весь контент (Redis) |
| `/api/tg/webhook` | `POST` | Webhook для Telegram-бота |

### Пример: отправка заявки

```json
POST /api/submit-form
Content-Type: application/json

{
  "formType": "child",
  "childName": "Иван Иванов",
  "age": "8",
  "hasExperience": "no",
  "phone": "79123456789",
  "parentName": "Мария Иванова",
  "source": "friends",
  "consent": true,
  "honeypot": ""
}
```

---

## 🧪 Тестирование

```bash
# Unit-тесты
npm run test

# Тест Telegram API (нужен VPN)
node scripts/telegram-test.mjs
```

Тесты покрывают: валидацию формы, rate limiting, honeypot, форматирование сообщений.

---

## 🚆 CI/CD

**GitHub Actions** (`.github/workflows/ci.yml`):
1. `npm ci`
2. `npm run lint`
3. `npm run test`
4. `npm run build`

**Vercel**:
- Push в `main` → production
- Pull request → preview deployment

---

## 📝 Управление контентом

### Через Telegram-бота (рекомендуется)
Все изменения видны сразу на сайте после сохранения в Redis.

### Локально (статичный fallback)
Отредактируй `src/data/content.ts` и заренди:
```bash
npx tsx scripts/seed-redis.ts
```

---

## 📄 Лицензия

Private © 2025 Планета UP

---

<div align="center">

**[🌐 planetaup.vercel.app](https://planetaup.vercel.app)**

Made with 🪐 by [blindfoldanimeshka](https://github.com/blindfoldanimeshka)

</div>
