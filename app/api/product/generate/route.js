import { NextResponse } from 'next/server'

const fallbackGenerate = ({ idea, category, audience, style, cost }) => {
  const cleanIdea = idea.trim() || 'Minimalist creative product'
  const cleanCategory = category.trim() || 'digital product'
  const cleanAudience = audience.trim() || 'modern shoppers'
  const cleanStyle = style.trim() || 'minimal, warm and premium'
  const numericCost = Number.parseFloat(cost) || 0
  const suggestedPrice = Math.max(9, Math.ceil((numericCost * 4 || 18) * 2) / 2)
  const words = cleanIdea.toLowerCase().replace(/[^a-z0-9\s]/gi, '').split(/\s+/).filter(Boolean)
  const tags = [...new Set([
    ...words.slice(0, 3),
    cleanCategory,
    'minimalist',
    'modern gift',
    'digital download',
    'instant download',
    'creator gift',
    'printable',
    'modern home',
  ])].slice(0, 13)

  return {
    title: `${cleanIdea} | ${cleanStyle.split(',')[0]} ${cleanCategory}`.slice(0, 140),
    description: `A thoughtfully designed ${cleanCategory} created for ${cleanAudience}. Inspired by ${cleanIdea.toLowerCase()}, it combines a ${cleanStyle} direction with a clean, easy-to-use experience.\n\nPerfect for shoppers looking for something distinctive, practical and beautifully considered.\n\nWhat you get:\n• Carefully designed ${cleanCategory}\n• Clean, premium presentation\n• Easy to use and ready to enjoy\n\nPlease review the final details, dimensions and delivery information before publishing.`,
    tags,
    price: suggestedPrice,
    rationale: `Suggested from your estimated cost (${numericCost ? `$${numericCost.toFixed(2)}` : 'not provided'}) using a premium creator margin.`,
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const idea = String(body.idea || '')
    const category = String(body.category || '')
    const audience = String(body.audience || '')
    const style = String(body.style || '')
    const cost = String(body.cost || '')

    if (!idea.trim()) {
      return NextResponse.json({ error: 'Tell BECOME what you want to sell first.' }, { status: 400 })
    }

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ ...fallbackGenerate({ idea, category, audience, style, cost }), mode: 'preview' })
    }

    const model = process.env.OPENAI_MODEL || 'gpt-5.6-luna'
    const prompt = `You are BECOME's product strategist for Etsy sellers. Create a polished listing concept from the seller's notes. Do not mention AI. Return ONLY valid JSON with these keys: title (string, max 140 chars), description (string, 500-1200 chars, natural Etsy-friendly copy with short paragraphs), tags (array of exactly 13 concise Etsy search tags), price (number in USD, sensible for the category and cost), rationale (one short sentence explaining the price). Avoid keyword stuffing, unsupported claims, trademarked brand names, and fake specifications.\n\nSeller notes:\nProduct idea: ${idea}\nCategory: ${category || 'not specified'}\nTarget audience: ${audience || 'not specified'}\nVisual/style direction: ${style || 'not specified'}\nEstimated cost: ${cost || 'not specified'}`

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        input: prompt,
      }),
    })

    if (!response.ok) {
      const detail = await response.text()
      console.error('OpenAI product generation failed:', detail)
      return NextResponse.json({ ...fallbackGenerate({ idea, category, audience, style, cost }), mode: 'preview' })
    }

    const data = await response.json()
    const raw = data.output_text || data.output?.flatMap((item) => item.content || []).map((item) => item.text || '').join('') || ''
    const generated = JSON.parse(raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, ''))

    return NextResponse.json({
      title: String(generated.title || '').slice(0, 140),
      description: String(generated.description || ''),
      tags: Array.isArray(generated.tags) ? generated.tags.slice(0, 13).map(String) : [],
      price: Number(generated.price) || 0,
      rationale: String(generated.rationale || ''),
      mode: 'ai',
    })
  } catch (error) {
    console.error('Product generation error:', error)
    return NextResponse.json({ error: 'BECOME could not generate this product yet.' }, { status: 500 })
  }
}
