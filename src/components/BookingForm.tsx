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

const inputBase =
  'w-full border border-min-border bg-min-surface px-4 py-3 text-min-text placeholder-min-muted transition-colors focus:border-min-accent focus:outline-none focus:ring-1 focus:ring-min-accent'

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
      <div className="border border-min-border bg-min-surface p-6 text-center">
        <p className="text-lg font-semibold text-min-text">Заявка отправлена!</p>
        <p className="mt-2 text-sm text-min-muted">
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
      {/* Honeypot */}
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
            inputBase,
            errors.name ? 'border-min-error' : 'border-min-border'
          )}
          autoComplete="name"
          {...register('name')}
        />
        {errors.name && (
          <p className="mt-1 text-xs text-min-error">{errors.name.message}</p>
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
                inputBase,
                errors.phone ? 'border-min-error' : 'border-min-border'
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
          <p className="mt-1 text-xs text-min-error">{errors.phone.message}</p>
        )}
      </div>

      <div className="sm:col-span-1">
        <label htmlFor="booking-direction" className="sr-only">
          Направление
        </label>
        <select
          id="booking-direction"
          {...register('direction')}
          className={inputBase}
        >
          <option value="" className="bg-min-surface text-min-text">
            Направление
          </option>
          <option value="adults" className="bg-min-surface text-min-text">
            Взрослым
          </option>
          <option value="kids" className="bg-min-surface text-min-text">
            Детям
          </option>
          <option value="general" className="bg-min-surface text-min-text">
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
            inputBase,
            errors.preferredTime ? 'border-min-error' : 'border-min-border'
          )}
          {...register('preferredTime')}
        />
        {errors.preferredTime && (
          <p className="mt-1 text-xs text-min-error">
            {errors.preferredTime.message}
          </p>
        )}
      </div>

      <div className="flex items-start gap-2 sm:col-span-2">
        <input
          id="booking-consent"
          type="checkbox"
          {...register('consent')}
          className="mt-1 h-4 w-4 accent-min-accent"
        />
        <label htmlFor="booking-consent" className="text-xs text-min-muted">
          Согласен на обработку{' '}
          <a
            href="/privacy"
            target="_blank"
            className="underline hover:text-min-accent"
          >
            персональных данных
          </a>
        </label>
      </div>
      {errors.consent && (
        <p className="text-xs text-min-error sm:col-span-2">
          {errors.consent.message}
        </p>
      )}

      <div className="sm:col-span-2">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? 'Отправка...' : 'Записаться'}
        </Button>
      </div>

      {submitError && (
        <p className="text-sm text-min-error sm:col-span-2">{submitError}</p>
      )}
    </form>
  )
}
