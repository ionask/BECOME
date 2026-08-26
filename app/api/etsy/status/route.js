import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { decryptSession, getEtsyConfig } from '../../../../lib/etsy'

export async function GET() {
  try {
    const { sessionSecret } = getEtsyConfig()
    const session = cookies().get('become_etsy_session')
    const data = session ? decryptSession(session.value, sessionSecret) : null

    return NextResponse.json({
      connected: Boolean(data?.accessToken),
      scope: data?.scope || null,
      expiresAt: data?.expiresAt || null,
    })
  } catch {
    return NextResponse.json({ connected: false })
  }
}
