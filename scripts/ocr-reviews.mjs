#!/usr/bin/env node
import { createWorker } from 'tesseract.js'
import { readdir, mkdir, writeFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'

const INPUT_DIRS = [
  { path: 'raw-assets/для-сайта/Для сайта/Отзывы/отзывы взрослых', audience: 'adults' },
  { path: 'raw-assets/для-сайта/Для сайта/Отзывы/отзывы родителей', audience: 'parents' },
]
const OUT_DIR = 'raw-assets/ocr-out'

function makeId(audience, file) {
  const base = basename(file, extname(file)).replace(/[^a-z0-9а-яё]/gi, '-').toLowerCase()
  return `review-${audience}-${base}`
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true })
  const worker = await createWorker('rus', 1, {
    logger: (m) => m.status === 'recognizing text' && process.stdout.write('.'),
  })

  const results = []
  for (const { path, audience } of INPUT_DIRS) {
    const files = await readdir(path)
    for (const file of files) {
      if (!/\.(jpe?g|png|webp)$/i.test(file)) continue
      const imagePath = `${path}/${file}`
      console.log(`\nOCR ${imagePath}`)
      const { data: { text } } = await worker.recognize(imagePath)
      results.push({
        id: makeId(audience, file),
        file,
        audience,
        rawText: text.trim(),
      })
    }
  }

  await worker.terminate()
  await writeFile(`${OUT_DIR}/reviews-raw.json`, JSON.stringify(results, null, 2))
  console.log(`\n✅ OCR complete: ${results.length} reviews`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
