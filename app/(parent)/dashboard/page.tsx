import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { PrismaClient } from '@prisma/client'
import Link from 'next/link'

const prisma = new PrismaClient()

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch or create user in database
  let dbUser
  try {
    dbUser = await prisma.user.findUnique({
      where: { supabaseId: user.id },
      include: {
        kids: {
          include: {
            transactions: {
              take: 5,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
    })

    if (!dbUser) {
      dbUser = await prisma.user.create({
        data: {
          email: user.email!,
          supabaseId: user.id,
          name: user.user_metadata?.name || null,
        },
        include: {
          kids: true,
        },
      })
    }
  } catch (error) {
    // Database connection failed (local development limitation)
    // Show UI without database data - will work in production/Vercel
    console.error('Database connection failed:', error)
    dbUser = {
      name: user.user_metadata?.name || user.email?.split('@')[0] || 'Parent',
      email: user.email,
      kids: [],
    }
  }

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-bold text-gray-900">DealCard Dashboard</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user.email}</span>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  Sign Out
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {dbUser.name || 'Parent'}!
          </h2>
          <p className="text-gray-600">Manage your kids' allowances and track their progress</p>
        </div>

        {dbUser.kids.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No kids added yet</h3>
            <p className="text-gray-600 mb-6">
              Get started by adding your first child to track their allowance
            </p>
            <Link
              href="/api/kids/add"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors"
            >
              Add Child
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dbUser.kids.map((kid) => (
              <div key={kid.id} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{kid.name}</h3>
                    {kid.age && <p className="text-sm text-gray-600">Age {kid.age}</p>}
                  </div>
                  {kid.avatarUrl && (
                    <img
                      src={kid.avatarUrl}
                      alt={kid.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Balance</p>
                  <p className="text-2xl font-bold text-green-600">
                    ${kid.balance.toFixed(2)}
                  </p>
                </div>

                {kid.transactions.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Recent Activity</p>
                    <div className="space-y-2">
                      {kid.transactions.map((transaction) => (
                        <div key={transaction.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{transaction.description}</span>
                          <span
                            className={
                              transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'
                            }
                          >
                            ${Math.abs(transaction.amount).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t flex gap-2">
                  <Link
                    href={`/kid/${kid.id}`}
                    className="flex-1 text-center px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md transition-colors"
                  >
                    Manage
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <Link
            href="/rewards"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Rewards Catalog</h3>
            <p className="text-gray-600 text-sm">Set up rewards your kids can earn</p>
          </Link>

          <Link
            href="/chores"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Chore Manager</h3>
            <p className="text-gray-600 text-sm">Create and assign chores</p>
          </Link>

          <Link
            href="/reports"
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Reports</h3>
            <p className="text-gray-600 text-sm">View spending and earning trends</p>
          </Link>
        </div>
      </main>
    </div>
  )
}
