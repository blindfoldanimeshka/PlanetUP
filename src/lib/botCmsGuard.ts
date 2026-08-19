/**
 * Security guard for CMS field edits via the Telegram admin bot.
 *
 * Provides:
 * - EDIT_FIELD_ALLOWLIST: whitelist of allowed field names per section
 * - isAllowedEditField: validates (section, field) pairs
 * - sanitizeCmsText: strips C0/C1 control characters and enforces a max length
 */

/** Maximum length for any CMS text value (matches validation.ts MAX_TEXT_LENGTH). */
const MAX_CMS_TEXT_LENGTH = 2000

/**
 * Allowed field names per CMS section.
 * Mirrors the field names used in bot.ts `startEdit` and `handleStatefulInput`.
 */
export const EDIT_FIELD_ALLOWLIST: Record<string, ReadonlyArray<string>> = {
  schedule: ['name', 'category', 'level', 'description'],
  subscriptions: ['name', 'price', 'description', 'conditions'],
  team: ['name', 'specialization', 'bio'],
  life: ['title', 'date', 'text'],
  reviews: ['name', 'text'],
  contacts: ['phone', 'address', 'email', 'vk', 'telegram', 'whatsapp'],
}

/**
 * Returns `true` if `field` is in the allowlist for the given `section`.
 * Rejects unknown sections, empty strings, and dangerous names (__proto__, constructor, etc.).
 */
export function isAllowedEditField(section: string, field: string): boolean {
  if (!section || !field) return false
  const allowed = EDIT_FIELD_ALLOWLIST[section]
  if (!allowed) return false
  return allowed.includes(field)
}

/**
 * Sanitize a CMS text value from raw Telegram input.
 *
 * 1. Strip C0 control characters (U+0000–U+001F)
 * 2. Strip C1 control characters (U+007F–U+009F)
 * 3. Trim whitespace
 * 4. Cap at MAX_CMS_TEXT_LENGTH characters
 */
export function sanitizeCmsText(text: string): string {
  let out = ''
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0
    // Skip C0 (0x00–0x1F) and C1 (0x7F–0x9F) control characters
    if (code <= 0x1f || (code >= 0x7f && code <= 0x9f)) continue
    out += ch
  }
  return out.trim().slice(0, MAX_CMS_TEXT_LENGTH)
}
