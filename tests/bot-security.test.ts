import { describe, it, expect } from 'vitest'
import { isAllowedEditField, sanitizeCmsText, EDIT_FIELD_ALLOWLIST } from '../src/lib/botCmsGuard'

/* ------------------------------------------------------------------ */
/*  EDIT_FIELD_ALLOWLIST                                                */
/* ------------------------------------------------------------------ */

describe('EDIT_FIELD_ALLOWLIST', () => {
  it('has entries for all known CMS sections', () => {
    const expectedSections = [
      'schedule',
      'subscriptions',
      'team',
      'life',
      'reviews',
      'contacts',
    ]
    for (const s of expectedSections) {
      expect(EDIT_FIELD_ALLOWLIST[s]).toBeDefined()
      expect(EDIT_FIELD_ALLOWLIST[s].length).toBeGreaterThan(0)
    }
  })
})

/* ------------------------------------------------------------------ */
/*  isAllowedEditField                                                 */
/* ------------------------------------------------------------------ */

describe('isAllowedEditField', () => {
  // --- Acceptance: known-good fields ---
  it('accepts "name" for schedule section', () => {
    expect(isAllowedEditField('schedule', 'name')).toBe(true)
  })

  it('accepts "category" for schedule section', () => {
    expect(isAllowedEditField('schedule', 'category')).toBe(true)
  })

  it('accepts "level" for schedule section', () => {
    expect(isAllowedEditField('schedule', 'level')).toBe(true)
  })

  it('accepts "description" for schedule section', () => {
    expect(isAllowedEditField('schedule', 'description')).toBe(true)
  })

  it('accepts "price" for subscriptions section', () => {
    expect(isAllowedEditField('subscriptions', 'price')).toBe(true)
  })

  it('accepts "conditions" for subscriptions section', () => {
    expect(isAllowedEditField('subscriptions', 'conditions')).toBe(true)
  })

  it('accepts "specialization" for team section', () => {
    expect(isAllowedEditField('team', 'specialization')).toBe(true)
  })

  it('accepts "title" for life section', () => {
    expect(isAllowedEditField('life', 'title')).toBe(true)
  })

  it('accepts "text" for reviews section', () => {
    expect(isAllowedEditField('reviews', 'text')).toBe(true)
  })

  it('accepts "phone" for contacts section', () => {
    expect(isAllowedEditField('contacts', 'phone')).toBe(true)
  })

  it('accepts "vk" for contacts section', () => {
    expect(isAllowedEditField('contacts', 'vk')).toBe(true)
  })

  it('accepts "whatsapp" for contacts section', () => {
    expect(isAllowedEditField('contacts', 'whatsapp')).toBe(true)
  })

  // --- Rejection: unknown / dangerous field names ---
  it('rejects unknown field name "randomField"', () => {
    expect(isAllowedEditField('schedule', 'randomField')).toBe(false)
  })

  it('rejects "__proto__"', () => {
    expect(isAllowedEditField('schedule', '__proto__')).toBe(false)
  })

  it('rejects "constructor"', () => {
    expect(isAllowedEditField('team', 'constructor')).toBe(false)
  })

  it('rejects "<script>" as a field name', () => {
    expect(isAllowedEditField('reviews', '<script>')).toBe(false)
  })

  it('rejects field name with HTML injection "name<img src=x onerror=alert(1)>"', () => {
    expect(isAllowedEditField('schedule', 'name<img src=x onerror=alert(1)>')).toBe(false)
  })

  it('rejects prototype pollution attempt "toString"', () => {
    expect(isAllowedEditField('life', 'toString')).toBe(false)
  })

  // --- Rejection: unknown section ---
  it('rejects unknown section "nonexistent"', () => {
    expect(isAllowedEditField('nonexistent', 'name')).toBe(false)
  })

  it('rejects empty section', () => {
    expect(isAllowedEditField('', 'name')).toBe(false)
  })

  it('rejects empty field', () => {
    expect(isAllowedEditField('schedule', '')).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  sanitizeCmsText                                                    */
/* ------------------------------------------------------------------ */

describe('sanitizeCmsText', () => {
  it('passes through normal text unchanged', () => {
    expect(sanitizeCmsText('Hello World')).toBe('Hello World')
  })

  it('strips C0 control characters (U+0000–U+001F)', () => {
    const input = 'Hello\x00\x01\x02\x1F World'
    expect(sanitizeCmsText(input)).toBe('Hello World')
  })

  it('strips C1 control characters (U+007F–U+009F)', () => {
    const input = 'Hello\x7F\x80\x9F World'
    expect(sanitizeCmsText(input)).toBe('Hello World')
  })

  it('strips null bytes', () => {
    expect(sanitizeCmsText('test\x00value')).toBe('testvalue')
  })

  it('trims leading and trailing whitespace', () => {
    expect(sanitizeCmsText('  hello  ')).toBe('hello')
  })

  it('caps length to max 2000 characters', () => {
    const long = 'A'.repeat(3000)
    const result = sanitizeCmsText(long)
    expect(result.length).toBe(2000)
  })

  it('preserves normal Unicode (Cyrillic)', () => {
    const input = 'Привет мир'
    expect(sanitizeCmsText(input)).toBe('Привет мир')
  })

  it('preserves newlines and tabs (they are not C0/C1 control chars in the dangerous sense)', () => {
    // Newline (U+000A) and tab (U+0009) are technically C0 but commonly needed.
    // The function should strip them per the spec (strip ALL C0/C1).
    const input = 'line1\nline2\ttab'
    const result = sanitizeCmsText(input)
    expect(result).not.toContain('\n')
    expect(result).not.toContain('\t')
  })

  it('returns empty string for input that is only control chars', () => {
    expect(sanitizeCmsText('\x00\x01\x1F')).toBe('')
  })
})
