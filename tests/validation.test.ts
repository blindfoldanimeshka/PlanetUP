import { describe, it, expect } from 'vitest'
import { bookingSchema, formatPhone, BOOKING_SOURCES } from '../src/lib/validation'

describe('bookingSchema', () => {
  const childPayload = {
    formType: 'child',
    childName: 'Иванова Мария',
    age: '8',
    hasExperience: 'yes',
    experienceDetails: 'Занималась художественной гимнастикой год',
    phone: '+7 (962) 908-05-54',
    parentName: 'Иванова Анна',
    source: 'vk',
    consent: true,
    honeypot: '',
  }

  const adultPayload = {
    formType: 'adult',
    name: 'Петрова Елена',
    age: '32',
    previousSportExperience: 'Йога, плавание',
    phone: '+7 (962) 908-05-54',
    injuries: 'Была растяжение год назад',
    source: 'instagram',
    consent: true,
    injuriesConsent: true,
    honeypot: '',
  }

  it('validates a complete child form', () => {
    const result = bookingSchema.safeParse(childPayload)
    expect(result.success).toBe(true)
  })

  it('validates a complete adult form', () => {
    const result = bookingSchema.safeParse(adultPayload)
    expect(result.success).toBe(true)
  })

  it('rejects child form without parent name', () => {
    const result = bookingSchema.safeParse({ ...childPayload, parentName: '' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('parentName'))).toBe(true)
    }
  })

  it('rejects both variants without consent', () => {
    const child = bookingSchema.safeParse({ ...childPayload, consent: false })
    const adult = bookingSchema.safeParse({ ...adultPayload, consent: false })
    expect(child.success).toBe(false)
    expect(adult.success).toBe(false)
  })

  it('rejects invalid phone format', () => {
    const result = bookingSchema.safeParse({ ...adultPayload, phone: '8 (962) 908-05-54' })
    expect(result.success).toBe(false)
  })

  it('rejects too short phone', () => {
    const result = bookingSchema.safeParse({ ...adultPayload, phone: '+7 (962) 908-0' })
    expect(result.success).toBe(false)
  })

  it('allows child form with hasExperience=no and no details', () => {
    const result = bookingSchema.safeParse({
      ...childPayload,
      hasExperience: 'no',
      experienceDetails: '',
    })
    expect(result.success).toBe(true)
  })

  it('rejects child form with unknown hasExperience value', () => {
    const result = bookingSchema.safeParse({
      ...childPayload,
      hasExperience: 'maybe',
    })
    expect(result.success).toBe(false)
  })

  it('rejects adult form with missing source', () => {
    const result = bookingSchema.safeParse({ ...adultPayload, source: '' })
    expect(result.success).toBe(false)
  })

  it('rejects unknown formType', () => {
    const result = bookingSchema.safeParse({ ...childPayload, formType: 'teen' })
    expect(result.success).toBe(false)
  })

  it('rejects adult form with injuries but missing injuriesConsent (ст. 10, ч. 4 ст. 9 ФЗ-152)', () => {
    const result = bookingSchema.safeParse({
      ...adultPayload,
      injuries: 'Была травма колена',
      injuriesConsent: false,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.includes('injuriesConsent'))).toBe(true)
    }
  })

  it('allows adult form with empty injuries and no injuriesConsent', () => {
    const result = bookingSchema.safeParse({
      ...adultPayload,
      injuries: '',
      injuriesConsent: false,
    })
    expect(result.success).toBe(true)
  })
})

describe('formatPhone', () => {
  it('formats 11 digits starting with 7', () => {
    expect(formatPhone('79629080554')).toBe('+7 (962) 908-05-54')
  })

  it('returns partial format for incomplete input', () => {
    expect(formatPhone('7962908')).toBe('+7 (962) 908')
  })

  it('returns +7 for empty input', () => {
    expect(formatPhone('')).toBe('+7')
  })
})

describe('BOOKING_SOURCES', () => {
  it('contains expected sources', () => {
    expect(BOOKING_SOURCES).toContainEqual({ value: 'vk', label: 'ВКонтакте' })
    expect(BOOKING_SOURCES).toContainEqual({ value: 'instagram', label: 'Instagram' })
    expect(BOOKING_SOURCES).toContainEqual({ value: 'friends', label: 'От друзей/знакомых' })
  })
})
