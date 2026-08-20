import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent, type FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
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
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { Helmet } from 'react-helmet-async'

const ADMIN_CSRF_STORAGE_KEY = 'planetup_admin_csrf'

function adminHeaders(contentType = false): HeadersInit {
  const csrfToken = typeof sessionStorage === 'undefined'
    ? ''
    : sessionStorage.getItem(ADMIN_CSRF_STORAGE_KEY) ?? ''
  return {
    ...(contentType ? { 'content-type': 'application/json' } : {}),
    'x-csrf-token': csrfToken,
  }
}

const DAYS: DayOfWeek[] = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

/* ------------------------------------------------------------------ */
/*  Image upload (drag&drop → resized data URL)                        */
/* ------------------------------------------------------------------ */

/**
 * Reads an image file, downscales it to `maxDim` on the longest side and
 * re-encodes it as a data URL so it can be stored directly in the CMS JSON
 * (no separate upload backend required). Falls back to JPEG when the browser
 * can't encode WebP.
 */
async function resizeImageToDataUrl(file: File, maxDim = 1280, quality = 0.82): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Можно загружать только изображения')
  }
  if (file.size > 6 * 1024 * 1024) {
    throw new Error('Файл слишком большой (максимум 6 МБ)')
  }
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Не удалось прочитать файл'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Не удалось загрузить изображение'))
      img.onload = () => {
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement('canvas')
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas недоступен'))
          return
        }
        ctx.drawImage(img, 0, 0, w, h)
        const webp = canvas.toDataURL('image/webp', quality)
        resolve(webp.startsWith('data:image/webp') ? webp : canvas.toDataURL('image/jpeg', quality))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

/** Friendly display name for a CRUD item — never the internal id. */
function itemTitle(it: Record<string, unknown>): string {
  for (const k of ['name', 'title', 'question', 'specialization'] as const) {
    const v = it[k]
    if (typeof v === 'string' && v.trim() !== '') return v.trim()
  }
  return ''
}

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
  | 'imagelist'
  | 'image'

interface FieldDef {
  key: string
  label: string
  kind: FieldKind
  options?: string[]
  /** Friendly labels for `select` options keyed by option value. */
  optionLabels?: Record<string, string>
  required?: boolean
  placeholder?: string
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
      { key: 'photoUrl', label: 'Фото', kind: 'image', required: true },
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
      { key: 'photoUrl', label: 'Фото', kind: 'image', required: true },
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
      { key: 'photoUrl', label: 'Фото', kind: 'image' },
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
      { key: 'coverPhotoUrl', label: 'Обложка', kind: 'image', required: true },
      { key: 'albumPhotoUrls', label: 'Фотографии альбома', kind: 'imagelist' },
    ],
  },
  {
    key: 'gallery',
    title: 'Галерея',
    blank: () => ({ id: `new-${Date.now()}`, photoUrl: '', category: 'adults', sortOrder: 0 }),
    fields: [
      { key: 'photoUrl', label: 'Фото', kind: 'image', required: true },
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
        (Array.isArray(v) && v.length === 0) ||
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
    if (
      f.kind === 'imagelist' &&
      Array.isArray(v) &&
      v.some((x) => typeof x !== 'string' || (x as string).trim() === '')
    ) {
      errs[f.key] = 'Заполните все фотографии'
    }
  }
  return errs
}

/* ------------------------------------------------------------------ */
/*  Field renderers                                                    */
/* ------------------------------------------------------------------ */

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

function ImageDropzone({
  value,
  onChange,
  required,
  label,
  error,
}: {
  value: string
  onChange: (v: string) => void
  required?: boolean
  label: string
  error?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState('')

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0]
    if (!file) return
    setLocalError('')
    try {
      onChange(await resizeImageToDataUrl(file, 1600))
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Не удалось загрузить файл')
    }
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    void handleFiles(e.dataTransfer.files)
  }

  const hasImage = typeof value === 'string' && value.trim() !== ''

  return (
    <div>
      <label className="block text-sm font-medium text-min-muted">
        {label}
        {required && <span className="text-min-accent"> *</span>}
      </label>

      {hasImage ? (
        <div className="group relative mt-1 w-fit overflow-hidden rounded-xl border border-min-border">
          <img src={value} alt={label} className="h-44 w-44 max-w-full bg-min-surface object-cover" />
          <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
            <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
              Заменить
            </Button>
            <Button variant="ghost" size="sm" onClick={() => onChange('')}>
              Удалить
            </Button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label={`Загрузить изображение: ${label}`}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          className={`mt-1 flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
            dragging ? 'border-min-accent bg-min-accent/10' : 'border-min-border hover:border-min-accent/60 hover:bg-white/[0.02]'
          }`}
        >
          <svg className="h-8 w-8 text-min-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 16V4" />
            <path d="m7 9 5-5 5 5" />
            <path d="M5 16v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1" />
          </svg>
          <span className="text-sm font-medium text-min-text">Перетащите изображение сюда</span>
          <span className="text-xs text-min-muted">или нажмите для выбора · JPG/PNG, до 6 МБ</span>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          void handleFiles(e.target.files)
          e.target.value = ''
        }}
      />
      {localError && <p className="mt-1 text-xs text-min-error">{localError}</p>}
      {error && <p className="mt-1 text-xs text-min-error">{error}</p>}
    </div>
  )
}

function ImageListDropzone({
  value,
  onChange,
  label,
  error,
}: {
  value: string[]
  onChange: (v: string[]) => void
  label: string
  error?: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [localError, setLocalError] = useState('')

  const addFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setLocalError('')
    try {
      const added = await Promise.all(Array.from(files).map((f) => resizeImageToDataUrl(f, 1600)))
      onChange([...value, ...added])
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Не удалось загрузить файл')
    }
  }

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragging(false)
    void addFiles(e.dataTransfer.files)
  }

  const removeOne = (i: number) => onChange(value.filter((_, idx) => idx !== i))

  return (
    <div>
      <label className="block text-sm font-medium text-min-muted">{label}</label>
      <div
        role="button"
        tabIndex={0}
        aria-label={`Загрузить фотографии: ${label}`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragOver={(e) => {
          e.preventDefault()
          setDragging(true)
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`mt-1 flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors ${
          dragging ? 'border-min-accent bg-min-accent/10' : 'border-min-border hover:border-min-accent/60 hover:bg-white/[0.02]'
        }`}
      >
        <svg className="h-7 w-7 text-min-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.5-3.5a2 2 0 0 0-2.8 0L4 21" />
        </svg>
        <span className="text-sm font-medium text-min-text">Добавить фотографии</span>
        <span className="text-xs text-min-muted">перетащите сюда или нажмите · можно несколько</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          void addFiles(e.target.files)
          e.target.value = ''
        }}
      />

      {value.length > 0 && (
        <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {value.map((src, i) => (
            <div key={i} className="group relative overflow-hidden rounded-md border border-min-border">
              <img
                src={src}
                alt={`${label} ${i + 1}`}
                className="h-20 w-full object-cover"
              />
              <button
                type="button"
                aria-label="Удалить фото"
                onClick={() => removeOne(i)}
                className="absolute right-1 top-1 rounded-full bg-black/60 px-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {localError && <p className="mt-1 text-xs text-min-error">{localError}</p>}
      {error && <p className="mt-1 text-xs text-min-error">{error}</p>}
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

  if (field.kind === 'image') {
    return (
      <ImageDropzone
        value={String(value ?? '')}
        onChange={onChange}
        required={field.required}
        label={field.label}
        error={error}
      />
    )
  }

  if (field.kind === 'imagelist') {
    return (
      <ImageListDropzone
        value={(value as string[]) ?? []}
        onChange={onChange}
        label={field.label}
        error={error}
      />
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
      {error && <p className="mt-1 text-xs text-min-error">{error}</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Collapsible CRUD item (accordion) — reduces admin overload         */
/* ------------------------------------------------------------------ */

function CrudItem({
  def,
  item,
  errorMap,
  index,
  total,
  onUpdate,
  onRemove,
  onDuplicate,
  onMove,
}: {
  def: SectionDef
  item: Record<string, unknown>
  errorMap: Record<string, string>
  index: number
  total: number
  onUpdate: (patch: Record<string, unknown>) => void
  onRemove: () => void
  onDuplicate: () => void
  onMove: (dir: -1 | 1) => void
}) {
  const [open, setOpen] = useState(false)
  const invalid = Object.keys(errorMap).length > 0
  const title = itemTitle(item)

  const imgField = def.fields.find((f) => f.kind === 'image')
  const listField = def.fields.find((f) => f.kind === 'imagelist')
  let thumb = ''
  if (imgField && typeof item[imgField.key] === 'string' && (item[imgField.key] as string).trim() !== '') {
    thumb = item[imgField.key] as string
  } else if (
    listField &&
    Array.isArray(item[listField.key]) &&
    (item[listField.key] as string[]).length > 0
  ) {
    thumb = (item[listField.key] as string[])[0]
  }

  return (
    <div
      className={`overflow-hidden rounded-lg border ${invalid ? 'border-min-error' : 'border-min-border'} bg-min-surface/40`}
    >
      <div className="flex items-center gap-3 p-3">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-3 text-left"
        >
          {thumb ? (
            <img src={thumb} alt="" className="h-11 w-11 shrink-0 rounded-md object-cover" />
          ) : (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-white/5 text-xs text-min-muted">
              #{index + 1}
            </span>
          )}
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium text-min-text">
              {title || `Запись #${index + 1}`}
            </span>
            <span className="block text-xs text-min-muted">
              {invalid ? '⚠ не заполнено' : `${def.fields.length} полей`} ·{' '}
              {open ? 'свернуть' : 'развернуть'}
            </span>
          </span>
        </button>
        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Переместить вверх">
            ↑
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Переместить вниз">
            ↓
          </Button>
          <Button variant="ghost" size="sm" onClick={onDuplicate}>
            Дублировать
          </Button>
          <Button variant="ghost" size="sm" onClick={onRemove}>
            Удалить
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-min-border p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {def.fields.map((f) => (
              <FieldEditor
                key={f.key}
                field={f}
                value={item[f.key]}
                error={errorMap[f.key]}
                onChange={(v) => onUpdate({ [f.key]: v })}
              />
            ))}
          </div>
        </div>
      )}
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
    const label = itemTitle(items[idx]) || `#${idx + 1}`
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
          {hasErrors && (
            <span className="ml-2 align-middle text-xs text-min-error">есть незаполненные поля</span>
          )}
        </h2>
        <Button variant="secondary" size="sm" onClick={add}>
          + Добавить
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-min-muted">Пока нет записей.</p>
      ) : (
        <div className="space-y-3">
          {items.map((it, idx) => (
            <CrudItem
              key={String(it.id ?? idx)}
              def={def}
              item={it}
              errorMap={errors[idx]}
              index={idx}
              total={items.length}
              onUpdate={(patch) => update(idx, patch)}
              onRemove={() => remove(idx)}
              onDuplicate={() => duplicate(idx)}
              onMove={(dir) => move(idx, dir)}
            />
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
        headers: adminHeaders(),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      setItems((await res.json()) as SubmissionView[])
    } catch {
      setError('Не удалось загрузить заявки. Войдите заново в админ-панель.')
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const id = setInterval(load, 15000)
    return () => clearInterval(id)
  }, [load])

  const remove = async (id: string) => {
    if (!confirm('Удалить заявку?')) return
    await fetch(`/api/submissions?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
        headers: adminHeaders(),
    })
    load()
  }

  const toggleStatus = async (id: string, current: 'new' | 'processed') => {
    const next = current === 'new' ? 'processed' : 'new'
    await fetch(`/api/submissions?id=${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: adminHeaders(true),
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
    () => typeof sessionStorage !== 'undefined' && Boolean(sessionStorage.getItem(ADMIN_CSRF_STORAGE_KEY)),
  )
  const [pwd, setPwd] = useState('')
  const [err, setErr] = useState('')
  const [data, setData] = useState<CmsData | null>(null)
  const [initial, setInitial] = useState<CmsData | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error' | 'validation'>('idle')
  const [searchParams, setSearchParams] = useSearchParams()
  const initialTabParam = searchParams.get('tab')
  const [active, setActive] = useState<NavKey>(
    NAV.some((n) => n.key === initialTabParam) ? (initialTabParam as NavKey) : 'settings'
  )
  const changeTab = (key: NavKey) => {
    setActive(key)
    if (key === 'settings') {
      if (searchParams.has('tab')) setSearchParams({}, { replace: true })
    } else {
      setSearchParams({ tab: key }, { replace: true })
    }
  }
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

  const login = async (e: FormEvent) => {
    e.preventDefault()
    setErr('')
    try {
      const res = await fetch('/api/admin/session', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password: pwd }),
      })
      const body = await res.json().catch(() => ({})) as { csrfToken?: string }
      if (!res.ok || !body.csrfToken) throw new Error('Unauthorized')
      sessionStorage.setItem(ADMIN_CSRF_STORAGE_KEY, body.csrfToken)
      setAuthed(true)
      setPwd('')
    } catch {
      setErr('Неверный пароль')
    }
  }

  const logout = () => {
    void fetch('/api/admin/session', { method: 'DELETE' })
    sessionStorage.removeItem(ADMIN_CSRF_STORAGE_KEY)
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
      setStatus('validation')
      return
    }
    setStatus('saving')
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: adminHeaders(true),
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        console.error('Admin save failed: HTTP', res.status, body)
        throw new Error(`HTTP ${res.status}`)
      }
      setInitial(data)
      setStatus('saved')
      notifyContentChanged()
    } catch (err) {
      console.error('Admin save failed:', err)
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
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      {!authed ? (
        <main className="mx-auto flex max-w-sm flex-col gap-4 px-4 py-24">
          <h1 className="text-2xl font-bold text-min-text">Вход в админ-панель</h1>
          <form onSubmit={login} className="flex flex-col gap-3">
            <input
              type="password"
              autoComplete="current-password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Пароль"
              className="rounded-md border border-min-border bg-min-surface p-2 text-min-text"
            />
            {err && <p className="text-sm text-min-error">{err}</p>}
            {import.meta.env.DEV && (
              <p className="text-xs text-min-muted">
                Задайте ADMIN_PASSWORD и ADMIN_SESSION_SECRET на сервере в .env.
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
                <span className="text-xs text-min-error">Незаполненных полей: {globalErrors}</span>
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
              {globalErrors > 0 && (
                <span className="text-xs text-min-error">Заполните обязательные поля</span>
              )}
            </div>
          </div>

          {status === 'saved' && (
            <p className="mb-4 rounded bg-white/10 p-2 text-sm text-min-accent">Сохранено ✓</p>
          )}
          {status === 'validation' && (
            <p className="mb-4 rounded bg-min-error/10 p-2 text-sm text-min-error">
              Нельзя сохранить: заполните обязательные поля (отмечены красным) и исправьте ошибки.
            </p>
          )}
          {status === 'error' && (
            <p className="mb-4 rounded bg-min-error/10 p-2 text-sm text-min-error">
              Ошибка сохранения. Возможно, сессия истекла — войдите заново, или сервер недоступен (подробности — в консоли браузера).
            </p>
          )}

          <AdminSidebar
            activeSection={active}
            onSelectSection={changeTab}
            onLogout={logout}
            user={{ name: 'Администратор', email: 'admin@planetaup.ru' }}
          >
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
          </AdminSidebar>
        </main>
      )}
    </>
  )
}
