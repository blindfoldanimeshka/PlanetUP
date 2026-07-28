#!/usr/bin/env node
import { writeFile } from 'fs/promises'

const SHEET_ID = process.env.GOOGLE_SHEET_ID
const API_KEY = process.env.GOOGLE_API_KEY

const SHEETS = [
  'trainers',
  'subscriptions',
  'groups',
  'faq',
  'testimonials',
  'life_posts',
  'gallery',
  'site_settings',
]

async function fetchSheet(sheetName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${sheetName}?key=${API_KEY}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${sheetName}: ${res.status}`)
  const data = await res.json()
  const [headers, ...rows] = data.values || []
  return rows.map((row) => {
    const obj = {}
    headers.forEach((h, i) => {
      obj[h] = row[i] || ''
    })
    return obj
  })
}

async function main() {
  if (!SHEET_ID || !API_KEY) {
    console.warn('⚠️  GOOGLE_SHEET_ID or GOOGLE_API_KEY not set. Skipping CMS fetch.')
    console.warn('   Site will use MOCK data. Set env vars to enable live CMS.')
    process.exit(0)
  }

  const cms = {}
  for (const sheet of SHEETS) {
    try {
      cms[sheet] = await fetchSheet(sheet)
      console.log(`✅ Fetched ${sheet}: ${cms[sheet].length} rows`)
    } catch (err) {
      console.error(`❌ Error fetching ${sheet}:`, err.message)
      process.exit(1)
    }
  }

  await writeFile('public/cms.json', JSON.stringify(cms, null, 2))
  console.log('💾 CMS data saved to public/cms.json')
}

main()
