import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PrismaClient } from '@prisma/client'
import { z } from 'zod'

const prisma = new PrismaClient()

const CreateKidSchema = z.object({
  name: z.string().min(1).max(100),
  age: z.number().int().min(1).max(18).optional(),
  pin: z.string().regex(/^\d{4}$/).optional(),
})

// GET /api/kids - List all kids for current user
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: {
        kids: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!dbUser) {
      return NextResponse.json({ kids: [] })
    }

    return NextResponse.json({ kids: dbUser.kids })
  } catch (error) {
    console.error('Error fetching kids:', error)
    return NextResponse.json({ error: 'Failed to fetch kids' }, { status: 500 })
  }
}

// POST /api/kids - Create a new kid profile
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
    const validatedData = CreateKidSchema.parse(body)

    // Find or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email!,
          supabaseId: user.id,
          name: user.user_metadata?.name || null,
        },
      })
    }

    const kid = await prisma.kid.create({
      data: {
        name: validatedData.name,
        age: validatedData.age,
        pin: validatedData.pin,
        userId: dbUser.id,
        balance: 0,
      },
    })

    return NextResponse.json({ kid }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.issues }, { status: 400 })
    }
    console.error('Error creating kid:', error)
    return NextResponse.json({ error: 'Failed to create kid' }, { status: 500 })
  }
}
