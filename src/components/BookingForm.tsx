import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { bookingSchema, type BookingFormData } from '@/lib/validation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

function formatPhone(digits: string): string {
  if (!digits) return ''
  let result = '+7'
  if (digits.length > 1) result += ` (${digits.slice(1, 4)}`
  if (digits.length > 4) result += `) ${digits.slice(4, 7)}`
  if (digits.length > 7) result += `-${digits.slice(7, 9)}`
  if (digits.length > 9) result += `-${digits.slice(9, 11)}`
  return result
}

export function BookingForm({ interest }: { interest?: string }) {
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      direction: interest || '',
      consent: false,
      honeypot: '',
    },
  })

  const onSubmit = async (data: BookingFormData) => {
    setLoading(true)
    setSubmitError(null)
    try {
      const res = await fetch('/api/submit-form', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Ошибка сервера' }))
        throw new Error(err.error || 'Ошибка отправки')
      }
      setSuccess(true)
      reset()
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Произошла ошибка при отправке'
      )
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="rounded-lg border border-cosmic-accent/30 bg-cosmic-bg-deep/60 p-6 text-center">
        <p className="text-lg font-semibold text-white">Заявка отправлена!</p>
        <p className="mt-2 text-sm text-white/70">
          Мы свяжемся с вами в ближайшее время.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-3 sm:grid-cols-2"
      aria-label="Форма записи на пробное занятие"
    >
      {/* Honeypot — invisible to humans */}
      <input
        {...register('honeypot')}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-0 top-0 h-0 w-0 opacity-0"
      />

      <div className="sm:col-span-1">
        <label htmlFor="booking-name" className="sr-only">
          Ваше имя
        </label>
        <input
          id="booking-name"
          type="text"
          placeholder="Ваше имя"
          className={cn(
            'w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm transition-colors focus:border-cosmic-accent-2 focus:outline-none focus:ring-2 focus:ring-cosmic-accent/40',
            errors.name ? 'border-red-400' : 'border-white/20'
          )}
          autoComplete="name"
          {...register('name')}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-red-400">{errors.name.message}</p>
        )}
      </div>

      <div className="sm:col-span-1">
        <label htmlFor="booking-phone" className="sr-only">
          Телефон
        </label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <input
              id="booking-phone"
              type="tel"
              placeholder="+7 (___) ___-__-__"
              inputMode="numeric"
              className={cn(
                'w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm transition-colors focus:border-cosmic-accent-2 focus:outline-none focus:ring-2 focus:ring-cosmic-accent/40',
                errors.phone ? 'border-red-400' : 'border-white/20'
              )}
              autoComplete="tel"
              value={formatPhone(field.value || '')}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '').slice(0, 11)
                field.onChange(raw)
              }}
            />
          )}
        />
        {errors.phone && (
          <p className="mt-1 text-xs text-red-400">{errors.phone.message}</p>
        )}
      </div>

      <div className="sm:col-span-1">
        <label htmlFor="booking-direction" className="sr-only">
          Направление
        </label>
        <select
          id="booking-direction"
          {...register('direction')}
          className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-white backdrop-blur-sm"
        >
          <option value="" className="bg-cosmic-bg text-light-text">
            Направление
          </option>
          <option value="adults" className="bg-cosmic-bg text-light-text">
            Взрослым
          </option>
          <option value="kids" className="bg-cosmic-bg text-light-text">
            Детям
          </option>
          <option value="general" className="bg-cosmic-bg text-light-text">
            Общая заявка
          </option>
        </select>
      </div>

      <div className="sm:col-span-1">
        <label htmlFor="booking-time" className="sr-only">
          Удобное время
        </label>
        <input
          id="booking-time"
          type="text"
          placeholder="Удобное время/день"
          className={cn(
            'w-full rounded-lg border bg-white/10 px-4 py-3 text-white placeholder-white/50 backdrop-blur-sm transition-colors focus:border-cosmic-accent-2 focus:outline-none focus:ring-2 focus:ring-cosmic-accent/40',
            errors.preferredTime ? 'border-red-400' : 'border-white/20'
          )}
          {...register('preferredTime')}
        />
        {errors.preferredTime && (
          <p className="mt-1 text-xs text-red-400">
            {errors.preferredTime.message}
          </p>
        )}
      </div>

      <div className="flex items-start gap-2 sm:col-span-2">
        <input
          id="booking-consent"
          type="checkbox"
          {...register('consent')}
          className="mt-1 h-4 w-4 accent-cosmic-accent"
        />
        <label htmlFor="booking-consent" className="text-xs text-white/70">
          Согласен на обработку{' '}
          <a
            href="/privacy"
            target="_blank"
            className="underline hover:text-cosmic-accent-2"
          >
            персональных данных
          </a>
        </label>
      </div>
      {errors.consent && (
        <p className="text-xs text-red-400 sm:col-span-2">
          {errors.consent.message}
        </p>
      )}

      <div className="sm:col-span-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full shadow-glow sm:w-auto"
          disabled={loading}
        >
          {loading ? 'Отправка...' : 'Записаться'}
        </Button>
      </div>

      {submitError && (
        <p className="text-sm text-red-400 sm:col-span-2">{submitError}</p>
      )}
    </form>
  )
}
