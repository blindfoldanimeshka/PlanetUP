import { z } from 'zod'

export const bookingSchema = z.object({
  name: z.string().min(1, 'Введите имя').min(2, 'Имя слишком короткое'),
  phone: z.string().refine(
    (val) => {
      const digits = val.replace(/\D/g, '')
      return digits.length === 11 && digits.startsWith('7')
    },
    { message: 'Введите корректный номер телефона в формате +7 (XXX) XXX-XX-XX' }
  ),
  direction: z.string().optional(),
  preferredTime: z.string().min(1, 'Укажите удобное время и день'),
  consent: z.boolean().refine(
    (v) => v === true,
    { message: 'Необходимо согласие на обработку персональных данных' }
  ),
  honeypot: z.string().optional(),
})

export type BookingFormData = z.infer<typeof bookingSchema>
