import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Tabs from '@radix-ui/react-tabs'
import {
  childBookingSchema,
  adultBookingSchema,
  formatPhone,
  BOOKING_SOURCES,
  type ChildBookingFormData,
  type AdultBookingFormData,
} from '@/lib/validation'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

const inputBase =
  'w-full glass-input rounded-xl px-4 py-3 text-min-text placeholder-min-muted transition-colors focus:border-min-accent focus:outline-none focus:ring-1 focus:ring-min-accent'

const selectBase =
  'w-full glass-input rounded-xl px-4 py-3 text-min-text bg-transparent transition-colors focus:border-min-accent focus:outline-none focus:ring-1 focus:ring-min-accent'

const tabTrigger =
  'flex-1 rounded-xl px-4 py-2 text-sm font-medium text-min-muted transition-all data-[state=active]:glass-input data-[state=active]:text-min-accent'

const emptyChildValues: ChildBookingFormData = {
  formType: 'child',
  childName: '',
  age: '',
  hasExperience: 'no',
  experienceDetails: '',
  phone: '',
  parentName: '',
  source: 'vk',
  consent: false,
  honeypot: '',
}

const emptyAdultValues: AdultBookingFormData = {
  formType: 'adult',
  name: '',
  age: '',
  previousSportExperience: '',
  injuries: '',
  phone: '',
  source: 'vk',
  consent: false,
  honeypot: '',
}

async function submitBooking(data: ChildBookingFormData | AdultBookingFormData) {
  const res = await fetch('/api/submit-form', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Ошибка сервера' }))
    throw new Error(err.error || 'Ошибка отправки')
  }
}

export function BookingForm({
  interest,
  onClose,
}: {
  interest?: string
  onClose?: () => void
}) {
  const defaultTab = interest === 'adults' ? 'adult' : 'child'
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const childForm = useForm<ChildBookingFormData>({
    resolver: zodResolver(childBookingSchema),
    defaultValues: emptyChildValues,
  })

  const adultForm = useForm<AdultBookingFormData>({
    resolver: zodResolver(adultBookingSchema),
    defaultValues: emptyAdultValues,
  })

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setSubmitError(null)
  }

  const onSubmitChild = async (data: ChildBookingFormData) => {
    setLoading(true)
    setSubmitError(null)
    try {
      await submitBooking(data)
      setSuccess(true)
      childForm.reset()
      adultForm.reset()
    } catch (err) {
      setSubmitError(
        err instanceof Error ? err.message : 'Произошла ошибка при отправке'
      )
    } finally {
      setLoading(false)
    }
  }

  const onSubmitAdult = async (data: AdultBookingFormData) => {
    setLoading(true)
    setSubmitError(null)
    try {
      await submitBooking(data)
      setSuccess(true)
      childForm.reset()
      adultForm.reset()
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="glass-surface rounded-2xl"
      >
        <div className="p-6 text-center">
          <p className="text-lg font-semibold text-min-text">Заявка отправлена!</p>
          <p className="mt-2 text-sm text-min-muted">
            Мы свяжемся с вами в ближайшее время.
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
        <div className="glass-surface mb-4 rounded-2xl">
          <Tabs.List className="grid grid-cols-2 gap-1 p-1">
          <Tabs.Trigger value="child" className={tabTrigger}>
            Ребёнку
          </Tabs.Trigger>
          <Tabs.Trigger value="adult" className={tabTrigger}>
            Взрослому
          </Tabs.Trigger>
        </Tabs.List>
        </div>

        <Tabs.Content value="child">
          <ChildForm
            form={childForm}
            onSubmit={onSubmitChild}
            loading={loading}
            onClose={onClose}
          />
        </Tabs.Content>

        <Tabs.Content value="adult">
          <AdultForm
            form={adultForm}
            onSubmit={onSubmitAdult}
            loading={loading}
            onClose={onClose}
          />
        </Tabs.Content>
      </Tabs.Root>

      {submitError && (
        <p className="mt-2 text-sm text-min-error">{submitError}</p>
      )}
    </>
  )
}

function ChildForm({
  form,
  onSubmit,
  loading,
  onClose,
}: {
  form: ReturnType<typeof useForm<ChildBookingFormData>>
  onSubmit: (data: ChildBookingFormData) => Promise<void>
  loading: boolean
  onClose?: () => void
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = form
  const hasExperience = watch('hasExperience')

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-3 sm:grid-cols-2"
      aria-label="Форма записи ребёнка на пробное занятие"
    >
      <input
        {...register('honeypot')}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-0 top-0 h-0 w-0 opacity-0"
      />
      <input type="hidden" {...register('formType')} value="child" />

      <TextField
        id="booking-child-name"
        placeholder="ФИО ребёнка"
        autoComplete="name"
        error={errors.childName?.message}
        {...register('childName')}
      />

      <TextField
        id="booking-child-age"
        placeholder="Возраст"
        inputMode="numeric"
        error={errors.age?.message}
        {...register('age')}
      />

      <div className="sm:col-span-2">
        <p className="mb-2 text-sm text-min-muted">Был ли опыт занятий?</p>
        <div className="flex gap-4">
          <Radio label="Да" value="yes" {...register('hasExperience')} />
          <Radio label="Нет" value="no" {...register('hasExperience')} />
        </div>
        {errors.hasExperience && (
          <p className="mt-1 text-xs text-min-error">
            {errors.hasExperience.message}
          </p>
        )}
      </div>

      {hasExperience === 'yes' && (
        <TextArea
          id="booking-child-experience"
          placeholder="Расскажите о предыдущем опыте"
          className="sm:col-span-2"
          error={errors.experienceDetails?.message}
          {...register('experienceDetails')}
        />
      )}

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

      <TextField
        id="booking-parent-name"
        placeholder="Имя родителя"
        error={errors.parentName?.message}
        {...register('parentName')}
      />

      <SourceField
        id="booking-child-source"
        error={errors.source?.message}
        {...register('source')}
      />

      <ConsentField error={errors.consent?.message} {...register('consent')} />

      <SubmitButton loading={loading} onClose={onClose} />
    </form>
  )
}

function AdultForm({
  form,
  onSubmit,
  loading,
  onClose,
}: {
  form: ReturnType<typeof useForm<AdultBookingFormData>>
  onSubmit: (data: AdultBookingFormData) => Promise<void>
  loading: boolean
  onClose?: () => void
}) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-3 sm:grid-cols-2"
      aria-label="Форма записи взрослого на пробное занятие"
    >
      <input
        {...register('honeypot')}
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute left-0 top-0 h-0 w-0 opacity-0"
      />
      <input type="hidden" {...register('formType')} value="adult" />

      <TextField
        id="booking-adult-name"
        placeholder="Ваше ФИО"
        autoComplete="name"
        error={errors.name?.message}
        {...register('name')}
      />

      <TextField
        id="booking-adult-age"
        placeholder="Возраст"
        inputMode="numeric"
        error={errors.age?.message}
        {...register('age')}
      />

      <TextArea
        id="booking-adult-experience"
        placeholder="Расскажите о спортивном опыте (необязательно)"
        className="sm:col-span-2"
        error={errors.previousSportExperience?.message}
        {...register('previousSportExperience')}
      />

      <TextArea
        id="booking-adult-injuries"
        placeholder="Есть ли травмы или ограничения? (необязательно)"
        className="sm:col-span-2"
        error={errors.injuries?.message}
        {...register('injuries')}
      />

      <div className="sm:col-span-1">
        <label htmlFor="booking-adult-phone" className="sr-only">
          Телефон
        </label>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <input
              id="booking-adult-phone"
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

      <SourceField
        id="booking-adult-source"
        error={errors.source?.message}
        {...register('source')}
      />

      <ConsentField error={errors.consent?.message} {...register('consent')} />

      <SubmitButton loading={loading} onClose={onClose} />
    </form>
  )
}

function TextField({
  id,
  placeholder,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & {
  error?: string
  className?: string
}) {
  return (
    <div className={cn('sm:col-span-1', className)}>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        placeholder={placeholder}
        className={cn(
          inputBase,
          error ? 'border-min-error' : 'border-min-border'
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-min-error">{error}</p>}
    </div>
  )
}

function TextArea({
  id,
  placeholder,
  error,
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & {
  error?: string
  className?: string
}) {
  return (
    <div className={cn('sm:col-span-2', className)}>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <textarea
        id={id}
        placeholder={placeholder}
        rows={3}
        className={cn(
          inputBase,
          error ? 'border-min-error' : 'border-min-border'
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-min-error">{error}</p>}
    </div>
  )
}

function SourceField({
  id,
  error,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { error?: string; id: string }) {
  return (
    <div className="sm:col-span-1">
      <label htmlFor={id} className="mb-2 block text-sm text-min-muted">
        Как Вы о нас узнали?
      </label>
      <select
        id={id}
        className={cn(
          selectBase,
          error ? 'border-min-error' : 'border-min-border'
        )}
        {...props}
      >
        {BOOKING_SOURCES.map((s) => (
          <option
            key={s.value}
            value={s.value}
            className="bg-min-surface text-min-text"
          >
            {s.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-min-error">{error}</p>}
    </div>
  )
}

function Radio(
  props: React.InputHTMLAttributes<HTMLInputElement> & { label: string }
) {
  const { label, ...rest } = props
  return (
    <label className="flex items-center gap-2 text-sm text-min-text">
      <input
        type="radio"
        {...rest}
        className="h-4 w-4 accent-min-accent"
      />
      {label}
    </label>
  )
}

function ConsentField({
  error,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  return (
    <>
      <div className="flex items-start gap-2 sm:col-span-2">
        <input
          id="booking-consent"
          type="checkbox"
          className="mt-1 h-4 w-4 accent-min-accent"
          {...props}
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
      {error && (
        <p className="text-xs text-min-error sm:col-span-2">{error}</p>
      )}
    </>
  )
}

function SubmitButton({
  loading,
  onClose,
}: {
  loading: boolean
  onClose?: () => void
}) {
  return (
    <div className="flex flex-col gap-3 sm:col-span-2 sm:flex-row sm:items-center">
      <Button
        type="submit"
        variant="primary"
        size="lg"
        className="w-full sm:w-auto"
        disabled={loading}
      >
        {loading ? 'Отправка...' : 'Записаться'}
      </Button>
      {onClose && (
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onClose}
          className="w-full sm:w-auto"
        >
          Отмена
        </Button>
      )}
    </div>
  )
}
