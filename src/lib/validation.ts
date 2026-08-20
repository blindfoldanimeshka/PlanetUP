import { z } from 'zod'

/** Remove C0/C1 control characters and trim surrounding whitespace. */
export function stripControlChars(value: string): string {
  let out = ''
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) continue
    out += ch
  }
  return out.trim()
}

export const MAX_NAME_LENGTH = 120
export const MAX_TEXT_LENGTH = 2000

/** Recursively strip control characters from any string in an arbitrary value. */
export function deepSanitize(input: unknown): unknown {
  if (typeof input === 'string') return stripControlChars(input)
  if (Array.isArray(input)) return input.map(deepSanitize)
  if (input && typeof input === 'object') {
    const out: Record<string, unknown> = {}
    for (const [k, v] of Object.entries(input)) out[k] = deepSanitize(v)
    return out
  }
  return input
}

const cleanedString = (max: number) =>
  z.string().transform((v) => stripControlChars(v).slice(0, max))

function nameField(requiredMsg: string) {
  return cleanedString(MAX_NAME_LENGTH).pipe(
    z.string().min(2, requiredMsg).max(MAX_NAME_LENGTH, 'Имя слишком длинное')
  )
}

export const BOOKING_SOURCES = [
  { value: 'vk', label: 'ВКонтакте' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'friends', label: 'От друзей/знакомых' },
  { value: 'search', label: 'Поиск в интернете' },
  { value: 'advert', label: 'Реклама' },
  { value: 'other', label: 'Другое' },
] as const

export type BookingSource = (typeof BOOKING_SOURCES)[number]['value']

export function formatPhone(digits: string): string {
  if (!digits) return '+7'
  let result = '+7'
  if (digits.length > 1) result += ` (${digits.slice(1, 4)}`
  if (digits.length > 4) result += `) ${digits.slice(4, 7)}`
  if (digits.length > 7) result += `-${digits.slice(7, 9)}`
  if (digits.length > 9) result += `-${digits.slice(9, 11)}`
  return result
}

const phoneSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, '').slice(0, 11))
  .pipe(
    z.string().refine(
      (digits) => digits.length === 11 && digits.startsWith('7'),
      { message: 'Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX' }
    )
  )

const ageSchema = z
  .string()
  .min(1, 'Укажите возраст')
  .refine((v) => /^\d+$/.test(v.trim()), { message: 'Возраст должен быть числом' })
  .refine(
    (v) => {
      const n = Number(v)
      return n >= 3 && n <= 99
    },
    { message: 'Возраст должен быть от 3 до 99 лет' }
  )

const sourceSchema = z.enum(
  BOOKING_SOURCES.map((s) => s.value) as [BookingSource, ...BookingSource[]]
)

const consentSchema = z.boolean().refine(
  (v) => v === true,
  { message: 'Необходимо согласие на обработку персональных данных' }
)

/** True when injuries contains actual health/trauma data (non-empty after trim). */
export const hasHealthData = (injuries?: unknown): boolean =>
  typeof injuries === 'string' && injuries.trim().length > 0

export const childBookingSchema = z.object({
  formType: z.literal('child'),
  childName: nameField('Введите имя ребёнка'),
  age: ageSchema,
  hasExperience: z.enum(['yes', 'no'], {
    message: 'Укажите, был ли опыт занятий',
  }),
  experienceDetails: cleanedString(MAX_TEXT_LENGTH).optional(),
  phone: phoneSchema,
  parentName: nameField('Введите имя родителя'),
  source: sourceSchema,
  consent: consentSchema,
  honeypot: z.string().optional(),
})

export const adultBookingSchema = z.object({
  formType: z.literal('adult'),
  name: nameField('Введите имя'),
  age: ageSchema,
  previousSportExperience: cleanedString(MAX_TEXT_LENGTH).optional(),
  phone: phoneSchema,
  injuries: cleanedString(MAX_TEXT_LENGTH).optional(),
  injuriesConsent: z.boolean(),
  source: sourceSchema,
  consent: consentSchema,
  honeypot: z.string().optional(),
}).superRefine((data, ctx) => {
  if (hasHealthData(data.injuries) && !data.injuriesConsent) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['injuriesConsent'],
      message:
        'Необходимо отдельное согласие на обработку сведений о состоянии здоровья (травмах/ограничениях) в соответствии со ст. 10 и ч. 4 ст. 9 Федерального закона № 152-ФЗ',
    })
  }
})

export const bookingSchema = z.union([childBookingSchema, adultBookingSchema])

export type ChildBookingFormData = z.infer<typeof childBookingSchema>
export type AdultBookingFormData = z.infer<typeof adultBookingSchema>
export type BookingFormData = z.infer<typeof bookingSchema>
