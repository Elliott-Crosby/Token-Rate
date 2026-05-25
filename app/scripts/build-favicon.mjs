import sharp from 'sharp'
import { writeFileSync, readFileSync, unlinkSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appDir = join(__dirname, '..', 'src', 'app')
const src = join(appDir, 'tr-logo-source.webp')

if (!existsSync(src)) {
  console.error(`Missing source: ${src}`)
  process.exit(1)
}

// PNGs Next.js will serve via file-convention routes.
// We bake on a transparent background so the navy circle in the source
// becomes the visible icon shape.
const targets = [
  { out: join(appDir, 'icon.png'), size: 512 },
  { out: join(appDir, 'apple-icon.png'), size: 180 },
]

const buffers = {}
for (const { out, size } of targets) {
  const buf = await sharp(src)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .png()
    .toBuffer()
  writeFileSync(out, buf)
  buffers[size] = buf
  console.log(`wrote ${out} (${buf.length} bytes)`)
}

// Build a multi-resolution ICO (16, 32, 48) from the source.
// Next.js decodes favicon.ico to extract metadata and requires RGBA PNGs inside.
const icoSizes = [16, 32, 48]
const pngs = await Promise.all(
  icoSizes.map((s) =>
    sharp(src)
      .resize(s, s, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .ensureAlpha()
      .png({ force: true })
      .toBuffer()
  )
)

// ICO container: 6-byte header + 16 bytes per entry + image data.
const header = Buffer.alloc(6)
header.writeUInt16LE(0, 0) // reserved
header.writeUInt16LE(1, 2) // type: 1 = ICO
header.writeUInt16LE(icoSizes.length, 4)

const entries = []
const images = []
let offset = 6 + 16 * icoSizes.length

for (let i = 0; i < icoSizes.length; i++) {
  const s = icoSizes[i]
  const png = pngs[i]
  const e = Buffer.alloc(16)
  e.writeUInt8(s === 256 ? 0 : s, 0) // width (0 = 256)
  e.writeUInt8(s === 256 ? 0 : s, 1) // height
  e.writeUInt8(0, 2)                 // color count
  e.writeUInt8(0, 3)                 // reserved
  e.writeUInt16LE(1, 4)              // color planes
  e.writeUInt16LE(32, 6)             // bits per pixel
  e.writeUInt32LE(png.length, 8)     // size
  e.writeUInt32LE(offset, 12)        // offset
  entries.push(e)
  images.push(png)
  offset += png.length
}

const ico = Buffer.concat([header, ...entries, ...images])
const icoPath = join(appDir, 'favicon.ico')
writeFileSync(icoPath, ico)
console.log(`wrote ${icoPath} (${ico.length} bytes)`)

// Clean up the source artifact so it doesn't ship.
unlinkSync(src)
console.log(`removed source ${src}`)
