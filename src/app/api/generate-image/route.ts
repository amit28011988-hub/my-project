import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { prompt, topic } = body

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      )
    }

    // Initialize AI SDK
    const zai = await ZAI.create()

    // Enhance prompt for social media background
    const enhancedPrompt = `${prompt}, high quality, professional, suitable for social media post background, no text`

    // Generate image
    const response = await zai.images.generations.create({
      prompt: enhancedPrompt,
      size: '1024x1024'
    })

    if (!response.data || !response.data[0] || !response.data[0].base64) {
      throw new Error('Failed to generate image')
    }

    const imageBase64 = response.data[0].base64

    return NextResponse.json({
      success: true,
      imageBase64: imageBase64,
      topic: topic,
      prompt: enhancedPrompt
    })

  } catch (error) {
    console.error('Error generating image:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Internal server error' 
      },
      { status: 500 }
    )
  }
}
