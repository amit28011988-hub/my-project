import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageId, accessToken, message } = body

    if (!pageId || !accessToken || !message) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: pageId, accessToken, or message' },
        { status: 400 }
      )
    }

    // Post to Facebook Graph API
    const facebookApiUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`
    
    const response = await fetch(facebookApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        access_token: accessToken,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      console.error('Facebook API error:', result)
      return NextResponse.json(
        { 
          success: false, 
          error: result.error?.message || 'Failed to post to Facebook' 
        },
        { status: response.status }
      )
    }

    return NextResponse.json({
      success: true,
      postId: result.id,
      message: 'Successfully posted to Facebook!'
    })

  } catch (error) {
    console.error('Error posting to Facebook:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
