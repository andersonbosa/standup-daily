import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Log para Vercel Analytics
    console.log('[FEEDBACK] User liked the tool 👍')
    
    return NextResponse.json({ success: true, feedback: 'like' })
  } catch (error) {
    console.error('[FEEDBACK] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to record feedback' }, { status: 500 })
  }
}

