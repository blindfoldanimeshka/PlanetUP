import { z } from 'zod'

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

const phoneSchema = z.string().refine(
  (val) => {
    const digits = val.replace(/\D/g, '')
    return digits.length === 11 && digits.startsWith('7')
  },
  { message: 'Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX' }
)

const sourceSchema = z.enum(
  BOOKING_SOURCES.map((s) => s.value) as [BookingSource, ...BookingSource[]]
)

const consentSchema = z.boolean().refine(
  (v) => v === true,
  { message: 'Необходимо согласие на обработку персональных данных' }
)

export const childBookingSchema = z.object({
  formType: z.literal('child'),
  childName: z.string().min(1, 'Введите имя ребёнка').min(2, 'Имя слишком короткое'),
  age: z.string().min(1, 'Укажите возраст'),
  hasExperience: z.enum(['yes', 'no'], {
    message: 'Укажите, был ли опыт занятий',
  }),
  experienceDetails: z.string().optional(),
  phone: phoneSchema,
  parentName: z.string().min(1, 'Введите имя родителя').min(2, 'Имя слишком короткое'),
  source: sourceSchema,
  consent: consentSchema,
  honeypot: z.string().optional(),
})

export const adultBookingSchema = z.object({
  formType: z.literal('adult'),
  name: z.string().min(1, 'Введите имя').min(2, 'Имя слишком короткое'),
  age: z.string().min(1, 'Укажите возраст'),
  previousSportExperience: z.string().optional(),
  phone: phoneSchema,
  injuries: z.string().optional(),
  source: sourceSchema,
  consent: consentSchema,
  honeypot: z.string().optional(),
})

export const bookingSchema = z.discriminatedUnion('formType', [
  childBookingSchema,
  adultBookingSchema,
])

export type ChildBookingFormData = z.infer<typeof childBookingSchema>
export type AdultBookingFormData = z.infer<typeof adultBookingSchema>
export type BookingFormData = z.infer<typeof bookingSchema>
