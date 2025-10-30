import { type NextRequest, NextResponse } from 'next/server'

const GIPHY_API_KEY = process.env.GIPHY_API_KEY
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(',') || []

// Cache simples em memória
interface CacheEntry {
  data: any
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 24 * 60 * 60 * 1000 // 24 horas em millisegundos

function getCacheKey(query: string, limit: string): string {
  return `${query.toLowerCase()}-${limit}`
}

function getFromCache(key: string): any | null {
  const entry = cache.get(key)
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }

  return entry.data
}

function setCache(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

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

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    if (!GIPHY_API_KEY) {
      return NextResponse.json(
        { error: 'Giphy API key not configured' },
        { status: 500 }
      )
    }

    // Verificar cache primeiro
    const cacheKey = getCacheKey(query, limit)
    const cachedData = getFromCache(cacheKey)

    let data: any

    if (cachedData) {
      console.log(`Cache HIT for query: ${query}`)
      data = cachedData
    } else {
      console.log(`Cache MISS for query: ${query} - Fetching from Giphy API`)
      
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

      data = await giphyResponse.json()
      
      // Salvar no cache
      setCache(cacheKey, data)
    }

    // Retornar apenas os dados necessários com headers CORS e Cache
    const response = NextResponse.json({
      data: data.data || [],
    })

    // Adicionar headers CORS
    if (origin) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type')
    }

    // Adicionar headers de cache HTTP (24 horas)
    response.headers.set('Cache-Control', 'public, s-maxage=86400, stale-while-revalidate=43200')
    response.headers.set('CDN-Cache-Control', 'public, s-maxage=86400')
    response.headers.set('Vercel-CDN-Cache-Control', 'public, s-maxage=86400')

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

