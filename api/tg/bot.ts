import {
  getGroups,
  getSubscriptions,
  getTrainers,
  getGallery,
  getLifePosts,
  getTestimonials,
  getSettings,
  upsertGroup,
  deleteGroup,
  upsertSubscription,
  deleteSubscription,
  upsertTrainer,
  deleteTrainer,
  addGalleryItem,
  deleteGalleryItem,
  upsertLifePost,
  deleteLifePost,
  upsertTestimonial,
  deleteTestimonial,
  updateSettings,
  setAdminState,
  clearAdminState,
  type AdminState,
} from '../../src/lib/storage.js'
import type { Group, Subscription, Trainer, LifePost, Testimonial, GalleryItem } from '../../src/types/cms.js'
import { escapeHtml } from '../../src/lib/escapeHtml.js'
import { isAllowedEditField, sanitizeCmsText } from '../../src/lib/botCmsGuard.js'
import { sendMessage } from './webhook.js'

/* ------------------------------------------------------------------ */
/*  Keyboard builders                                                  */
/* ------------------------------------------------------------------ */

function mainMenuKeyboard() {
  return {
    inline_keyboard: [
      [{ text: '📅 Расписание', callback_data: 'sec:schedule' }],
      [{ text: '💳 Абонементы', callback_data: 'sec:subscriptions' }],
      [{ text: '👥 Команда', callback_data: 'sec:team' }],
      [{ text: '🖼 Галерея', callback_data: 'sec:gallery' }],
      [{ text: '📰 Жизнь коллектива', callback_data: 'sec:life' }],
      [{ text: '⭐ Отзывы', callback_data: 'sec:reviews' }],
      [{ text: '📇 Контакты', callback_data: 'sec:contacts' }],
    ],
  }
}

function sectionMenuKeyboard(section: string, items: { id: string; label: string }[]) {
  const rows = items.map((item) => [
    { text: item.label, callback_data: `view:${section}:${item.id}` },
  ])
  rows.push([{ text: '➕ Добавить', callback_data: `add:${section}` }])
  rows.push([{ text: '← Назад', callback_data: 'menu' }])
  return { inline_keyboard: rows }
}

function itemActionsKeyboard(section: string, id: string) {
  return {
    inline_keyboard: [
      [{ text: '✏️ Редактировать', callback_data: `edit:${section}:${id}` }],
      [{ text: '🗑 Удалить', callback_data: `del:${section}:${id}` }],
      [{ text: '← Назад', callback_data: `sec:${section}` }],
    ],
  }
}

function editFieldsKeyboard(section: string, id: string, fields: string[]) {
  const rows = fields.map((f) => [{ text: f, callback_data: `field:${section}:${id}:${f}` }])
  rows.push([{ text: '← Назад', callback_data: `view:${section}:${id}` }])
  return { inline_keyboard: rows }
}

function cancelKeyboard() {
  return { inline_keyboard: [[{ text: '❌ Отмена', callback_data: 'cancel' }]] }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function uid(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}`
}

async function reply(token: string, chatId: number, text: string, keyboard?: any) {
  return sendMessage(token, chatId, text, keyboard ? { reply_markup: keyboard } : undefined)
}

/* ------------------------------------------------------------------ */
/*  Commands                                                           */
/* ------------------------------------------------------------------ */

export async function handleCommand(token: string, chatId: number, text: string) {
  const cmd = text.split(/\s+/)[0].toLowerCase()

  switch (cmd) {
    case '/start':
    case '/menu':
      await clearAdminState(chatId)
      await reply(
        token,
        chatId,
        '<b>Планета UP — админка</b>\n\nВыберите раздел для редактирования:',
        mainMenuKeyboard()
      )
      break

    case '/help':
      await reply(
        token,
        chatId,
        '<b>Команды:</b>\n' +
          '/start или /menu — главное меню\n' +
          '/schedule — расписание\n' +
          '/subscriptions — абонементы\n' +
          '/team — команда\n' +
          '/gallery — галерея\n' +
          '/life — жизнь коллектива\n' +
          '/reviews — отзывы\n' +
          '/contacts — контакты\n\n' +
          'В каждом разделе можно добавлять, редактировать и удалять элементы.'
      )
      break

    case '/schedule':
      await showSection(token, chatId, 'schedule')
      break
    case '/subscriptions':
      await showSection(token, chatId, 'subscriptions')
      break
    case '/team':
      await showSection(token, chatId, 'team')
      break
    case '/gallery':
      await showSection(token, chatId, 'gallery')
      break
    case '/life':
      await showSection(token, chatId, 'life')
      break
    case '/reviews':
      await showSection(token, chatId, 'reviews')
      break
    case '/contacts':
      await showSection(token, chatId, 'contacts')
      break

    default:
      await reply(token, chatId, 'Неизвестная команда. Напишите /menu для показа меню.')
  }
}

/* ------------------------------------------------------------------ */
/*  Section views                                                      */
/* ------------------------------------------------------------------ */

async function showSection(token: string, chatId: number, section: string) {
  await clearAdminState(chatId)

  switch (section) {
    case 'schedule': {
      const groups = await getGroups()
      if (!groups.length) {
        await reply(token, chatId, 'Расписание пустое. Нажмите «➕ Добавить».', sectionMenuKeyboard('schedule', []))
        return
      }
      const items = groups.map((g: Group) => ({ id: g.id, label: `${g.name} (${g.category})` }))
      await reply(token, chatId, '<b>📅 Расписание</b>\nВыберите группу:', sectionMenuKeyboard('schedule', items))
      break
    }

    case 'subscriptions': {
      const subs = await getSubscriptions()
      const items = subs.map((s: Subscription) => ({ id: s.id, label: `${s.name} — ${s.price}` }))
      await reply(token, chatId, '<b>💳 Абонементы</b>\nВыберите абонемент:', sectionMenuKeyboard('subscriptions', items))
      break
    }

    case 'team': {
      const trainers = await getTrainers()
      const items = trainers.map((t: Trainer) => ({ id: t.id, label: t.name }))
      await reply(token, chatId, '<b>👥 Команда</b>\nВыберите тренера:', sectionMenuKeyboard('team', items))
      break
    }

    case 'gallery': {
      const items = await getGallery()
      const list = items.map((i: GalleryItem) => ({ id: i.id, label: i.category }))
      await reply(token, chatId, '<b>🖼 Галерея</b>\nВыберите фото:', sectionMenuKeyboard('gallery', list))
      break
    }

    case 'life': {
      const posts = await getLifePosts()
      const items = posts.map((p: LifePost) => ({ id: p.id, label: p.title }))
      await reply(token, chatId, '<b>📰 Жизнь коллектива</b>\nВыберите пост:', sectionMenuKeyboard('life', items))
      break
    }

    case 'reviews': {
      const reviews = await getTestimonials()
      const items = reviews.map((r: Testimonial) => ({ id: r.id, label: `${r.name}: ${r.text.slice(0, 30)}...` }))
      await reply(token, chatId, '<b>⭐ Отзывы</b>\nВыберите отзыв:', sectionMenuKeyboard('reviews', items))
      break
    }

    case 'contacts': {
      const settings = await getSettings()
      if (!settings) {
        await reply(token, chatId, 'Настройки не найдены.')
        return
      }
      await reply(
        token,
        chatId,
        `<b>📇 Контакты</b>\n\n` +
          `📞 Телефон: ${escapeHtml(settings.phone)}\n` +
          `📍 Адрес: ${escapeHtml(settings.address)}\n` +
          `✉️ Email: ${escapeHtml(settings.email)}\n` +
          `🌐 VK: ${escapeHtml(settings.social.vk)}\n` +
          `✈️ Telegram: ${escapeHtml(settings.social.telegram)}\n` +
          `📱 WhatsApp: ${escapeHtml(settings.social.whatsapp)}`,
        {
          inline_keyboard: [
            [{ text: '✏️ Редактировать', callback_data: 'edit:contacts:settings' }],
            [{ text: '← Назад', callback_data: 'menu' }],
          ],
        }
      )
      break
    }
  }
}

/* ------------------------------------------------------------------ */
/*  View item details                                                  */
/* ------------------------------------------------------------------ */

async function viewItem(token: string, chatId: number, section: string, id: string) {
  switch (section) {
    case 'schedule': {
      const groups = await getGroups()
      const g = groups.find((x: Group) => x.id === id)
      if (!g) return await reply(token, chatId, 'Группа не найдена.')
      const schedule = g.schedule.map((s: any) => `${s.day} ${s.time}${s.note ? ` (${s.note})` : ''}`).join('\n')
      await reply(
        token,
        chatId,
        `<b>${escapeHtml(g.name)}</b>\nКатегория: ${g.category}\nУровень: ${escapeHtml(g.level)}\n\n${escapeHtml(g.description)}\n\n<b>Расписание:</b>\n${schedule}`,
        itemActionsKeyboard('schedule', id)
      )
      break
    }

    case 'subscriptions': {
      const subs = await getSubscriptions()
      const s = subs.find((x: Subscription) => x.id === id)
      if (!s) return await reply(token, chatId, 'Абонемент не найден.')
      await reply(
        token,
        chatId,
        `<b>${escapeHtml(s.name)}</b>\nЦена: ${escapeHtml(s.price)}\n\n${escapeHtml(s.description)}\n\n<u>Условия:</u> ${escapeHtml(s.conditions)}`,
        itemActionsKeyboard('subscriptions', id)
      )
      break
    }

    case 'team': {
      const trainers = await getTrainers()
      const t = trainers.find((x: Trainer) => x.id === id)
      if (!t) return await reply(token, chatId, 'Тренер не найден.')
      await reply(
        token,
        chatId,
        `<b>${escapeHtml(t.name)}</b>\n${escapeHtml(t.specialization)}\n\n${escapeHtml(t.bio)}`,
        itemActionsKeyboard('team', id)
      )
      break
    }

    case 'gallery': {
      const items = await getGallery()
      const item = items.find((x: GalleryItem) => x.id === id)
      if (!item) return await reply(token, chatId, 'Фото не найдено.')
      await reply(token, chatId, `<b>🖼 Галерея</b>\nКатегория: ${item.category}`, itemActionsKeyboard('gallery', id))
      break
    }

    case 'life': {
      const posts = await getLifePosts()
      const p = posts.find((x: LifePost) => x.id === id)
      if (!p) return await reply(token, chatId, 'Пост не найден.')
      await reply(
        token,
        chatId,
        `<b>${escapeHtml(p.title)}</b>\nДата: ${p.date}\n\n${escapeHtml(p.text)}`,
        itemActionsKeyboard('life', id)
      )
      break
    }

    case 'reviews': {
      const reviews = await getTestimonials()
      const r = reviews.find((x: Testimonial) => x.id === id)
      if (!r) return await reply(token, chatId, 'Отзыв не найден.')
      await reply(
        token,
        chatId,
        `<b>${escapeHtml(r.name)}</b>\n\n${escapeHtml(r.text)}`,
        itemActionsKeyboard('reviews', id)
      )
      break
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Add item flows                                                     */
/* ------------------------------------------------------------------ */

async function startAdd(token: string, chatId: number, section: string) {
  switch (section) {
    case 'schedule': {
      await setAdminState(chatId, {
        section,
        action: 'add',
        draft: { id: uid('grp'), category: 'adults', schedule: [] },
        updatedAt: Date.now(),
      })
      await reply(
        token,
        chatId,
        '<b>➕ Новая группа</b>\n\nВведите название группы:',
        cancelKeyboard()
      )
      break
    }

    case 'subscriptions': {
      await setAdminState(chatId, {
        section,
        action: 'add',
        draft: { id: uid('sub'), price: '', description: '', conditions: '' },
        updatedAt: Date.now(),
      })
      await reply(token, chatId, '<b>➕ Новый абонемент</b>\n\nВведите название:', cancelKeyboard())
      break
    }

    case 'team': {
      await setAdminState(chatId, {
        section,
        action: 'add',
        draft: { id: uid('trainer'), specialization: '', bio: '' },
        updatedAt: Date.now(),
      })
      await reply(token, chatId, '<b>➕ Новый тренер</b>\n\nВведите имя:', cancelKeyboard())
      break
    }

    case 'gallery': {
      await setAdminState(chatId, {
        section,
        action: 'add',
        draft: { id: uid('gal'), category: 'adults' },
        updatedAt: Date.now(),
      })
      await reply(
        token,
        chatId,
        '<b>➕ Новое фото</b>\n\nОтправьте фото боту (как изображение, не файл):',
        cancelKeyboard()
      )
      break
    }

    case 'life': {
      await setAdminState(chatId, {
        section,
        action: 'add',
        draft: { id: uid('life'), date: new Date().toISOString().slice(0, 10), text: '' },
        updatedAt: Date.now(),
      })
      await reply(token, chatId, '<b>➕ Новый пост</b>\n\nВведите заголовок:', cancelKeyboard())
      break
    }

    case 'reviews': {
      await setAdminState(chatId, {
        section,
        action: 'add',
        draft: { id: uid('rev'), text: '' },
        updatedAt: Date.now(),
      })
      await reply(token, chatId, '<b>➕ Новый отзыв</b>\n\nВведите автора:', cancelKeyboard())
      break
    }
  }
}

/* ------------------------------------------------------------------ */
/*  Edit item flows                                                    */
/* ------------------------------------------------------------------ */

async function startEdit(token: string, chatId: number, section: string, id: string) {
  const fields = {
    schedule: ['name', 'category', 'level', 'description'],
    subscriptions: ['name', 'price', 'description', 'conditions'],
    team: ['name', 'specialization', 'bio'],
    life: ['title', 'date', 'text'],
    reviews: ['name', 'text'],
  }[section] ?? []

  if (section === 'contacts') {
    await setAdminState(chatId, { section, action: 'edit', targetId: 'settings', updatedAt: Date.now() })
    await reply(
      token,
      chatId,
      '<b>📇 Редактирование контактов</b>\n\nКакое поле редактируем?',
      editFieldsKeyboard('contacts', 'settings', ['phone', 'address', 'email', 'vk', 'telegram', 'whatsapp'])
    )
    return
  }

  await setAdminState(chatId, { section, action: 'edit', targetId: id, updatedAt: Date.now() })
  await reply(
    token,
    chatId,
    '<b>✏️ Редактирование</b>\n\nКакое поле меняем?',
    editFieldsKeyboard(section, id, fields)
  )
}

/* ------------------------------------------------------------------ */
/*  Delete item                                                        */
/* ------------------------------------------------------------------ */

async function deleteItem(token: string, chatId: number, section: string, id: string) {
  switch (section) {
    case 'schedule':
      await deleteGroup(id)
      break
    case 'subscriptions':
      await deleteSubscription(id)
      break
    case 'team':
      await deleteTrainer(id)
      break
    case 'gallery':
      await deleteGalleryItem(id)
      break
    case 'life':
      await deleteLifePost(id)
      break
    case 'reviews':
      await deleteTestimonial(id)
      break
  }
  await reply(token, chatId, '✅ Удалено.')
  await showSection(token, chatId, section)
}

/* ------------------------------------------------------------------ */
/*  State machine — handle text/callback based on current state        */
/* ------------------------------------------------------------------ */

export async function handleCallback(
  token: string,
  chatId: number,
  input: { type: string; text?: string; data?: string; photo?: any[] },
  state?: AdminState
) {
  const text = input.text?.trim() ?? ''
  const data = input.data?.trim() ?? ''

  // --- Inline button pressed ---
  if (input.type === 'callback') {
    if (data === 'menu') {
      await handleCommand(token, chatId, '/menu')
      return
    }
    if (data === 'cancel') {
      await clearAdminState(chatId)
      await reply(token, chatId, '❌ Действие отменено.', mainMenuKeyboard())
      return
    }

    const [action, section, id] = data.split(':')

    if (action === 'sec') {
      await showSection(token, chatId, section)
      return
    }
    if (action === 'view') {
      await viewItem(token, chatId, section, id)
      return
    }
    if (action === 'add') {
      await startAdd(token, chatId, section)
      return
    }
    if (action === 'edit') {
      await startEdit(token, chatId, section, id)
      return
    }
    if (action === 'del') {
      await deleteItem(token, chatId, section, id)
      return
    }
    if (action === 'field') {
      const field = data.split(':')[3]
      if (!state) return
      if (!isAllowedEditField(section, field)) {
        await reply(token, chatId, '❌ Недопустимое поле для редактирования.')
        return
      }
      await setAdminState(chatId, {
        ...state,
        action: `awaiting:${field}`,
        updatedAt: Date.now(),
      })
      await reply(token, chatId, `Введите значение для <b>${escapeHtml(field)}</b>:`, cancelKeyboard())
      return
    }
    return
  }

  // --- Text input (state-driven) ---
  if (input.type === 'text' && state) {
    await handleStatefulInput(token, chatId, state, text)
    return
  }

  // --- Photo upload ---
  if (input.type === 'photo' && state && input.photo) {
    await handlePhotoUpload(token, chatId, state, input.photo)
    return
  }
}

/* ------------------------------------------------------------------ */
/*  Stateful text input handler                                        */
/* ------------------------------------------------------------------ */

async function handleStatefulInput(token: string, chatId: number, state: AdminState, text: string) {
  const { section, action, draft } = state

  // ADD flow — collect fields sequentially
  if (action === 'add') {
    const d = draft as Record<string, any>

    // Schedule add
    if (section === 'schedule') {
      if (!d.name) {
        d.name = text
        await setAdminState(chatId, { ...state, draft: d })
        await reply(token, chatId, 'Введите уровень (например, «Начинающие»):', cancelKeyboard())
        return
      }
      if (!d.level) {
        d.level = text
        await setAdminState(chatId, { ...state, draft: d })
        await reply(token, chatId, 'Введите описание:', cancelKeyboard())
        return
      }
      if (!d.description) {
        d.description = text
        d.schedule = d.schedule ?? []
        await setAdminState(chatId, { ...state, draft: d })
        await reply(token, chatId, 'Введите расписание (день время, например «Пн 19:00»). Пусто — завершить:', cancelKeyboard())
        return
      }
      if (text === '') {
        await upsertGroup(d as any)
        await clearAdminState(chatId)
        await reply(token, chatId, '✅ Группа добавлена!')
        await showSection(token, chatId, 'schedule')
        return
      }
      // Parse schedule line
      const parts = text.split(/\s+/)
      d.schedule.push({ day: parts[0], time: parts.slice(1).join(' ') })
      await setAdminState(chatId, { ...state, draft: d })
      await reply(token, chatId, 'Ещё день (или пусто для завершения):', cancelKeyboard())
      return
    }

    // Subscriptions add
    if (section === 'subscriptions') {
      if (!d.name) {
        d.name = text
        await setAdminState(chatId, { ...state, draft: d })
        await reply(token, chatId, 'Введите цену (например, «4 500 ₽»):', cancelKeyboard())
        return
      }
      if (!d.price) {
        d.price = text
        await setAdminState(chatId, { ...state, draft: d })
        await reply(token, chatId, 'Введите описание:', cancelKeyboard())
        return
      }
      if (!d.description) {
        d.description = text
        await setAdminState(chatId, { ...state, draft: d })
        await reply(token, chatId, 'Введите условия:', cancelKeyboard())
        return
      }
      if (!d.conditions) {
        d.conditions = text
        d.sortOrder = (await getSubscriptions()).length + 1
        await upsertSubscription(d as any)
        await clearAdminState(chatId)
        await reply(token, chatId, '✅ Абонемент добавлен!')
        await showSection(token, chatId, 'subscriptions')
        return
      }
    }

    // Team add
    if (section === 'team') {
      if (!d.name) {
        d.name = text
        await setAdminState(chatId, { ...state, draft: d })
        await reply(token, chatId, 'Введите специализацию:', cancelKeyboard())
        return
      }
      if (!d.specialization) {
        d.specialization = text
        await setAdminState(chatId, { ...state, draft: d })
        await reply(token, chatId, 'Введите bio:', cancelKeyboard())
        return
      }
      if (!d.bio) {
        d.bio = text
        await setAdminState(chatId, { ...state, draft: d })
        await reply(token, chatId, 'Отправьте фото тренера (или /skip):', cancelKeyboard())
        return
      }
    }

    // Life add
    if (section === 'life') {
      if (!d.title) {
        d.title = text
        await setAdminState(chatId, { ...state, draft: d })
        await reply(token, chatId, 'Введите текст поста:', cancelKeyboard())
        return
      }
      if (!d.text) {
        d.text = text
        await upsertLifePost(d as any)
        await clearAdminState(chatId)
        await reply(token, chatId, '✅ Пост добавлен!')
        await showSection(token, chatId, 'life')
        return
      }
    }

    // Reviews add
    if (section === 'reviews') {
      if (!d.name) {
        d.name = text
        await setAdminState(chatId, { ...state, draft: d })
        await reply(token, chatId, 'Введите текст отзыва:', cancelKeyboard())
        return
      }
      if (!d.text) {
        d.text = text
        await upsertTestimonial(d as any)
        await clearAdminState(chatId)
        await reply(token, chatId, '✅ Отзыв добавлен!')
        await showSection(token, chatId, 'reviews')
        return
      }
    }
  }

  // EDIT flow — field update
  if (action === 'edit' || action?.startsWith('awaiting:')) {
    const field = action === 'edit' ? null : action.split(':')[1]
    if (!field) return

    // Contacts edit
    if (section === 'contacts') {
      const settings = await getSettings()
      if (!settings) return
      if (!isAllowedEditField('contacts', field)) return
      const sanitized = sanitizeCmsText(text)
      const keyMap: Record<string, any> = {
        phone: (v: string) => ({ ...settings, phone: v, phoneHref: `tel:${v.replace(/\D/g, '')}` }),
        address: (v: string) => ({ ...settings, address: v }),
        email: (v: string) => ({ ...settings, email: v }),
        vk: (v: string) => ({ ...settings, social: { ...settings.social, vk: v } }),
        telegram: (v: string) => ({ ...settings, social: { ...settings.social, telegram: v } }),
        whatsapp: (v: string) => ({ ...settings, social: { ...settings.social, whatsapp: v } }),
      }
      if (keyMap[field]) {
        await updateSettings(keyMap[field](sanitized))
        await clearAdminState(chatId)
        await reply(token, chatId, `✅ Поле <b>${escapeHtml(field)}</b> обновлено!`)
        await showSection(token, chatId, 'contacts')
      }
      return
    }

    // Generic section edit
    if (!isAllowedEditField(section, field)) return
    const sanitizedText = sanitizeCmsText(text)
    const updaters: Record<string, (id: string, field: string, value: string) => Promise<void>> = {
      schedule: async (id, f, v) => {
        const groups = await getGroups()
        const g = groups.find((x: Group) => x.id === id)
        if (g) {
          ;(g as any)[f] = v
          await upsertGroup(g)
        }
      },
      subscriptions: async (id, f, v) => {
        const subs = await getSubscriptions()
        const s = subs.find((x: Subscription) => x.id === id)
        if (s) {
          ;(s as any)[f] = v
          await upsertSubscription(s)
        }
      },
      team: async (id, f, v) => {
        const trainers = await getTrainers()
        const t = trainers.find((x: Trainer) => x.id === id)
        if (t) {
          ;(t as any)[f] = v
          await upsertTrainer(t)
        }
      },
      life: async (id, f, v) => {
        const posts = await getLifePosts()
        const p = posts.find((x: LifePost) => x.id === id)
        if (p) {
          ;(p as any)[f] = v
          await upsertLifePost(p)
        }
      },
      reviews: async (id, f, v) => {
        const revs = await getTestimonials()
        const r = revs.find((x: Testimonial) => x.id === id)
        if (r) {
          ;(r as any)[f] = v
          await upsertTestimonial(r)
        }
      },
    }

    if (updaters[section] && state.targetId) {
      await updaters[section](state.targetId, field, sanitizedText)
      await clearAdminState(chatId)
      await reply(token, chatId, `✅ Поле <b>${escapeHtml(field)}</b> обновлено!`)
      await showSection(token, chatId, section)
    }
    return
  }
}

/* ------------------------------------------------------------------ */
/*  Photo upload handler                                               */
/* ------------------------------------------------------------------ */

async function handlePhotoUpload(token: string, chatId: number, state: AdminState, photo: any[]) {
  // Get the largest photo
  const largest = photo[photo.length - 1]
  const fileId = largest.file_id

  // Get file path from Telegram
  const fileRes = (await fetch(
    `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`
  ).then((r) => r.json())) as { ok: boolean; result?: { file_path?: string } }

  if (!fileRes.ok || !fileRes.result?.file_path) {
    await reply(token, chatId, '❌ Не удалось получить файл. Попробуйте ещё раз.')
    return
  }

  const filePath = fileRes.result.file_path
  const fileUrl = `https://api.telegram.org/file/bot${token}/${filePath}`
  const fileName = filePath.split('/').pop() ?? `photo-${Date.now()}.jpg`

  // Download the file
  const fileData = await fetch(fileUrl).then((r) => r.arrayBuffer())

  // Store in /public/media via Vercel Blob or save to a known location
  // For now, we'll use a simple approach: save to public/media if possible,
  // otherwise store the Telegram file_id as the URL (Telegram serves it)
  const publicPath = `/media/${state.section}/${fileName}`

  // Write to public/media (works on local dev; on Vercel use Blob)
  try {
    const { writeFileSync, mkdirSync } = await import('node:fs')
    const { resolve } = await import('node:path')
    const dir = resolve(process.cwd(), 'public', 'media', state.section ?? 'gallery')
    mkdirSync(dir, { recursive: true })
    writeFileSync(resolve(dir, fileName), Buffer.from(fileData))
  } catch {
    // On Vercel, filesystem is read-only — fall back to Telegram CDN URL
  }

  // Update the draft or item
  const d = state.draft as Record<string, any> ?? {}
  if (state.section === 'team') {
    d.photoUrl = publicPath
    await upsertTrainer(d as any)
    await clearAdminState(chatId)
    await reply(token, chatId, '✅ Тренер добавлен с фото!')
    await showSection(token, chatId, 'team')
    return
  }

  if (state.section === 'gallery') {
    await addGalleryItem({
      id: uid('gal'),
      photoUrl: publicPath,
      category: d.category ?? 'adults',
      sortOrder: (await getGallery()).length + 1,
    })
    await clearAdminState(chatId)
    await reply(token, chatId, '✅ Фото добавлено в галерею!')
    await showSection(token, chatId, 'gallery')
    return
  }

  await reply(token, chatId, '✅ Фото получено.')
}
