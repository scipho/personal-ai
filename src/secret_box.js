// At-rest encryption for credentials stored in D1 (provider API keys, search
// keys, MCP tokens). The AES-GCM key is derived from AUTH_SECRET with
// HKDF-SHA-256, so a D1 dump alone never reveals them. The secret's name is
// bound as additional data, so a ciphertext cannot be moved to another name.
// If AUTH_SECRET is rotated, decryption fails and the UI asks for re-entry.

const encoder = new TextEncoder()
const decoder = new TextDecoder()
const PREFIX = 'enc:v1:'
const SALT = encoder.encode('personal-ai/secrets/v1')
const INFO = encoder.encode('d1-secrets-aes-gcm')

const keyCache = new Map()

function b64(bytes) {
  let bin = ''
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i])
  return btoa(bin)
}

function unb64(text) {
  const bin = atob(text)
  const out = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i)
  return out
}

async function deriveKey(secret) {
  const s = String(secret || '')
  if (s.length < 16) throw new Error('AUTH_SECRET 未設定或過短（至少 16 字元），無法加密金鑰')
  if (keyCache.has(s)) return keyCache.get(s)
  const base = await crypto.subtle.importKey('raw', encoder.encode(s), 'HKDF', false, ['deriveKey'])
  const key = await crypto.subtle.deriveKey(
    { name: 'HKDF', hash: 'SHA-256', salt: SALT, info: INFO },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  )
  if (keyCache.size > 4) keyCache.clear()
  keyCache.set(s, key)
  return key
}

export function isSealed(value) {
  return typeof value === 'string' && value.startsWith(PREFIX)
}

export async function sealSecret(plaintext, secret, aad = '') {
  const key = await deriveKey(secret)
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ct = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, additionalData: encoder.encode(aad) },
    key,
    encoder.encode(String(plaintext ?? '')),
  ))
  return `${PREFIX}${b64(iv)}:${b64(ct)}`
}

export class SecretUnavailableError extends Error {
  constructor(name) {
    super(`無法解密已儲存的金鑰（${name}），可能是 AUTH_SECRET 已更換，請重新輸入`)
    this.code = 'secret_undecryptable'
    this.secretName = name
  }
}

export async function openSecret(sealed, secret, aad = '') {
  if (!isSealed(sealed)) throw new SecretUnavailableError(aad)
  const [ivText, ctText] = sealed.slice(PREFIX.length).split(':')
  if (!ivText || !ctText) throw new SecretUnavailableError(aad)
  try {
    const key = await deriveKey(secret)
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: unb64(ivText), additionalData: encoder.encode(aad) },
      key,
      unb64(ctText),
    )
    return decoder.decode(plain)
  } catch {
    throw new SecretUnavailableError(aad)
  }
}

// Masked hint safe to show in the UI: first 3 + last 4 characters.
export function previewSecret(value) {
  const v = String(value || '')
  if (!v) return ''
  if (v.length <= 8) return '•'.repeat(Math.min(8, v.length))
  return `${v.slice(0, 3)}…${v.slice(-4)}`
}
