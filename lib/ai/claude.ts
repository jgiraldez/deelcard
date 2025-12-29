import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

/**
 * Send a message to Claude and get a response
 */
export async function chat(
  messages: ChatMessage[],
  options?: {
    model?: string
    maxTokens?: number
    temperature?: number
    systemPrompt?: string
  }
): Promise<string> {
  const response = await anthropic.messages.create({
    model: options?.model || 'claude-3-5-sonnet-20241022',
    max_tokens: options?.maxTokens || 1024,
    temperature: options?.temperature || 1,
    system: options?.systemPrompt || 'You are a helpful assistant for a family financial education app.',
    messages: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
  })

  const contentBlock = response.content[0]
  if (contentBlock.type === 'text') {
    return contentBlock.text
  }

  throw new Error('Unexpected response type from Claude')
}

/**
 * Generate a kid-friendly explanation of a financial concept
 */
export async function explainFinancialConcept(
  concept: string,
  age: number
): Promise<string> {
  const systemPrompt = `You are a friendly financial educator for children.
Explain financial concepts in a way that a ${age}-year-old can understand.
Use simple language, examples, and encouragement. Keep responses under 200 words.`

  return chat(
    [
      {
        role: 'user',
        content: `Explain this financial concept to me: ${concept}`,
      },
    ],
    {
      systemPrompt,
      maxTokens: 500,
    }
  )
}

/**
 * Analyze a chore request and suggest fair compensation
 */
export async function suggestChoreCompensation(
  choreName: string,
  description: string,
  kidAge: number
): Promise<{ suggestedAmount: number; reasoning: string }> {
  const systemPrompt = `You are a helpful assistant that suggests fair allowance amounts for children's chores.
Consider the complexity, time required, and age-appropriateness of the task.
Respond in JSON format with: { "suggestedAmount": number, "reasoning": string }`

  const response = await chat(
    [
      {
        role: 'user',
        content: `Chore: ${choreName}
Description: ${description}
Child's age: ${kidAge}

What would be a fair payment for this chore?`,
      },
    ],
    {
      systemPrompt,
      maxTokens: 300,
    }
  )

  try {
    const parsed = JSON.parse(response)
    return parsed
  } catch (error) {
    // Fallback if JSON parsing fails
    return {
      suggestedAmount: 5,
      reasoning: 'Unable to analyze - defaulting to $5',
    }
  }
}

/**
 * Generate a personalized savings goal message
 */
export async function generateSavingsGoalMessage(
  goalName: string,
  currentBalance: number,
  targetAmount: number,
  kidName: string
): Promise<string> {
  const progress = (currentBalance / targetAmount) * 100
  const remaining = targetAmount - currentBalance

  return chat(
    [
      {
        role: 'user',
        content: `Write an encouraging message for ${kidName} about their savings goal "${goalName}".
They have saved $${currentBalance} out of $${targetAmount} (${progress.toFixed(1)}% complete).
They need $${remaining} more. Keep it short, positive, and motivating.`,
      },
    ],
    {
      systemPrompt: 'You are an encouraging financial coach for kids.',
      maxTokens: 150,
    }
  )
}
