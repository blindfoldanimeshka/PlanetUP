# PlanetUP — Карта проекта (Project Graph)

> Назначение этого файла: дать другому агенту (или человеку) полную карту проекта
> за один проход — слои, потоки данных, ключевые файлы, тесты, конвенции.
> Читать сверху вниз: архитектура → структура → потоки → задачи.

---

## 1. Что это за проект

**Сайт-визитка студии акробатики «Планета UP»** (Долгопрудный) + Telegram-бот для управления контентом.

- **Фронтенд**: React 19 + Vite 8 + Tailwind CSS 4 + Framer Motion. Одна SPA-страница (10 секций) + `/privacy`.
- **Бэкенд**: Vercel Serverless Functions (`api/*`) + Upstash Redis (контент + состояние админки).
- **Админка**: Telegram-бот (`api/tg/*`) — добавление/редактирование/удаление контента.
- **Формы**: запись на пробное занятие → Telegram + Resend email.
- **Стек**: TS strict, Zod, Radix UI, react-hook-form. Тесты: Vitest (unit + jsdom, 2 проекта).

## 2. Общая архитектура

```
┌─────────────────────────────┐          ┌──────────────────────────────┐
│  Браузер (SPA, Vite)        │          │  Telegram (бот-админка)      │
│  src/                       │          │  api/tg/webhook.ts ← webhook │
└──────────┬──────────────────┘          └──────────────┬───────────────┘
           │ fetch /api/content                          │ HTTP Bot API
           ▼                                             ▼
┌──────────────────────┐        ┌────────────────────────────────────────┐
│ api/content.ts (GET) │        │ api/tg/bot.ts (handleCommand,           │
│ api/submit-form.ts   │        │   handleCallback — state machine)      │
│ api/submissions.ts   │◄──────►│        └──────────┬────────────────────┘
└──────────┬───────────┘        ┌───────────────────▼──────────────────┐
           │                    │ src/lib/storage.ts (Upstash Redis)   │
           ▼                    │  — CRUD контента + admin state        │
┌─────────────────────┐         └───────────────────────────────────────┘
│ src/api/cms.ts      │
│ (клиентский слой)   │
└─────────────────────┘
```

**Ключевой сдвиг (ADR-0003, CONTEXT.md)**: контент управляется из двух источников:
1. **Локальный CMS fallback** — `src/data/content.ts` (статично, версионируется).
2. **Redis через бота** — `api/tg/*` пишет в `src/lib/storage.ts`; `api/content.ts` отдаёт;
   фронт тянет через `src/api/cms.ts`, fallback на статику при ошибке.

## 3. Структура каталогов (верхний уровень)

```
PlanetUP/
├── api/              ← Vercel Serverless Functions
│   ├── content.ts    ← GET /api/content — весь контент из Redis
│   ├── submit-form.ts← POST — заявка → Telegram + email (Zod, honeypot, rate limit)
│   ├── submissions.ts← новые: чтение/управление заявками (Redis)
│   └── tg/
│       ├── webhook.ts← webhook Telegram: auth, роутинг message/callback/photo
│       └── bot.ts    ← логика бота: команды, state machine, CRUD секций
├── src/              ← фронтенд (alias @ → ./src)
│   ├── main.tsx      ← точка входа React
│   ├── App.tsx       ← каркас: Header, Hero, 10 секций, Footer, CMS-загрузка
│   ├── api/cms.ts    ← клиентский fetch /api/content + типы
│   ├── components/   ← UI: Hero, Header, Footer, BookingForm, Starfield, gallery/, scrollytelling/, ui/, icons/
│   ├── sections/     ← 10 контентных секций (+ index.ts barrel)
│   ├── pages/        ← Admin.tsx, Privacy.tsx
│   ├── hooks/        ← useScrollDirection, useReducedMotion, useParallax, useScrollReveal, ...
│   ├── lib/          ← storage.ts (Redis), validation.ts (Zod), cn.ts, escapeHtml.ts, cmsSync.ts, scroll*.ts
│   ├── data/content.ts ← статичный контент (fallback CMS)
│   ├── types/cms.ts  ← все CMS-сущности: Group, Trainer, Subscription, GalleryItem, CmsData...
│   └── index.css     ← Tailwind + анимации
├── tests/            ← Vitest (см. §6)
├── scripts/          ← seed-redis.ts, optimize-media.mjs, set-webhook.mjs, telegram-test.mjs, ocr-reviews.mjs
├── docs/
│   ├── PLAN.md       ← план реализации
│   ├── adr/          ← 0001-google-sheets-as-cms, 0002-serverless-only-no-database, ADR-0003-local-cms
│   └── agents/       ← domain.md, issue-tracker.md, skills-routing.md, triage-labels.md
├── .scratch/         ← issue tracker (markdown issues), черновики, скриншоты-скрипты
├── .agents/ .opencode/ .claude/ ← skills (mattpocock + ui-ux-pro-max)
├── .codegraph/       ← индекс codegraph (SQLite, для агентов)
├── CONTEXT.md        ← доменный глоссарий (обязателен к прочтению)
├── AGENTS.md         ← правила для ИИ-агентов
├── task.md           ← исходное ТЗ
├── vite.config.ts    ← Vite + react + tailwind + localApiPlugin (мок API в dev)
├── vite-plugin-local-api.ts ← dev-мок api/* (перехват /api в dev-сервере)
├── vitest.config.ts  ← 2 проекта: unit (node, *.test.ts) + dom (jsdom, *.test.tsx)
├── vercel.json       ← SPA rewrite → /index.html
└── public/media/     ← оптимизированные WebP
```

## 4. Потоки данных

### 4.1 Чтение контента (сайт)
```
api/content.ts (Redis via storage.ts)  ←  src/api/cms.ts  ←  App.tsx useEffect
        └── fallback: src/data/content.ts (статичный) при ошибке/fetch timeout
```
- `CmsData` (src/types/cms.ts) — договор между Redis, API и фронтом.
- `onContentChanged` (src/lib/cmsSync.ts) — подписка на изменения (рефетч при видимости вкладки).

### 4.2 Заявка (форма)
```
BookingForm.tsx → api/submit-form.ts → { Telegram sendMessage, Resend email }
        маска телефона +7 (…) — lib/validation.ts + Zod, honeypot, rate limit (1/IP/мин)
```

### 4.3 Админка (Telegram-бот)
```
Telegram → api/tg/webhook.ts:
   1) проверка isAdmin(chatId) (storage.ts: настроенный admin chat)
   2) message: /команда → bot.ts handleCommand
   3) message c state → handleCallback (state machine: add/edit/delete/photo)
   4) callback_query → handleCallback + answerCallbackQuery
bot.ts → storage.ts (setAdminState/getAdminState/clearAdminState + CRUD секций)
```

## 5. Ключевые файлы и их роли

| Файл | Роль |
|---|---|
| `api/content.ts` | GET контента: `{ groups, trainers, ... , settings }` из Redis |
| `api/submit-form.ts` | POST заявки: валидация → Telegram → Resend |
| `api/tg/webhook.ts` | Точка входа бота: auth, роутинг, ack всегда 200 |
| `api/tg/bot.ts` | Все команды `/start /menu /schedule ...`, state machine по секциям, клавиатуры |
| `src/lib/storage.ts` | **Единая точка доступа к Redis** (и для API, и для бота) |
| `src/lib/validation.ts` | Zod-схемы (форма заявки, телефон) |
| `src/types/cms.ts` | Типы контента (опора всего фронта) |
| `src/data/content.ts` | Статичный fallback контент |
| `src/api/cms.ts` | Клиентский слой fetch + дефолты |
| `src/App.tsx` | Оркестратор: CMS-загрузка + 10 секций + SEO (Helmet) |
| `src/components/BookingForm.tsx` | Форма записи (диалог в Hero) |
| `src/sections/index.ts` | Barrel всех секций |
| `vite-plugin-local-api.ts` | Dev-мок API (чтобы фронт работал без Vercel) |
| `vitest.config.ts` | 2 проекта тестов: unit(node)/dom(jsdom) |

## 6. Тесты (tests/)

Конфиг: **два проекта** в `vitest.config.ts` — `unit` (node, `*.test.ts`) и `dom` (jsdom, `*.test.tsx`, setup `tests/setup-dom.ts`).

| Файл | Покрывает |
|---|---|
| `validation.test.ts` | Zod-схемы формы |
| `submit-form.test.ts` | хендлер заявки (моки env, fetch) |
| `content-api.test.ts` | GET контента (мок storage.js) |
| `storage.test.ts` | Redis-CRUD (мок fetch/upstash) |
| `submissions-api.test.ts` | новые: обработка заявок (мок storage.js) |
| `tg-webhook.test.ts` | webhook бота (мок storage.js + bot.js) |

Правила моков (важно для новых тестов): пути в `vi.mock(...)` считаются **от файла теста** — `vi.mock('../src/lib/storage.js')` из `tests/`, `vi.mock('../api/tg/bot.js')`. Мок-фабрики через `vi.hoisted`, сброс `mockReset` в `beforeEach`, `stubEnv` для токенов.

## 7. Конвенции и подводные камни

- **Alias `@`** → `./src` (работает в vite, vitest, tsconfig).
- **Единый источник контента** — `src/lib/storage.ts`; API-хендлеры не должны ходить в Redis напрямую.
- **Webhook бота всегда отвечает 200** (даже при ошибках) — иначе Telegram ретраит.
- **Формы**: обязательный чекбокс 152-ФЗ, honeypot, rate limit, маска `+7 (...) ...`.
- **Медиа**: WebP в `public/media/`, сырьё в `raw-assets/` (не коммитится), оптимизация `scripts/optimize-media.mjs`.
- **Три ADR** в `docs/adr/` — читать перед сменой архитектуры (особенно ADR-0003: CMS = локальный + Redis).
- **Домен/глоссарий**: `CONTEXT.md` — термины (форма → заявка, секции, абонементы, etc).

## 8. Где что искать по задачам

| Задача | Смотреть |
|---|---|
| Правка текста/контента | `src/data/content.ts` + `src/types/cms.ts` |
| Новая секция на сайте | `src/sections/*` + barrel `index.ts` + `App.tsx` |
| Баг с формой | `api/submit-form.ts`, `src/lib/validation.ts`, `BookingForm.tsx` |
| Баг с ботом | `api/tg/webhook.ts`, `api/tg/bot.ts`, `src/lib/storage.ts` |
| Redis/контент API | `api/content.ts`, `src/lib/storage.ts`, `api/submissions.ts` |
| Тесты | `vitest.config.ts`, `tests/*` (только `.ts` в unit, `.tsx` в dom) |
| Сборка/деплой | `vercel.json`, `.github/workflows/`, `vite.config.ts` |
| Дизайн/UI | `.opencode/skills/ui-ux-pro-max/`, `.scratch/DESIGN.md`, `src/index.css` |

---

*Сгенерировано для передачи агенту. При больших изменениях структуры — обновить.*