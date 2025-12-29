import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import { chat, explainFinancialConcept } from '@/lib/ai/claude'

const prisma = new PrismaClient()

const ChatRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  sessionId: z.string().optional(),
  kidId: z.string().optional(),
})

// POST /api/chat - Chat with Claude AI
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { message, sessionId, kidId } = ChatRequestSchema.parse(body)

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate a session ID if not provided
    const actualSessionId = sessionId || `session-${Date.now()}`

    // Get previous messages from this session
    const previousMessages = await prisma.chatMessage.findMany({
      where: { sessionId: actualSessionId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    })

    // Build conversation history
    const conversationHistory = previousMessages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // Add current message
    conversationHistory.push({
      role: 'user',
      content: message,
    })

    // If kidId is provided, get kid info for context
    let systemPrompt = 'You are a helpful financial education assistant for families.'
    if (kidId) {
      const kid = await prisma.kid.findFirst({
        where: {
          id: kidId,
          userId: dbUser.id,
        },
      })

      if (kid && kid.age) {
        systemPrompt = `You are a friendly financial educator for children.
The child you're talking to is ${kid.name}, age ${kid.age}.
Explain concepts in an age-appropriate way, using simple language and examples.
Be encouraging and positive. Keep responses under 300 words.`

        // Use specialized function for kids
        const response = await explainFinancialConcept(message, kid.age)

        // Save messages to database
        await prisma.chatMessage.createMany({
          data: [
            {
              role: 'user',
              content: message,
              sessionId: actualSessionId,
              metadata: { kidId, kidName: kid.name },
            },
            {
              role: 'assistant',
              content: response,
              sessionId: actualSessionId,
              metadata: { kidId, kidName: kid.name },
            },
          ],
        })

        return NextResponse.json({
          response,
          sessionId: actualSessionId,
        })
      }
    }

    // Regular chat for parents
    const response = await chat(conversationHistory, {
      systemPrompt,
      maxTokens: 1024,
    })

    // Save messages to database
    await prisma.chatMessage.createMany({
      data: [
        {
          role: 'user',
          content: message,
          sessionId: actualSessionId,
        },
        {
          role: 'assistant',
          content: response,
          sessionId: actualSessionId,
        },
      ],
    })

    return NextResponse.json({
      response,
      sessionId: actualSessionId,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Error in chat:', error)
    return NextResponse.json({ error: 'Failed to process chat' }, { status: 500 })
  }
}
