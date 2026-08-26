import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ETSY_AUTH_URL, ETSY_SCOPES, createPkcePair, getEtsyConfig, randomState } from '../../../../lib/etsy'

export async function GET() {
  try {
    const { clientId, redirectUri } = getEtsyConfig()
    const { verifier, challenge } = createPkcePair()
    const state = randomState()
    const cookieStore = cookies()

    cookieStore.set('become_etsy_oauth', JSON.stringify({ state, verifier }), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/etsy',
      maxAge: 10 * 60,
    })

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: ETSY_SCOPES,
      state,
      code_challenge: challenge,
      code_challenge_method: 'S256',
    })

    return NextResponse.redirect(`${ETSY_AUTH_URL}?${params.toString()}`)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unable to start Etsy OAuth' },
      { status: 500 },
    )
  }
}
