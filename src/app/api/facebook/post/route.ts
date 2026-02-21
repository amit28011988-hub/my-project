import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { pageId, accessToken, message, imageBase64, comments } = body

    if (!pageId || !accessToken) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: pageId or accessToken' },
        { status: 400 }
      )
    }

    let postId: string
    let photoId: string | null = null

    // If image is provided, post as photo
    if (imageBase64) {
      // Step 1: Upload photo to Facebook
      const photoUrl = `https://graph.facebook.com/v18.0/${pageId}/photos`
      
      const photoResponse = await fetch(photoUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: imageBase64,
          caption: message,
          access_token: accessToken,
        }),
      })

      const photoResult = await photoResponse.json()

      if (!photoResponse.ok) {
        console.error('Facebook photo upload error:', photoResult)
        return NextResponse.json(
          { 
            success: false, 
            error: photoResult.error?.message || 'Failed to upload photo to Facebook' 
          },
          { status: photoResponse.status }
        )
      }

      photoId = photoResult.id
      postId = photoResult.post_id || photoResult.id

    } else {
      // Post text only
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

      postId = result.id
    }

    // Post comments if provided
    const postedComments: string[] = []
    if (comments && Array.isArray(comments) && comments.length > 0) {
      for (const comment of comments) {
        try {
          const commentUrl = `https://graph.facebook.com/v18.0/${postId}/comments`
          
          const commentResponse = await fetch(commentUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              message: comment,
              access_token: accessToken,
            }),
          })

          const commentResult = await commentResponse.json()
          
          if (commentResponse.ok) {
            postedComments.push(commentResult.id)
          }

          // Small delay between comments to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 500))
          
        } catch (commentError) {
          console.error('Error posting comment:', commentError)
        }
      }
    }

    return NextResponse.json({
      success: true,
      postId: postId,
      photoId: photoId,
      commentsPosted: postedComments.length,
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
