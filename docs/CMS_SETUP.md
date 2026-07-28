# CMS Setup — Google Sheets

Сайт может получать контент из Google Sheets (8 листов) и пересобираться автоматически при редактировании таблицы.

## 1. Структура таблицы

Создайте Google Sheets с 8 листами (названия точно как указано):

| Лист | Колонки (первая строка — заголовки) |
|------|-------------------------------------|
| `trainers` | id, name, specialization, bio, photoUrl, social |
| `subscriptions` | id, name, price, description, conditions, sortOrder |
| `groups` | id, name, category, level, schedule, description, photoUrl |
| `faq` | id, question, answer, sortOrder |
| `testimonials` | id, name, text, photoUrl |
| `life_posts` | id, title, text, date, coverPhotoUrl, albumPhotoUrls |
| `gallery` | id, photoUrl, category, sortOrder |
| `site_settings` | key, value |

**site_settings** — key-value пары: `phone`, `address`, `email`, `social.vk`, `social.telegram`, `social.whatsapp`, `hero.title`, `hero.subtitle`, `seo.title`, `seo.description`.

## 2. Доступ для API

1. Откройте таблицу → **Share** → **Anyone with the link can view**.
2. Скопируйте `SHEET_ID` из URL: `https://docs.google.com/spreadsheets/d/SHEET_ID/edit`.

## 3. Google API Key

1. [Google Cloud Console](https://console.cloud.google.com/) → новый проект.
2. **APIs & Services** → **Enable APIs** → включите **Google Sheets API**.
3. **Credentials** → **Create credentials** → **API key**.
4. Ограничьте ключ: **HTTP referrers** (опционально) и **API** = Google Sheets API.
5. Скопируйте ключ — это `GOOGLE_API_KEY`.

## 4. Переменные окружения (локально / CI)

```bash
GOOGLE_SHEET_ID=your_sheet_id_here
GOOGLE_API_KEY=your_api_key_here
```

При сборке `npm run build` автоматически запускает `scripts/fetch-cms.js`:
- если переменные заданы — скачивает данные в `public/cms.json`;
- если не заданы — пропускает fetch, сайт использует MOCK-данные.

## 5. Авто-rebuild (webhook)

При редактировании таблицы сайт должен пересобраться.

### 5.1 Vercel Deploy Hook

1. Vercel Dashboard → Project → **Settings** → **Git** → **Deploy Hooks**.
2. Создайте hook, скопируйте URL.

### 5.2 Google Apps Script

В редакторе таблицы: **Extensions** → **Apps Script**.

```javascript
function onEdit(e) {
  const deployHook = 'https://api.vercel.com/v1/integrations/deploy/YOUR_HOOK_URL'
  UrlFetchApp.fetch(deployHook, { method: 'POST' })
}
```

Сохраните и привяжите триггер: **Triggers** → **Add trigger** → **onEdit** → **From spreadsheet** → **On edit**.

> Важно: deploy hook URL хранится только в скрипте Google, не в репозитории.

## 6. Изображения

Фото хранятся на **Google Drive** (публичные ссылки). URL изображений вставляются в соответствующие колонки таблицы.
