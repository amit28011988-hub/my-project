import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageId, accessToken, message, topic, comments } = body

    if (!pageId || !accessToken) {
      return NextResponse.json({ success: false, error: 'Missing pageId or accessToken' }, { status: 400 })
    }

    const debugInfo: string[] = []
    let postId: string = ''

    // Topic-based background images from Unsplash
    const topicImages: Record<string, string> = {
      'AI': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1080&h=1080&fit=crop',
      'technology': 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1080&h=1080&fit=crop',
      'chatgpt': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1080&h=1080&fit=crop',
      'agi': 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1080&h=1080&fit=crop',
      'finance': 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=1080&h=1080&fit=crop',
      'crypto': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1080&h=1080&fit=crop',
      'bitcoin': 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=1080&h=1080&fit=crop',
      'market': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080&h=1080&fit=crop',
      'stock': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1080&h=1080&fit=crop',
      'geopolitics': 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1080&h=1080&fit=crop',
      'world': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1080&h=1080&fit=crop',
      'trade': 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1080&h=1080&fit=crop',
      'brics': 'https://images.unsplash.com/photo-1526470608268-f674ce90ebd4?w=1080&h=1080&fit=crop',
      'defence': 'https://images.unsplash.com/photo-1580745089072-62fcfb4f9cb6?w=1080&h=1080&fit=crop',
      'military': 'https://images.unsplash.com/photo-1580745089072-62fcfb4f9cb6?w=1080&h=1080&fit=crop',
      'security': 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1080&h=1080&fit=crop',
      'cyber': 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1080&h=1080&fit=crop',
      'drone': 'https://images.unsplash.com/photo-1580745089072-62fcfb4f9cb6?w=1080&h=1080&fit=crop',
      'nato': 'https://images.unsplash.com/photo-1580745089072-62fcfb4f9cb6?w=1080&h=1080&fit=crop',
      'business': 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1080&h=1080&fit=crop',
      'default': 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1080&h=1080&fit=crop'
    }

    // Find matching image based on topic keywords
    let imageUrl = topicImages['default']
    const topicLower = (topic || '').toLowerCase()
    
    for (const [key, url] of Object.entries(topicImages)) {
      if (topicLower.includes(key)) {
        imageUrl = url
        break
      }
    }
    
    debugInfo.push(`Topic: ${topic}`)
    debugInfo.push(`Image: ${imageUrl}`)

    // Combine main message with comments into single post
    let fullMessage = message
    if (comments && Array.isArray(comments) && comments.length > 0) {
      fullMessage = message + '\n\n' + comments.join('\n')
    }
    
    debugInfo.push(`Full message length: ${fullMessage.length} characters`)

    // Post photo to Facebook with full message
    const photoUrl = `https://graph.facebook.com/v18.0/${pageId}/photos`
    
    const photoResponse = await fetch(photoUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: imageUrl,
        caption: fullMessage,
        access_token: accessToken,
      }),
    })

    const photoResult = await photoResponse.json()
    debugInfo.push(`Response status: ${photoResponse.status}`)

    if (photoResponse.ok && photoResult.id) {
      postId = photoResult.post_id || `${pageId}_${photoResult.id}`
      debugInfo.push(`✓ Posted successfully: ${postId}`)
    } else {
      // Fallback to text-only post
      debugInfo.push(`Photo failed: ${photoResult.error?.message || 'unknown'}`)
      
      const feedUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`
      const feedResponse = await fetch(feedUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: fullMessage, 
          access_token: accessToken 
        }),
      })
      
      const feedResult = await feedResponse.json()
      
      if (!feedResponse.ok) {
        return NextResponse.json({
          success: false,
          error: feedResult.error?.message || 'Failed to post',
          debug: debugInfo
        }, { status: 400 })
      }
      
      postId = feedResult.id
      debugInfo.push(`✓ Text-only post: ${postId}`)
    }

    return NextResponse.json({
      success: true,
      postId,
      imageUsed: imageUrl,
      debug: debugInfo,
      message: `Posted successfully with ${topic ? 'topic-based' : 'default'} background image!`
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
