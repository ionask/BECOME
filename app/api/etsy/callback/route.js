import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { ETSY_TOKEN_URL, getEtsyConfig, setSessionCookie } from '../../../../lib/etsy'

export async function GET(request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')
  const state = url.searchParams.get('state')
  const error = url.searchParams.get('error')
  const errorDescription = url.searchParams.get('error_description')
  const cookieStore = cookies()
  const oauthCookie = cookieStore.get('become_etsy_oauth')

  if (error) {
    return NextResponse.redirect(new URL(`/?etsy_error=${encodeURIComponent(errorDescription || error)}`, request.url))
  }

  if (!code || !state || !oauthCookie) {
    return NextResponse.json({ error: 'Missing Etsy OAuth callback data' }, { status: 400 })
  }

  let oauthState
  try {
    oauthState = JSON.parse(oauthCookie.value)
  } catch {
    return NextResponse.json({ error: 'Invalid OAuth session' }, { status: 400 })
  }

  if (state !== oauthState.state) {
    return NextResponse.json({ error: 'Invalid OAuth state' }, { status: 403 })
  }

  try {
    const { clientId, redirectUri, sessionSecret } = getEtsyConfig()
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: clientId,
      redirect_uri: redirectUri,
      code,
      code_verifier: oauthState.verifier,
    })

    const response = await fetch(ETSY_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      cache: 'no-store',
    })

    const tokenData = await response.json()
    if (!response.ok) {
      return NextResponse.json({ error: tokenData }, { status: response.status })
    }

    setSessionCookie(cookieStore, {
      accessToken: tokenData.access_token,
      refreshToken: tokenData.refresh_token,
      expiresAt: Date.now() + (tokenData.expires_in || 3600) * 1000,
      scope: tokenData.scope || '',
    }, sessionSecret)

    cookieStore.delete('become_etsy_oauth')
    return NextResponse.redirect(new URL('/?etsy=connected', request.url))
  } catch (callbackError) {
    return NextResponse.json(
      { error: callbackError instanceof Error ? callbackError.message : 'Etsy OAuth failed' },
      { status: 500 },
    )
  }
}
