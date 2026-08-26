import crypto from 'crypto'

export const ETSY_AUTH_URL = 'https://www.etsy.com/oauth/connect'
export const ETSY_TOKEN_URL = 'https://api.etsy.com/v3/public/oauth/token'

export const ETSY_SCOPES = [
  'listings_r',
  'listings_w',
  'transactions_r',
  'shops_r',
].join(' ')

export function getEtsyConfig() {
  const clientId = process.env.ETSY_CLIENT_ID
  const redirectUri = process.env.ETSY_REDIRECT_URI
  const sessionSecret = process.env.ETSY_SESSION_SECRET

  if (!clientId || !redirectUri || !sessionSecret) {
    throw new Error('Missing Etsy environment variables')
  }

  return { clientId, redirectUri, sessionSecret }
}

export function createPkcePair() {
  const verifier = crypto.randomBytes(32).toString('base64url')
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url')
  return { verifier, challenge }
}

export function randomState() {
  return crypto.randomBytes(32).toString('base64url')
}

function keyFromSecret(secret) {
  return crypto.createHash('sha256').update(secret).digest()
}

export function encryptSession(payload, secret) {
  const iv = crypto.randomBytes(12)
  const key = keyFromSecret(secret)
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv)
  const encrypted = Buffer.concat([cipher.update(JSON.stringify(payload), 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()

  return [iv, tag, encrypted].map((part) => part.toString('base64url')).join('.')
}

export function decryptSession(value, secret) {
  const [ivText, tagText, encryptedText] = value.split('.')
  if (!ivText || !tagText || !encryptedText) return null

  try {
    const decipher = crypto.createDecipheriv('aes-256-gcm', keyFromSecret(secret), Buffer.from(ivText, 'base64url'))
    decipher.setAuthTag(Buffer.from(tagText, 'base64url'))
    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(encryptedText, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
    return JSON.parse(decrypted)
  } catch {
    return null
  }
}

export function setSessionCookie(cookieStore, payload, secret) {
  cookieStore.set('become_etsy_session', encryptSession(payload, secret), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 90,
  })
}
