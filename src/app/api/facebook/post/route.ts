import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageId, accessToken, message, topic, comments } = body

    if (!pageId || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Missing pageId or accessToken' },
        { status: 400 }
      )
    }

    const debugInfo: string[] = []
    let postId: string = ''

    debugInfo.push(`Topic: ${topic || 'none'}`)

    // Try posting with an image from a public URL
    // Using a simple dark background image
    const imageUrl = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1080&h=1080&fit=crop'
    
    debugInfo.push('Attempting photo post with URL...')
    
    // Method 1: Post photo using URL
    const photoUrl = `https://graph.facebook.com/v18.0/${pageId}/photos`
    
    const photoResponse = await fetch(photoUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: imageUrl,
        caption: message,
        access_token: accessToken,
      }),
    })

    const photoResult = await photoResponse.json()
    debugInfo.push(`Photo response status: ${photoResponse.status}`)

    if (photoResponse.ok && photoResult.id) {
      debugInfo.push(`Photo uploaded successfully: ${photoResult.id}`)
      postId = photoResult.post_id || `${pageId}_${photoResult.id}`
    } else {
      // Fallback to text-only post
      debugInfo.push(`Photo failed: ${JSON.stringify(photoResult.error || photoResult)}`)
      debugInfo.push('Falling back to text-only post...')
      
      const feedUrl = `https://graph.facebook.com/v18.0/${pageId}/feed`
      const feedResponse = await fetch(feedUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: message,
          access_token: accessToken,
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
      debugInfo.push(`Text post created: ${postId}`)
    }

    // Post comments
    const postedComments: string[] = []
    const failedComments: string[] = []

    if (comments && Array.isArray(comments) && comments.length > 0) {
      debugInfo.push(`Attempting to post ${comments.length} comments to ${postId}`)
      
      for (let i = 0; i < comments.length; i++) {
        const comment = comments[i]
        if (!comment || !comment.trim()) continue
        
        try {
          const commentUrl = `https://graph.facebook.com/v18.0/${postId}/comments`
          
          const commentResponse = await fetch(commentUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: comment,
              access_token: accessToken,
            }),
          })

          const commentResult = await commentResponse.json()
          
          if (commentResponse.ok && commentResult.id) {
            postedComments.push(commentResult.id)
            debugInfo.push(`✓ Comment ${i + 1}: ${comment.substring(0, 30)}...`)
          } else {
            failedComments.push(comment)
            debugInfo.push(`✗ Comment ${i + 1} failed: ${JSON.stringify(commentResult.error || 'unknown')}`)
          }

          await new Promise(resolve => setTimeout(resolve, 1500))
          
        } catch (err) {
          failedComments.push(comment)
          debugInfo.push(`✗ Comment ${i + 1} error: ${err}`)
        }
      }
    }

    return NextResponse.json({
      success: true,
      postId: postId,
      commentsPosted: postedComments.length,
      commentsFailed: failedComments.length,
      debug: debugInfo,
      message: `Posted successfully! ${postedComments.length} comments added.`
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
