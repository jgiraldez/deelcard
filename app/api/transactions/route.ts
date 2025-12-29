import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const CreateTransactionSchema = z.object({
  kidId: z.string(),
  type: z.enum(['CHORE', 'ALLOWANCE', 'PURCHASE', 'BONUS', 'PENALTY']),
  amount: z.number(),
  description: z.string().min(1).max(500),
  category: z.string().optional(),
  metadata: z.record(z.any()).optional(),
})

// GET /api/transactions - List transactions
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const kidId = searchParams.get('kidId')

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const where: any = { userId: dbUser.id }
    if (kidId) {
      where.kidId = kidId
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        kid: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}

// POST /api/transactions - Create a new transaction
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
    const validatedData = CreateTransactionSchema.parse(body)

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify the kid belongs to this user
    const kid = await prisma.kid.findFirst({
      where: {
        id: validatedData.kidId,
        userId: dbUser.id,
      },
    })

    if (!kid) {
      return NextResponse.json({ error: 'Kid not found' }, { status: 404 })
    }

    // Create transaction and update kid balance
    const transaction = await prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          type: validatedData.type,
          amount: validatedData.amount,
          description: validatedData.description,
          category: validatedData.category,
          metadata: validatedData.metadata,
          status: 'APPROVED',
          kidId: validatedData.kidId,
          userId: dbUser.id,
        },
      })

      // Update kid balance
      await tx.kid.update({
        where: { id: validatedData.kidId },
        data: {
          balance: {
            increment: validatedData.amount,
          },
        },
      })

      return newTransaction
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 })
    }
    console.error('Error creating transaction:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}
