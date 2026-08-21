/* Generates public/icons/icon-192.png and icon-512.png without any
   dependencies: draws a dumbbell mark into an RGBA buffer and encodes
   it as a PNG using node's zlib. Run with `npm run icons`. */

import zlib from 'node:zlib'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const outDir = path.join(__dirname, '..', 'public', 'icons')

const CRC_TABLE = (() => {
  const t = new Int32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function encodePng(width, height, rgba) {
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0 // filter: none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // color type RGBA
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ])
}

function makeIcon(size) {
  const px = Buffer.alloc(size * size * 4)
  const set = (x, y, r, g, b) => {
    if (x < 0 || y < 0 || x >= size || y >= size) return
    const i = (y * size + x) * 4
    px[i] = r
    px[i + 1] = g
    px[i + 2] = b
    px[i + 3] = 255
  }

  const bg = [20, 23, 28]
  const bar = [229, 231, 235]
  const plateA = [59, 130, 246]
  const plateB = [96, 165, 250]
  const corner = size * 0.22

  // Rounded-square background
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const cx = x < corner ? corner - x : x > size - corner ? x - (size - corner) : 0
      const cy = y < corner ? corner - y : y > size - corner ? y - (size - corner) : 0
      if (cx * cx + cy * cy > corner * corner) continue
      set(x, y, ...bg)
    }
  }

  // Draw a rotated rounded rect (dumbbell parts) in icon-centered coords
  const angle = (-35 * Math.PI) / 180
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  const drawRect = (cx0, cy0, w, h, radius, color) => {
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        // inverse-rotate the pixel into the rect's local frame
        const dx = x - size / 2
        const dy = y - size / 2
        const lx = dx * cos + dy * sin - cx0
        const ly = -dx * sin + dy * cos - cy0
        const ax = Math.abs(lx) - (w / 2 - radius)
        const ay = Math.abs(ly) - (h / 2 - radius)
        const qx = Math.max(ax, 0)
        const qy = Math.max(ay, 0)
        if (qx * qx + qy * qy <= radius * radius) set(x, y, ...color)
      }
    }
  }

  const u = size / 512
  drawRect(0, 0, 300 * u, 30 * u, 14 * u, bar)
  drawRect(-130 * u, 0, 44 * u, 156 * u, 18 * u, plateA)
  drawRect(-72 * u, 0, 36 * u, 116 * u, 16 * u, plateB)
  drawRect(130 * u, 0, 44 * u, 156 * u, 18 * u, plateA)
  drawRect(72 * u, 0, 36 * u, 116 * u, 16 * u, plateB)

  return encodePng(size, size, px)
}

fs.mkdirSync(outDir, { recursive: true })
for (const size of [192, 512]) {
  const file = path.join(outDir, `icon-${size}.png`)
  fs.writeFileSync(file, makeIcon(size))
  console.log('wrote', file)
}
