import { type NextRequest, NextResponse } from 'next/server'

const GIPHY_API_KEY = process.env.GIPHY_API_KEY
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || []

export async function GET(request: NextRequest) {
  try {
    // Verificar CORS - apenas permitir requisições do próprio domínio
    const origin = request.headers.get('origin')
    const host = request.headers.get('host')

    // Em produção, verificar se origin corresponde ao host ou está na lista de permitidos
    if (process.env.NODE_ENV === 'production') {
      if (!origin) {
        return NextResponse.json(
          { error: 'Forbidden - No origin header' },
          { status: 403 }
        )
      }

      const originHost = new URL(origin).host
      const isAllowed = originHost === host || ALLOWED_ORIGINS.includes(origin)
      console.debug({ originHost, isAllowed })

      if (!isAllowed) {
        return NextResponse.json(
          { error: 'Forbidden - Invalid origin' },
          { status: 403 }
        )
      }
    }

    // Obter query da URL
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    const limit = searchParams.get('limit') || '5'
    console.debug({ searchParams, query, limit })

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    console.debug({ GIPHY_API_KEY })
    if (!GIPHY_API_KEY) {
      return NextResponse.json(
        { error: 'Giphy API key not configured' },
        { status: 500 }
      )
    }

    // Fazer request para Giphy API
    const giphyResponse = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=${encodeURIComponent(query)}&limit=${limit}`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!giphyResponse.ok) {
      throw new Error(`Giphy API error: ${giphyResponse.status}`)
    }

    const data = await giphyResponse.json()

    // Retornar apenas os dados necessários com headers CORS
    const response = NextResponse.json({
      data: data.data || [],
    })

    // Adicionar headers CORS
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    }

    return response
  } catch (error) {
    console.error('Error fetching Giphy GIFs:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin')
  const host = request.headers.get('host')

  // Verificar se origin é permitido
  if (process.env.NODE_ENV === 'production' && origin) {
    const originHost = new URL(origin).host
    const isAllowed = originHost === host || ALLOWED_ORIGINS.includes(origin)

    if (!isAllowed) {
      return new NextResponse(null, { status: 403 })
    }
  }

  const response = new NextResponse(null, { status: 200 })

  if (origin) {
    response.headers.set('Access-Control-Allow-Origin', origin)
    response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.set('Access-Control-Max-Age', '86400')
  }

  return response
}

