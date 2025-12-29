import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'
import {
  createKidSession,
  getKidSession,
  clearKidSession,
  verifyKidPin,
} from '@/lib/auth/kid-session'

const prisma = new PrismaClient()

const KidSessionSchema = z.object({
  kidId: z.string(),
  pin: z.string(),
})

// GET /api/kid-session - Check if there's an active kid session
export async function GET(request: Request) {
  try {
    const session = await getKidSession()

    if (!session) {
      return NextResponse.json({ authenticated: false })
    }

    const kid = await prisma.kid.findUnique({
      where: { id: session.kidId },
      include: {
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!kid) {
      await clearKidSession()
      return NextResponse.json({ authenticated: false })
    }

    return NextResponse.json({
      authenticated: true,
      kid: {
        id: kid.id,
        name: kid.name,
        age: kid.age,
        avatarUrl: kid.avatarUrl,
        balance: kid.balance,
        transactions: kid.transactions,
      },
    })
  } catch (error) {
    console.error('Error checking kid session:', error)
    return NextResponse.json({ authenticated: false })
  }
}

// POST /api/kid-session - Create a kid session with PIN
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { kidId, pin } = KidSessionSchema.parse(body)

    const kid = await prisma.kid.findUnique({
      where: { id: kidId },
    })

    if (!kid) {
      return NextResponse.json({ error: 'Kid not found' }, { status: 404 })
    }

    if (!kid.pin) {
      return NextResponse.json({ error: 'PIN not set for this kid' }, { status: 400 })
    }

    const isValidPin = await verifyKidPin(kid.pin, pin)

    if (!isValidPin) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    const sessionId = await createKidSession(kid.id)

    return NextResponse.json({
      success: true,
      sessionId,
      kid: {
        id: kid.id,
        name: kid.name,
        age: kid.age,
        avatarUrl: kid.avatarUrl,
        balance: kid.balance,
      },
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    console.error('Error creating kid session:', error)
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 })
  }
}

// DELETE /api/kid-session - Clear kid session
export async function DELETE(request: Request) {
  try {
    await clearKidSession()
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing kid session:', error)
    return NextResponse.json({ error: 'Failed to clear session' }, { status: 500 })
  }
}
