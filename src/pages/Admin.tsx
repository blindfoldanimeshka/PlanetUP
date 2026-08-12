import { useEffect, useState, type FormEvent } from 'react'
import type { CmsData, SiteSettings } from '@/types/cms'
import { getCmsData } from '@/api/cms'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Helmet } from 'react-helmet-async'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? ''

/* ------------------------------------------------------------------ */
/*  Field config — drives the generic CRUD editors                    */
/* ------------------------------------------------------------------ */

type FieldKind = 'text' | 'textarea' | 'number' | 'url' | 'select' | 'json'

interface FieldDef {
  key: string
  label: string
  kind: FieldKind
  options?: string[]
}

type ArraySectionKey =
  | 'trainers'
  | 'subscriptions'
  | 'groups'
  | 'faq'
  | 'testimonials'
  | 'lifePosts'
  | 'gallery'

interface SectionDef {
  key: ArraySectionKey
  title: string
  fields: FieldDef[]
}

const SECTIONS: SectionDef[] = [
  {
    key: 'trainers',
    title: 'Тренеры',
    fields: [
      { key: 'id', label: 'ID', kind: 'text' },
      { key: 'name', label: 'Имя', kind: 'text' },
      { key: 'specialization', label: 'Специализация', kind: 'text' },
      { key: 'bio', label: 'Биография', kind: 'textarea' },
      { key: 'photoUrl', label: 'Фото (URL)', kind: 'url' },
      { key: 'social', label: 'Соцсеть (URL)', kind: 'url' },
    ],
  },
  {
    key: 'subscriptions',
    title: 'Абонементы',
    fields: [
      { key: 'id', label: 'ID', kind: 'text' },
      { key: 'name', label: 'Название', kind: 'text' },
      { key: 'price', label: 'Цена', kind: 'text' },
      { key: 'description', label: 'Описание', kind: 'textarea' },
      { key: 'conditions', label: 'Условия', kind: 'textarea' },
      { key: 'sortOrder', label: 'Порядок', kind: 'number' },
    ],
  },
  {
    key: 'groups',
    title: 'Группы',
    fields: [
      { key: 'id', label: 'ID', kind: 'text' },
      { key: 'name', label: 'Название', kind: 'text' },
      { key: 'category', label: 'Категория', kind: 'select', options: ['adults', 'kids'] },
      { key: 'level', label: 'Уровень', kind: 'text' },
      { key: 'description', label: 'Описание', kind: 'textarea' },
      { key: 'photoUrl', label: 'Фото (URL)', kind: 'url' },
      { key: 'schedule', label: 'Расписание (JSON)', kind: 'json' },
    ],
  },
  {
    key: 'faq',
    title: 'FAQ',
    fields: [
      { key: 'id', label: 'ID', kind: 'text' },
      { key: 'question', label: 'Вопрос', kind: 'text' },
      { key: 'answer', label: 'Ответ', kind: 'textarea' },
      { key: 'sortOrder', label: 'Порядок', kind: 'number' },
    ],
  },
  {
    key: 'testimonials',
    title: 'Отзывы',
    fields: [
      { key: 'id', label: 'ID', kind: 'text' },
      { key: 'name', label: 'Имя', kind: 'text' },
      { key: 'text', label: 'Текст', kind: 'textarea' },
      { key: 'photoUrl', label: 'Фото (URL)', kind: 'url' },
    ],
  },
  {
    key: 'lifePosts',
    title: 'Жизнь коллектива',
    fields: [
      { key: 'id', label: 'ID', kind: 'text' },
      { key: 'title', label: 'Заголовок', kind: 'text' },
      { key: 'text', label: 'Текст', kind: 'textarea' },
      { key: 'date', label: 'Дата (ISO)', kind: 'text' },
      { key: 'coverPhotoUrl', label: 'Обложка (URL)', kind: 'url' },
      { key: 'albumPhotoUrls', label: 'Альбом (JSON массив URL)', kind: 'json' },
    ],
  },
  {
    key: 'gallery',
    title: 'Галерея',
    fields: [
      { key: 'id', label: 'ID', kind: 'text' },
      { key: 'photoUrl', label: 'Фото (URL)', kind: 'url' },
      { key: 'category', label: 'Категория', kind: 'select', options: ['adults', 'kids', 'competitions'] },
      { key: 'sortOrder', label: 'Порядок', kind: 'number' },
    ],
  },
]

/* ------------------------------------------------------------------ */
/*  Field renderers                                                    */
/* ------------------------------------------------------------------ */

function JsonField({
  label,
  value,
  onChange,
}: {
  label: string
  value: unknown
  onChange: (v: unknown) => void
}) {
  const [text, setText] = useState(() => JSON.stringify(value ?? null, null, 2))
  const [error, setError] = useState('')

  return (
    <div>
      <label className="block text-sm font-medium text-min-muted">{label}</label>
      <textarea
        className={`mt-1 w-full rounded-md border bg-min-surface p-2 font-mono text-xs text-min-text ${
          error ? 'border-min-error' : 'border-min-border'
        }`}
        rows={4}
        value={text}
        onChange={(e) => {
          const t = e.target.value
          setText(t)
          try {
            onChange(JSON.parse(t))
            setError('')
          } catch {
            setError('Некорректный JSON')
          }
        }}
      />
      {error && <p className="mt-1 text-xs text-min-error">{error}</p>}
    </div>
  )
}

function FieldEditor({
  field,
  value,
  onChange,
}: {
  field: FieldDef
  value: unknown
  onChange: (v: unknown) => void
}) {
  const base = 'mt-1 w-full rounded-md border border-min-border bg-min-surface p-2 text-min-text'

  if (field.kind === 'textarea') {
    return (
      <div>
        <label className="block text-sm font-medium text-min-muted">{field.label}</label>
        <textarea
          className={`${base} mt-1`}
          rows={3}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    )
  }

  if (field.kind === 'json') {
    return <JsonField label={field.label} value={value} onChange={onChange} />
  }

  if (field.kind === 'select') {
    return (
      <div>
        <label className="block text-sm font-medium text-min-muted">{field.label}</label>
        <select
          className={`${base} mt-1`}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
      </div>
    )
  }

  const inputType = field.kind === 'number' ? 'number' : field.kind === 'url' ? 'url' : 'text'
  return (
    <div>
      <label className="block text-sm font-medium text-min-muted">{field.label}</label>
      <input
        type={inputType}
        className={`${base} mt-1`}
        value={field.kind === 'number' ? Number(value ?? 0) : String(value ?? '')}
        onChange={(e) =>
          onChange(field.kind === 'number' ? Number(e.target.value) : e.target.value)
        }
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section + Settings editors                                         */
/* ------------------------------------------------------------------ */

function ArraySection({
  def,
  items,
  onChange,
}: {
  def: SectionDef
  items: Record<string, unknown>[]
  onChange: (next: Record<string, unknown>[]) => void
}) {
  const update = (idx: number, patch: Record<string, unknown>) => {
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  }
  const remove = (idx: number) => onChange(items.filter((_, i) => i !== idx))
  const add = () => {
    const blank: Record<string, unknown> = { id: `new-${Date.now()}` }
    def.fields.forEach((f) => {
      if (f.key === 'id') return
      blank[f.key] = f.kind === 'number' ? 0 : f.kind === 'json' ? [] : ''
    })
    onChange([...items, blank])
  }

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-min-text">{def.title}</h2>
        <Button variant="secondary" size="sm" onClick={add}>
          + Добавить
        </Button>
      </div>
      <div className="space-y-4">
        {items.map((it, idx) => (
          <div key={String(it.id ?? idx)} className="rounded-lg border border-min-border p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm text-min-muted">
                #{idx + 1} · {String(it.id ?? 'без id')}
              </span>
              <Button variant="ghost" size="sm" onClick={() => remove(idx)}>
                Удалить
              </Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {def.fields.map((f) => (
                <FieldEditor
                  key={f.key}
                  field={f}
                  value={it[f.key]}
                  onChange={(v) => update(idx, { [f.key]: v })}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

function SettingsEditor({
  settings,
  onChange,
}: {
  settings: SiteSettings
  onChange: (s: SiteSettings) => void
}) {
  const set = <K extends keyof SiteSettings>(k: K, v: SiteSettings[K]) =>
    onChange({ ...settings, [k]: v })
  const setSocial = (k: keyof SiteSettings['social'], v: string) =>
    onChange({ ...settings, social: { ...settings.social, [k]: v } })
  const setHero = (k: keyof SiteSettings['hero'], v: string) =>
    onChange({ ...settings, hero: { ...settings.hero, [k]: v } })
  const setSeo = (k: keyof SiteSettings['seo'], v: string) =>
    onChange({ ...settings, seo: { ...settings.seo, [k]: v } })

  const input = (label: string, value: string, cb: (v: string) => void) => (
    <div>
      <label className="block text-sm font-medium text-min-muted">{label}</label>
      <input
        className="mt-1 w-full rounded-md border border-min-border bg-min-surface p-2 text-min-text"
        value={value}
        onChange={(e) => cb(e.target.value)}
      />
    </div>
  )

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-min-text">Контакты и SEO</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {input('Телефон', settings.phone, (v) => set('phone', v))}
        {input('Телефон (href)', settings.phoneHref, (v) => set('phoneHref', v))}
        {input('Адрес', settings.address, (v) => set('address', v))}
        {input('Email', settings.email, (v) => set('email', v))}
        {input('VK', settings.social.vk, (v) => setSocial('vk', v))}
        {input('Telegram', settings.social.telegram, (v) => setSocial('telegram', v))}
        {input('WhatsApp', settings.social.whatsapp, (v) => setSocial('whatsapp', v))}
        {input('Hero: заголовок', settings.hero.title, (v) => setHero('title', v))}
        {input('Hero: подзаголовок', settings.hero.subtitle, (v) => setHero('subtitle', v))}
        {input('SEO: заголовок', settings.seo.title, (v) => setSeo('title', v))}
        {input('SEO: описание', settings.seo.description, (v) => setSeo('description', v))}
      </div>
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Admin shell                                                        */
/* ------------------------------------------------------------------ */

export function Admin() {
  const [authed, setAuthed] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem('admin_authed') === '1',
  )
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')
  const [data, setData] = useState<CmsData | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    if (authed) {
      getCmsData()
        .then(setData)
        .catch(() => setData(null))
    }
  }, [authed])

  const login = (e: FormEvent) => {
    e.preventDefault()
    if (ADMIN_PASSWORD && pwd === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_authed', '1')
      setAuthed(true)
    } else {
      setErr('Неверный пароль')
    }
  }

  const logout = () => {
    sessionStorage.removeItem('admin_authed')
    setAuthed(false)
    setData(null)
  }

  const save = async () => {
    if (!data) return
    setStatus('saving')
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'content-type': 'application/json', 'x-admin-token': ADMIN_PASSWORD },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <Helmet>
        <title>Админ — Планета UP</title>
      </Helmet>

      {!authed ? (
        <main className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-24">
          <h1 className="text-2xl font-bold text-min-text">Вход в админ-панель</h1>
          <form onSubmit={login} className="flex flex-col gap-3">
            <input
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Пароль"
              className="rounded-md border border-min-border bg-min-surface p-2 text-min-text"
            />
            {err && <p className="text-sm text-min-error">{err}</p>}
            {!ADMIN_PASSWORD && (
              <p className="text-xs text-min-muted">
                Задайте VITE_ADMIN_PASSWORD (и ADMIN_API_TOKEN на сервере) в .env.
              </p>
            )}
            <Button type="submit">Войти</Button>
          </form>
        </main>
      ) : !data ? (
        <main className="mx-auto max-w-sm px-4 py-24 text-min-muted">Загрузка контента…</main>
      ) : (
        <main className="mx-auto max-w-4xl px-4 py-10">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-min-text">Админ-панель «Планета UP»</h1>
            <div className="flex gap-2">
              <Button onClick={save} disabled={status === 'saving'}>
                {status === 'saving' ? 'Сохранение…' : 'Сохранить'}
              </Button>
              <Button variant="ghost" onClick={logout}>
                Выйти
              </Button>
            </div>
          </div>

          {status === 'saved' && (
            <p className="mb-4 rounded bg-white/10 p-2 text-sm text-min-accent">Сохранено ✓</p>
          )}
          {status === 'error' && (
            <p className="mb-4 rounded bg-min-error/10 p-2 text-sm text-min-error">
              Ошибка сохранения (проверьте ADMIN_API_TOKEN на сервере)
            </p>
          )}

          <div className="space-y-6">
            <SettingsEditor
              settings={data.settings}
              onChange={(s) => setData((d) => (d ? { ...d, settings: s } : d))}
            />
            {SECTIONS.map((def) => (
              <ArraySection
                key={def.key}
                def={def}
                items={data[def.key] as unknown as Record<string, unknown>[]}
                onChange={(next) =>
                  setData((d) => (d ? ({ ...d, [def.key]: next } as CmsData) : d))
                }
              />
            ))}
          </div>
        </main>
      )}
    </>
  )
}
