# PlanetUP — agent notes

Сайт студии акробатики «Планета UP». Исходное ТЗ: `task.md`.

## Context7 (обязательно)

Перед любым кодом/API библиотеки: `resolve-library-id` → `query-docs` (MCP `context7`).
Не писать код по памяти модели. Если Context7 недоступен — сказать явно.
Полное правило: OpenCode `rules/skills-and-context7.md` и `docs/agents/skills-routing.md`.

## Skills

Агенты **обязаны** выбирать skill по задаче и следовать его `SKILL.md`.

| Пакет | Путь | Для чего |
|---|---|---|
| ui-ux-pro-max (локально) | `.opencode/skills/` | UI/UX, brand, tokens, shadcn/Tailwind, banners, slides |
| mattpocock/skills | `.agents/skills/` (+ `.claude/skills/`) | grill → spec → tickets → TDD → review, domain, QA |

Маршрутизация и анализ работы: **`docs/agents/skills-routing.md`**.

Кратко для PlanetUP:

- UI/лендинг/секции сайта → `ui-ux-pro-max` → `ui-styling` (+ Context7 на React/Tailwind/Motion)
- Фича/багфикс → `tdd` / `implement` → `code-review`
- Неясные требования → `grill-with-docs`
- Баг «не работает» → `diagnosing-bugs`
- Неясно какой skill → `ask-matt`

## Agent skills (инфраструктура трекера)

### Issue tracker

Issues и specs живут как markdown в `.scratch/`. См. `docs/agents/issue-tracker.md`.

### Triage labels

Дефолтные роли: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. См. `docs/agents/triage-labels.md`.

### Domain docs

Single-context: корневой `CONTEXT.md` + `docs/adr/`. См. `docs/agents/domain.md`.
