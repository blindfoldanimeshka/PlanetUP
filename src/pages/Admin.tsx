import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react'
import type {
  CmsData,
  SiteSettings,
  ScheduleItem,
  DayOfWeek,
} from '@/types/cms'
import { getCmsData } from '@/api/cms'
import { notifyContentChanged } from '@/lib/cmsSync'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Helmet } from 'react-helmet-async'

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? ''

const DAYS: DayOfWeek[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

/* ------------------------------------------------------------------ */
/*  Field config — drives the generic CRUD editors                    */
/* ------------------------------------------------------------------ */

type FieldKind =
  | 'text'
  | 'textarea'
  | 'number'
  | 'url'
  | 'select'
  | 'schedule'
  | 'urllist'

interface FieldDef {
  key: string
  label: string
  kind: FieldKind
  options?: string[]
  /** Friendly labels for `select` options keyed by option value. */
  optionLabels?: Record<string, string>
  required?: boolean
  placeholder?: string
  /** Render a small image thumbnail under the URL input. */
  preview?: boolean
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
  blank: () => Record<string, unknown>
}

const SECTIONS: SectionDef[] = [
  {
    key: 'trainers',
    title: 'Тренеры',
    blank: () => ({ id: `new-${Date.now()}`, name: '', specialization: '', bio: '', photoUrl: '', social: '' }),
    fields: [
      { key: 'name', label: 'Имя', kind: 'text', required: true },
      { key: 'specialization', label: 'Роль / специализация', kind: 'text', required: true },
      { key: 'bio', label: 'Описание', kind: 'textarea' },
      { key: 'photoUrl', label: 'Фото', kind: 'url', required: true, placeholder: 'Ссылка на изображение', preview: true },
      { key: 'social', label: 'Ссылка на соцсеть', kind: 'url', placeholder: 'https://vk.com/...' },
    ],
  },
  {
    key: 'subscriptions',
    title: 'Абонементы',
    blank: () => ({ id: `new-${Date.now()}`, name: '', price: '', description: '', conditions: '', sortOrder: 0 }),
    fields: [
      { key: 'name', label: 'Название', kind: 'text', required: true },
      { key: 'price', label: 'Цена', kind: 'text', required: true, placeholder: '4 500 ₽' },
      { key: 'description', label: 'Описание', kind: 'textarea', required: true },
      { key: 'conditions', label: 'Условия', kind: 'textarea' },
      { key: 'sortOrder', label: 'Порядок показа', kind: 'number', required: true },
    ],
  },
  {
    key: 'groups',
    title: 'Группы',
    blank: () => ({
      id: `new-${Date.now()}`,
      name: '',
      category: 'adults',
      level: '',
      description: '',
      photoUrl: '',
      schedule: [] as ScheduleItem[],
    }),
    fields: [
      { key: 'name', label: 'Название', kind: 'text', required: true },
      { key: 'category', label: 'Категория', kind: 'select', options: ['adults', 'kids'], optionLabels: { adults: 'Взрослые', kids: 'Дети' }, required: true },
      { key: 'level', label: 'Уровень', kind: 'text', required: true },
      { key: 'description', label: 'Описание', kind: 'textarea', required: true },
      { key: 'photoUrl', label: 'Фото', kind: 'url', required: true, placeholder: 'Ссылка на изображение', preview: true },
      { key: 'schedule', label: 'Расписание', kind: 'schedule' },
    ],
  },
  {
    key: 'faq',
    title: 'Вопросы и ответы',
    blank: () => ({ id: `new-${Date.now()}`, question: '', answer: '', sortOrder: 0 }),
    fields: [
      { key: 'question', label: 'Вопрос', kind: 'text', required: true },
      { key: 'answer', label: 'Ответ', kind: 'textarea', required: true },
      { key: 'sortOrder', label: 'Порядок показа', kind: 'number', required: true },
    ],
  },
  {
    key: 'testimonials',
    title: 'Отзывы',
    blank: () => ({ id: `new-${Date.now()}`, name: '', text: '', photoUrl: '' }),
    fields: [
      { key: 'name', label: 'Имя', kind: 'text', required: true },
      { key: 'text', label: 'Текст отзыва', kind: 'textarea', required: true },
      { key: 'photoUrl', label: 'Фото', kind: 'url', placeholder: 'Ссылка на изображение', preview: true },
    ],
  },
  {
    key: 'lifePosts',
    title: 'Жизнь коллектива',
    blank: () => ({
      id: `new-${Date.now()}`,
      title: '',
      text: '',
      date: new Date().toISOString().slice(0, 10),
      coverPhotoUrl: '',
      albumPhotoUrls: [] as string[],
    }),
    fields: [
      { key: 'title', label: 'Заголовок', kind: 'text', required: true },
      { key: 'text', label: 'Текст', kind: 'textarea', required: true },
      { key: 'date', label: 'Дата', kind: 'text', required: true, placeholder: 'ГГГГ-ММ-ДД, напр. 2026-07-04' },
      { key: 'coverPhotoUrl', label: 'Обложка', kind: 'url', required: true, placeholder: 'Ссылка на изображение', preview: true },
      { key: 'albumPhotoUrls', label: 'Фотографии альбома', kind: 'urllist' },
    ],
  },
  {
    key: 'gallery',
    title: 'Галерея',
    blank: () => ({ id: `new-${Date.now()}`, photoUrl: '', category: 'adults', sortOrder: 0 }),
    fields: [
      { key: 'photoUrl', label: 'Фото', kind: 'url', required: true, placeholder: 'Ссылка на изображение', preview: true },
      { key: 'category', label: 'Категория', kind: 'select', options: ['adults', 'kids', 'competitions'], optionLabels: { adults: 'Взрослые', kids: 'Дети', competitions: 'Соревнования' }, required: true },
      { key: 'sortOrder', label: 'Порядок показа', kind: 'number', required: true },
    ],
  },
]

type NavKey = 'settings' | ArraySectionKey | 'submissions'

const NAV: { key: NavKey; title: string }[] = [
  { key: 'settings', title: 'Контакты и SEO' },
  ...SECTIONS.map((s) => ({ key: s.key as NavKey, title: s.title })),
  { key: 'submissions', title: 'Заявки' },
]

/* ------------------------------------------------------------------ */
/*  Validation                                                         */
/* ------------------------------------------------------------------ */

function validateItem(fields: FieldDef[], item: Record<string, unknown>): Record<string, string> {
  const errs: Record<string, string> = {}
  for (const f of fields) {
    const v = item[f.key]
    if (f.required) {
      const empty =
        v === undefined ||
        v === null ||
        (typeof v === 'string' && v.trim() === '') ||
        (f.kind === 'number' && (v === '' || isNaN(Number(v))))
      if (empty) errs[f.key] = 'Обязательно'
    }
    if (
      f.kind === 'url' &&
      typeof v === 'string' &&
      v.trim() !== '' &&
      !/^(https?:\/\/|\/)/.test(v.trim())
    ) {
      errs[f.key] = 'URL должен начинаться с http(s):// или /'
    }
  }
  return errs
}

/* ------------------------------------------------------------------ */
/*  Field renderers                                                    */
/* ------------------------------------------------------------------ */

function ImagePreview({ url }: { url: string }) {
  if (!url || !/^(https?:\/\/|\/)/.test(url.trim())) return null
  return (
    <img
      src={url}
      alt=""
      className="mt-2 h-20 w-20 rounded-md border border-min-border object-cover"
      onError={(e) => {
        ;(e.currentTarget as HTMLImageElement).style.display = 'none'
      }}
    />
  )
}

function ScheduleEditor({
  value,
  onChange,
}: {
  value: ScheduleItem[]
  onChange: (v: ScheduleItem[]) => void
}) {
  const update = (i: number, patch: Partial<ScheduleItem>) =>
    onChange(value.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const add = () => onChange([...value, { day: 'Пн', time: '', note: '' }])

  return (
    <div>
      <div className="space-y-2">
        {value.map((s, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <select
              className="rounded-md border border-min-border bg-min-surface p-2 text-min-text"
              value={s.day}
              onChange={(e) => update(i, { day: e.target.value as DayOfWeek })}
            >
              {DAYS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Время, напр. 19:00–20:30"
              className="min-w-[140px] flex-1 rounded-md border border-min-border bg-min-surface p-2 text-min-text"
              value={s.time}
              onChange={(e) => update(i, { time: e.target.value })}
            />
            <input
              type="text"
              placeholder="Заметка (необязательно)"
              className="min-w-[140px] flex-1 rounded-md border border-min-border bg-min-surface p-2 text-min-text"
              value={s.note ?? ''}
              onChange={(e) => update(i, { note: e.target.value })}
            />
            <Button variant="ghost" size="sm" onClick={() => remove(i)} aria-label="Удалить слот">
              ✕
            </Button>
          </div>
        ))}
      </div>
      <Button variant="secondary" size="sm" className="mt-2" onClick={add}>
        + Слот
      </Button>
    </div>
  )
}

function UrlListEditor({
  value,
  onChange,
  label,
}: {
  value: string[]
  onChange: (v: string[]) => void
  label: string
}) {
  const update = (i: number, v: string) => onChange(value.map((x, idx) => (idx === i ? v : x)))
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i))
  const add = () => onChange([...value, ''])

  return (
    <div>
      <label className="block text-sm font-medium text-min-muted">{label}</label>
      <div className="mt-1 space-y-2">
        {value.map((u, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="url"
              className="flex-1 rounded-md border border-min-border bg-min-surface p-2 text-min-text"
              value={u}
              placeholder="/media/..."
              onChange={(e) => update(i, e.target.value)}
            />
            <Button variant="ghost" size="sm" onClick={() => remove(i)} aria-label="Удалить URL">
              ✕
            </Button>
          </div>
        ))}
      </div>
      <Button variant="secondary" size="sm" className="mt-2" onClick={add}>
        + URL
      </Button>
    </div>
  )
}

function FieldEditor({
  field,
  value,
  error,
  onChange,
}: {
  field: FieldDef
  value: unknown
  error?: string
  onChange: (v: unknown) => void
}) {
  const labelCls = 'block text-sm font-medium text-min-muted'
  const inputCls = `mt-1 w-full rounded-md border bg-min-surface p-2 text-min-text ${
    error ? 'border-min-error' : 'border-min-border'
  }`

  if (field.kind === 'schedule') {
    return (
      <div>
        <label className={labelCls}>{field.label}</label>
        <div className="mt-1">
          <ScheduleEditor value={(value as ScheduleItem[]) ?? []} onChange={onChange} />
        </div>
        {error && <p className="mt-1 text-xs text-min-error">{error}</p>}
      </div>
    )
  }

  if (field.kind === 'urllist') {
    return (
      <UrlListEditor value={(value as string[]) ?? []} onChange={onChange} label={field.label} />
    )
  }

  if (field.kind === 'textarea') {
    return (
      <div>
        <label className={labelCls}>{field.label}</label>
        <textarea
          className={`${inputCls} mt-1`}
          rows={3}
          value={String(value ?? '')}
          placeholder={field.placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
        {error && <p className="mt-1 text-xs text-min-error">{error}</p>}
      </div>
    )
  }

  if (field.kind === 'select') {
    return (
      <div>
        <label className={labelCls}>{field.label}</label>
        <select
          className={`${inputCls} mt-1`}
          value={String(value ?? '')}
          onChange={(e) => onChange(e.target.value)}
        >
          {field.options?.map((o) => (
            <option key={o} value={o}>
              {field.optionLabels?.[o] ?? o}
            </option>
          ))}
        </select>
        {error && <p className="mt-1 text-xs text-min-error">{error}</p>}
      </div>
    )
  }

  const inputType = field.kind === 'url' ? 'url' : field.kind === 'number' ? 'number' : 'text'
  const strValue = field.kind === 'number' ? String(Number(value ?? 0)) : String(value ?? '')
  return (
    <div>
      <label className={labelCls}>
        {field.label}
        {field.required && <span className="text-min-accent"> *</span>}
      </label>
      <input
        type={inputType}
        className={`${inputCls} mt-1`}
        value={strValue}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.kind === 'number' ? Number(e.target.value) : e.target.value)}
      />
      {field.preview && <ImagePreview url={strValue} />}
      {error && <p className="mt-1 text-xs text-min-error">{error}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section editor (generic CRUD list)                                 */
/* ------------------------------------------------------------------ */

function CrudList({
  def,
  items,
  onChange,
}: {
  def: SectionDef
  items: Record<string, unknown>[]
  onChange: (next: Record<string, unknown>[]) => void
}) {
  const errors = useMemo(() => items.map((it) => validateItem(def.fields, it)), [items, def])
  const hasErrors = errors.some((e) => Object.keys(e).length > 0)

  const update = (idx: number, patch: Record<string, unknown>) =>
    onChange(items.map((it, i) => (i === idx ? { ...it, ...patch } : it)))
  const remove = (idx: number) => {
    const label = String(items[idx].id ?? `#${idx + 1}`)
    if (confirm(`Удалить запись «${label}»?`)) onChange(items.filter((_, i) => i !== idx))
  }
  const duplicate = (idx: number) => {
    const copy = { ...items[idx], id: `copy-${Date.now()}` }
    const next = [...items]
    next.splice(idx + 1, 0, copy)
    onChange(next)
  }
  const move = (idx: number, dir: -1 | 1) => {
    const target = idx + dir
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[idx], next[target]] = [next[target], next[idx]]
    onChange(next)
  }
  const add = () => onChange([...items, def.blank()])

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-min-text">
          {def.title}
          {hasErrors && <span className="ml-2 align-middle text-xs text-min-error">есть ошибки</span>}
        </h2>
        <Button variant="secondary" size="sm" onClick={add}>
          + Добавить
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-min-muted">Пока нет записей.</p>
      ) : (
        <div className="space-y-4">
          {items.map((it, idx) => (
            <div key={String(it.id ?? idx)} className="rounded-lg border border-min-border p-4">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-sm text-min-muted">
                  #{idx + 1} · {String(it.id ?? 'без id')}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => move(idx, -1)}
                    disabled={idx === 0}
                    aria-label="Переместить вверх"
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => move(idx, 1)}
                    disabled={idx === items.length - 1}
                    aria-label="Переместить вниз"
                  >
                    ↓
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => duplicate(idx)}>
                    Дублировать
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => remove(idx)}>
                    Удалить
                  </Button>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {def.fields.map((f) => (
                  <FieldEditor
                    key={f.key}
                    field={f}
                    value={it[f.key]}
                    error={errors[idx][f.key]}
                    onChange={(v) => update(idx, { [f.key]: v })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  )
}

/* ------------------------------------------------------------------ */
/*  Settings (contacts / hero / seo) editor                            */
/* ------------------------------------------------------------------ */

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

  const input = (label: string, value: string, cb: (v: string) => void, placeholder?: string) => (
    <div>
      <label className="block text-sm font-medium text-min-muted">{label}</label>
      <input
        className="mt-1 w-full rounded-md border border-min-border bg-min-surface p-2 text-min-text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => cb(e.target.value)}
      />
    </div>
  )

  return (
    <Card className="p-6">
      <h2 className="mb-4 text-xl font-semibold text-min-text">Контакты и SEO</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        {input('Телефон', settings.phone, (v) => set('phone', v))}
        {input('Телефон (href)', settings.phoneHref, (v) => set('phoneHref', v), 'tel:+7...')}
        {input('Адрес', settings.address, (v) => set('address', v))}
        {input('Email', settings.email, (v) => set('email', v), 'name@mail.ru')}
        {input('VK', settings.social.vk, (v) => setSocial('vk', v), 'https://vk.com/...')}
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

/* ------------------------------------------------------------------ */
/*  Submissions (booking inquiries) viewer                             */
/* ------------------------------------------------------------------ */

interface SubmissionView {
  id: string
  createdAt: string
  status?: 'new' | 'processed'
  payload: Record<string, unknown>
}

const SOURCE_LABELS: Record<string, string> = {
  vk: 'ВКонтакте',
  instagram: 'Instagram',
  telegram: 'Telegram',
  friends: 'От друзей/знакомых',
  search: 'Поиск',
  advert: 'Реклама',
  other: 'Другое',
}

function SubmissionCard({
  sub,
  onDelete,
  onToggleStatus,
}: {
  sub: SubmissionView
  onDelete: () => void
  onToggleStatus: () => void
}) {
  const p = sub.payload as Record<string, string>
  const isChild = p.formType === 'child'
  const name = isChild ? p.childName : p.name
  const phone = p.phone ?? ''
  const created = new Date(sub.createdAt).toLocaleString('ru-RU')

  const line = (label: string, value?: string) =>
    value ? (
      <div>
        <span className="text-min-muted">{label}: </span>
        <span className="text-min-text">{value}</span>
      </div>
    ) : null

  return (
    <Card className="p-5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-min-text">
            {isChild ? 'Ребёнок' : 'Взрослый'} · {name ?? '—'}
          </h3>
          <p className="text-xs text-min-muted">{created}</p>
        </div>
        <div className="flex items-center gap-1">
          <span
            className={`rounded px-2 py-0.5 text-xs ${
              sub.status === 'processed'
                ? 'bg-white/10 text-min-muted'
                : 'bg-min-accent/20 text-min-accent'
            }`}
          >
            {sub.status === 'processed' ? 'Обработана' : 'Новая'}
          </span>
          <Button variant="ghost" size="sm" onClick={onToggleStatus}>
            {sub.status === 'processed' ? 'Вернуть' : 'Обработана'}
          </Button>
          <Button variant="ghost" size="sm" onClick={onDelete} aria-label="Удалить заявку">
            Удалить
          </Button>
        </div>
      </div>
      <div className="space-y-1 text-sm">
        {phone && (
          <div>
            <span className="text-min-muted">Телефон: </span>
            <a className="text-min-accent" href={`tel:${phone.replace(/\D/g, '')}`}>
              {phone}
            </a>
          </div>
        )}
        {line('Возраст', p.age)}
        {line('Откуда узнали', SOURCE_LABELS[p.source] ?? p.source)}
        {isChild && line('Родитель', p.parentName)}
        {isChild &&
          line('Был опыт', p.hasExperience === 'yes' ? 'Да' : p.hasExperience === 'no' ? 'Нет' : undefined)}
        {isChild && line('Опыт', p.experienceDetails)}
        {!isChild && line('Спортивный опыт', p.previousSportExperience)}
        {!isChild && line('Травмы / ограничения', p.injuries)}
      </div>
    </Card>
  )
}

function SubmissionsViewer() {
  const [items, setItems] = useState<SubmissionView[] | null>(null)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState<'all' | 'new' | 'processed'>('all')

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/submissions', {
        headers: { 'x-admin-token': ADMIN_PASSWORD },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setItems((await res.json()) as SubmissionView[])
    } catch {
      setError('Не удалось загрузить заявки (проверьте ADMIN_API_TOKEN на сервере)')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const remove = async (id: string) => {
    if (!confirm('Удалить заявку?')) return
    await fetch(`/api/submissions?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'x-admin-token': ADMIN_PASSWORD },
    })
    load()
  }

  const toggleStatus = async (id: string, current: 'new' | 'processed') => {
    const next = current === 'new' ? 'processed' : 'new'
    await fetch(`/api/submissions?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json', 'x-admin-token': ADMIN_PASSWORD },
      body: JSON.stringify({ status: next }),
    })
    load()
  }

  if (error) return <p className="text-sm text-min-error">{error}</p>
  if (!items) return <p className="text-min-muted">Загрузка…</p>

  const visible = (items ?? []).filter((s) => filter === 'all' || (s.status ?? 'new') === filter)
  const counts = {
    all: items?.length ?? 0,
    new: items?.filter((s) => (s.status ?? 'new') === 'new').length ?? 0,
    processed: items?.filter((s) => s.status === 'processed').length ?? 0,
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(['all', 'new', 'processed'] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-lg px-3 py-1.5 text-sm transition-colors ${
              filter === f ? 'bg-min-accent/20 text-min-accent' : 'text-min-muted hover:bg-white/5'
            }`}
          >
            {f === 'all' ? 'Все' : f === 'new' ? 'Новые' : 'Обработанные'} ({counts[f]})
          </button>
        ))}
      </div>
      {visible.length === 0 ? (
        <p className="text-min-muted">Заявок в этом фильтре нет.</p>
      ) : (
        visible.map((s) => (
          <SubmissionCard
            key={s.id}
            sub={s}
            onDelete={() => remove(s.id)}
            onToggleStatus={() =>
              toggleStatus(s.id, (s.status ?? 'new') as 'new' | 'processed')
            }
          />
        ))
      )}
    </div>
  )
}

export function Admin() {
  const [authed, setAuthed] = useState(
    () => typeof sessionStorage !== 'undefined' && sessionStorage.getItem('admin_authed') === '1',
  )
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')
  const [data, setData] = useState<CmsData | null>(null)
  const [initial, setInitial] = useState<CmsData | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [active, setActive] = useState<NavKey>('settings')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (authed) {
      getCmsData()
        .then((d) => {
          setData(d)
          setInitial(d)
        })
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
    setInitial(null)
  }

  const reload = async () => {
    const d = await getCmsData()
    setData(d)
    setInitial(d)
    setStatus('idle')
  }

  const dirty = data && initial ? JSON.stringify(data) !== JSON.stringify(initial) : false

  const globalErrors = useMemo(() => {
    if (!data) return 0
    let count = 0
    for (const s of SECTIONS) {
      const items = (data[s.key] as unknown as Record<string, unknown>[]) ?? []
      for (const it of items) count += Object.keys(validateItem(s.fields, it)).length
    }
    return count
  }, [data])

  const save = async () => {
    if (!data) return
    if (globalErrors > 0) {
      setStatus('error')
      return
    }
    setStatus('saving')
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'content-type': 'application/json', 'x-admin-token': ADMIN_PASSWORD },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setInitial(data)
      setStatus('saved')
      notifyContentChanged()
    } catch {
      setStatus('error')
    }
  }

  const exportJson = () => {
    if (!data) return
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `planetup-cms-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const onImportFile = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as CmsData
      if (!confirm('Заменить весь контент импортированным файлом? Несохранённые изменения будут потеряны.')) {
        return
      }
      setData(parsed)
      setStatus('idle')
    } catch {
      alert('Некорректный JSON-файл')
    } finally {
      e.target.value = ''
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
        <main className="mx-auto max-w-6xl px-4 py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-bold text-min-text">Админ-панель «Планета UP»</h1>
            <div className="flex flex-wrap items-center gap-2">
              {dirty && <span className="text-xs text-min-accent">● Несохранённые</span>}
              {globalErrors > 0 && (
                <span className="text-xs text-min-error">Ошибки: {globalErrors}</span>
              )}
              <Button variant="ghost" onClick={exportJson}>
                Экспорт
              </Button>
              <Button variant="ghost" onClick={() => fileRef.current?.click()}>
                Импорт
              </Button>
              <input
                ref={fileRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={onImportFile}
              />
              <Button variant="ghost" onClick={reload} disabled={status === 'saving'}>
                Отменить
              </Button>
              <Button
                onClick={save}
                disabled={status === 'saving' || !dirty || globalErrors > 0}
              >
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
              Ошибка сохранения. Проверьте ADMIN_API_TOKEN на сервере и исправьте ошибки валидации.
            </p>
          )}

          <div className="grid gap-6 md:grid-cols-[200px_1fr]">
            <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
              {NAV.map((n) => (
                <button
                  key={n.key}
                  type="button"
                  onClick={() => setActive(n.key)}
                  className={`whitespace-nowrap rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                    active === n.key
                      ? 'bg-min-accent/20 text-min-accent'
                      : 'text-min-muted hover:bg-white/5'
                  }`}
                >
                  {n.title}
                </button>
              ))}
            </nav>

            <div>
              {active === 'settings' ? (
                <SettingsEditor
                  settings={data.settings}
                  onChange={(s) => setData((d) => (d ? { ...d, settings: s } : d))}
                />
              ) : active === 'submissions' ? (
                <SubmissionsViewer />
              ) : (
                (() => {
                  const def = SECTIONS.find((s) => s.key === active)
                  if (!def) return null
                  const items = (data[def.key] as unknown as Record<string, unknown>[]) ?? []
                  return (
                    <CrudList
                      def={def}
                      items={items}
                      onChange={(n) => setData((d) => (d ? ({ ...d, [def.key]: n } as CmsData) : d))}
                    />
                  )
                })()
              )}
            </div>
          </div>
        </main>
      )}
    </>
  )
}
