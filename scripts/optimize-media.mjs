#!/usr/bin/env node
import { readFile, mkdir, writeFile } from 'node:fs/promises'
import { basename, extname, join, dirname } from 'node:path'
import { readdir } from 'node:fs/promises'
import sharp from 'sharp'
import convert from 'heic-convert'

const RAW_ROOT = 'raw-assets/для-сайта/Для сайта'
const OUT_ROOT = 'public/media'

const FOLDER_MAP = {
  'Галерея фото': 'gallery',
  'Главная страница': 'hero',
  'Для взрослых': 'adults',
  'Для детей': 'kids',
  'Жизнь коллектива/Выступления': 'life/performances',
  'Жизнь коллектива/Выступления/лагерь': 'life/performances/camp',
  'Жизнь коллектива/Лагерь/2025 г': 'life/camp-2025',
  'Жизнь коллектива/Лагерь/2026 г': 'life/camp-2026',
  'Жизнь коллектива/Новый год': 'life/new-year',
  'Команда, тренеры': 'team',
}

const SKIP_DIRS = ['Отзывы', '.codegraph', '.omo']
const SKIP_FILES = ['ТЗ сайт.docx']

async function* walk(dir, rel = '') {
  const entries = await readdir(join(dir, rel), { withFileTypes: true })
  for (const entry of entries) {
    const entryRel = rel ? `${rel}/${entry.name}` : entry.name
    const fullPath = join(dir, entryRel)
    if (entry.isDirectory()) {
      if (SKIP_DIRS.includes(entry.name)) continue
      yield* walk(dir, entryRel)
    } else {
      yield { rel: entryRel, fullPath, name: entry.name }
    }
  }
}

function slugify(name) {
  const base = basename(name, extname(name))
  return base
    .toLowerCase()
    .replace(/[^a-z0-9а-яё]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/--+/g, '-')
    || 'image'
}

function isHeic(name) {
  return /\.heic$/i.test(name)
}

function isImage(name) {
  return /\.(jpe?g|png|webp|gif|heic)$/i.test(name)
}

async function processFile(file, outDir, outName) {
  await mkdir(outDir, { recursive: true })
  const outPath = join(outDir, `${outName}.webp`)
  let inputBuffer = await readFile(file.fullPath)

  if (isHeic(file.name)) {
    inputBuffer = Buffer.from(await convert({ buffer: inputBuffer, format: 'JPEG', quality: 0.95 }))
  }

  const isHero = outDir.includes('hero')
  const maxWidth = isHero ? 2560 : 1920

  await sharp(inputBuffer, { failOnError: false })
    .rotate()
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 80, effort: 4 })
    .toFile(outPath)

  return outPath
}

async function main() {
  const outputs = []
  const seenNames = new Map()

  for await (const file of walk(RAW_ROOT)) {
    if (SKIP_FILES.includes(file.name)) continue
    if (!isImage(file.name)) continue

    const relParts = file.rel.split('/')
    const folderKey = relParts.slice(0, -1).join('/')
    const mappedDir = FOLDER_MAP[folderKey]
    if (!mappedDir) {
      console.warn(`⚠️ No mapping for folder "${folderKey}" — skipping ${file.rel}`)
      continue
    }

    const outDir = join(OUT_ROOT, mappedDir)
    let outName = slugify(file.name)
    const key = `${mappedDir}/${outName}`
    if (seenNames.has(key)) {
      const count = seenNames.get(key) + 1
      seenNames.set(key, count)
      outName = `${outName}-${count}`
    } else {
      seenNames.set(key, 0)
    }

    try {
      const outPath = await processFile(file, outDir, outName)
      outputs.push({ source: file.rel, path: outPath.replace(/\\/g, '/') })
      console.log(`✅ ${outPath}`)
    } catch (err) {
      console.error(`❌ Failed ${file.rel}: ${err.message}`)
      process.exitCode = 1
    }
  }

  await mkdir(dirname('tmp/optimize-media-report.json'), { recursive: true }).catch(() => {})
  await writeFile('tmp/optimize-media-report.json', JSON.stringify(outputs, null, 2))
  console.log(`\n💾 Processed ${outputs.length} images`)
}

main()
