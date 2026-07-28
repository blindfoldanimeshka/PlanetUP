# Skills routing — PlanetUP / OpenCode

Как агенты должны выбирать и применять установленные skills.
Жёсткое правило Context7 — в начале; матрица skills — ниже.

## 0. Context7 — всегда первым (блокирующее)

Перед любым кодом, конфигом, API-вызовом, CLI-командой библиотеки/фреймворка
или правкой UI на стеке проекта агент **обязан**:

1. `resolve-library-id` (MCP `context7`) — найти ID библиотеки.
2. `query-docs` (MCP `context7`) — запросить актуальную документацию под задачу
   и версию из `package.json` / lockfile.
3. Только после этого писать или менять код.

Запрещено опираться на «память модели». Если Context7 недоступен — явно
сказать пользователю и остановиться или спросить разрешение продолжить без
него. Исключения: чистый prose без библиотек; тривиальный git без API-синтаксиса.

Типичные ID для этого репо (уточнять через `resolve-library-id`):

| Пакет | Зачем смотреть |
|---|---|
| React / Vite | компоненты, hooks, HMR |
| Tailwind CSS | утилиты, конфиг, v4 vs v3 |
| Framer Motion | анимации, scrollytelling |
| shadcn/ui / Radix | компоненты, a11y |
| Supabase | auth, client, RLS |

---

## 1. Где лежат skills

| Путь | Назначение | Кто читает |
|---|---|---|
| `.opencode/skills/` | OpenCode-native design/UI pack (локально в проекте) | OpenCode / oh-my-openagent |
| `.agents/skills/` | Engineering + product flows (Matt Pocock) + копия ui-ux pack | Cursor / Claude / агенты с agents skills |
| `.claude/skills/` | Зеркало engineering skills для Claude Code | Claude Code |

Локально в проект поставлены **два пакета**:

1. **ui-ux-pro-max** → развёрнут в `.opencode/skills/` (7 skills) и как
   исходник в `.agents/skills/ui-ux-pro-max-skill/`.
2. **mattpocock/skills** → `.agents/skills/` (+ зеркало `.claude/skills/`),
   зафиксирован в `skills-lock.json`.

---

## 2. Анализ: OpenCode design pack (`.opencode/skills/`)

Роутер пакета — skill `design`. Остальные — узкие специалисты.

| Skill | Как работает | Когда звать |
|---|---|---|
| `ui-ux-pro-max` | Python CLI `scripts/search.py`: design-system, style/color/ux/stack CSV-базы | Новый экран/лендинг, выбор стиля, UX-ревью, stack best practices |
| `design` | Оркестратор: роутит в brand / design-system / ui-styling / logo / CIP / slides / banner / icon | Любой design-запрос без явного субагента |
| `brand` | Voice, visual identity, sync `docs/brand-guidelines.md` → tokens | Тон, гайдлайны, палитра, лого-usage |
| `design-system` | Tokens primitive→semantic→component, CSS vars, validate | Токены, темы, handoff design→code |
| `ui-styling` | shadcn + Tailwind + canvas patterns; CLI add components | Реализация UI в коде (кнопки, формы, layout) |
| `banner-design` | Размеры/стили баннеров, art direction | Соцсети, ads, hero-баннеры |
| `slides` | HTML-слайды + Chart.js + copy formulas | Презентации / pitch |

**Порядок для UI-задач PlanetUP:**

1. Context7 (React/Tailwind/Motion/…).
2. `ui-ux-pro-max` → `--design-system` (и `--persist`, если ещё нет
   `design-system/MASTER.md`).
3. `brand` / `design-system`, если нужны токены/голос бренда.
4. `ui-styling` при реализации в React/Tailwind/shadcn.
5. `banner-design` / `slides` только по явному запросу креатива.

---

## 3. Анализ: engineering pack (`.agents/skills/`)

Главный поток (из `ask-matt`):

```
grill-with-docs → (prototype?) → to-spec → to-tickets → implement(+tdd) → code-review
```

| Кластер | Skills | Когда |
|---|---|---|
| Идея / давление | `grilling`, `grill-me`, `grill-with-docs`, `batch-grill-me` | Уточнить план/дизайн; с кодовой базой — `grill-with-docs` |
| Спеки / тикеты | `to-spec`, `to-tickets`, `to-questionnaire`, `wayfinder`, `triage` | Спека, нарезка, большой план, triage issues |
| Реализация | `implement`, `tdd`, `prototype`, `codebase-design`, `design-an-interface`, `improve-codebase-architecture` | Код, TDD, прототип, углубление модулей |
| Качество | `code-review`, `diagnosing-bugs`, `qa`, `request-refactor-plan` | Ревью, баги, QA-сессия, рефактор-план |
| Домен | `domain-modeling`, `ubiquitous-language` | Глоссарий, ADR, `CONTEXT.md` |
| Исследование | `research` | Primary sources → markdown в репо |
| Сессии | `handoff`, `claude-handoff`, `loop-me` | Передача контекста между сессиями |
| Setup | `setup-matt-pocock-skills`, `setup-pre-commit`, `setup-ts-deep-modules`, `git-guardrails-claude-code` | Разовая настройка репо |
| Письмо | `writing-*`, `edit-article`, `teach` | Текст/обучение (редко для PlanetUP) |
| Роутер | `ask-matt` | Неясно, какой skill нужен |

Для PlanetUP по умолчанию:

- Фича / багфикс → `tdd` + `implement`, затем `code-review`.
- «Сломалось» → `diagnosing-bugs`.
- Неясные требования → `grill-with-docs` (или `grilling`).
- Архитектура модуля → `codebase-design` / `design-an-interface`.
- Не уверен в skill → прочитай `ask-matt` и следуй матрице выше.

---

## 4. Обязательный протокол агента

На каждый user turn:

1. **Классифицируй задачу** (код / UI / бренд / спека / баг / ресёрч).
2. **Context7** — если будет код или API библиотеки (см. §0).
3. **Выбери skill** по матрицам §2–§3; прочитай его `SKILL.md` целиком.
4. **Следуй skill буквально** (чеклисты, CLI, порядок шагов).
5. **Сверься** с `CONTEXT.md`, `task.md`, `docs/adr/` при доменной работе.
6. Не подменяй skill «своим» укороченным процессом.

Если подходит несколько skills — бери самый узкий; для UI сначала
`ui-ux-pro-max`, потом `ui-styling`.
