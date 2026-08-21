// Backup codes: the full app state serialized to a compact, copyable
// string. "MYFIT1." codes are gzip-compressed (browsers with
// CompressionStream); "MYFIT0." codes are plain base64 so restore works
// everywhere either kind was produced.

const GZIP_PREFIX = 'MYFIT1.'
const PLAIN_PREFIX = 'MYFIT0.'

function bytesToBase64(bytes) {
  let binary = ''
  const chunk = 0x8000
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk))
  }
  return btoa(binary)
}

function base64ToBytes(b64) {
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function gzip(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

async function gunzip(bytes) {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'))
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

export async function encodeBackup(payload) {
  const json = JSON.stringify(payload)
  const raw = new TextEncoder().encode(json)
  if (typeof CompressionStream !== 'undefined') {
    try {
      return GZIP_PREFIX + bytesToBase64(await gzip(raw))
    } catch {
      // fall through to plain encoding
    }
  }
  return PLAIN_PREFIX + bytesToBase64(raw)
}

export async function decodeBackup(code) {
  const trimmed = String(code).trim().replace(/\s+/g, '')
  let bytes
  if (trimmed.startsWith(GZIP_PREFIX)) {
    if (typeof DecompressionStream === 'undefined') {
      throw new Error('This browser cannot read compressed backup codes')
    }
    bytes = await gunzip(base64ToBytes(trimmed.slice(GZIP_PREFIX.length)))
  } else if (trimmed.startsWith(PLAIN_PREFIX)) {
    bytes = base64ToBytes(trimmed.slice(PLAIN_PREFIX.length))
  } else {
    // Maybe the user pasted raw backup-file JSON instead of a code.
    try {
      return JSON.parse(code)
    } catch {
      throw new Error('Unrecognized backup code — it should start with MYFIT')
    }
  }
  return JSON.parse(new TextDecoder().decode(bytes))
}
