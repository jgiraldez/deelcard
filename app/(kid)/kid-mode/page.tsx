'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface Kid {
  id: string
  name: string
  avatarUrl?: string | null
  balance: number
}

export default function KidModePage() {
  const [kids, setKids] = useState<Kid[]>([])
  const [selectedKid, setSelectedKid] = useState<Kid | null>(null)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [kidData, setKidData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if already authenticated
    fetch('/api/kid-session')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) {
          setIsAuthenticated(true)
          setKidData(data.kid)
        } else {
          // Load available kids
          fetch('/api/kids')
            .then((res) => res.json())
            .then((data) => setKids(data.kids || []))
        }
      })
  }, [])

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedKid) return

    setError(null)
    setLoading(true)

    try {
      const response = await fetch('/api/kid-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kidId: selectedKid.id, pin }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid PIN')
      }

      setIsAuthenticated(true)
      setKidData(data.kid)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setPin('')
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await fetch('/api/kid-session', { method: 'DELETE' })
    setIsAuthenticated(false)
    setKidData(null)
    setSelectedKid(null)
    setPin('')
    router.refresh()
  }

  if (isAuthenticated && kidData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100">
        <nav className="bg-white shadow-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <h1 className="text-xl font-bold text-purple-600">Kid Mode</h1>
              <button
                onClick={handleSignOut}
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Exit
              </button>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center mb-8">
            {kidData.avatarUrl && (
              <img
                src={kidData.avatarUrl}
                alt={kidData.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-white shadow-lg"
              />
            )}
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Hi, {kidData.name}!</h2>
          </div>

          <div className="bg-white rounded-lg shadow-xl p-8 mb-6">
            <div className="text-center">
              <p className="text-gray-600 mb-2">Your Balance</p>
              <p className="text-5xl font-bold text-green-600">${kidData.balance.toFixed(2)}</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Chores</h3>
              <p className="text-gray-600 text-sm">See what chores you can do to earn money</p>
              <button className="mt-4 w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors">
                View Chores
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Rewards</h3>
              <p className="text-gray-600 text-sm">See what you can get with your money</p>
              <button className="mt-4 w-full py-2 px-4 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-md transition-colors">
                View Rewards
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">My Activity</h3>
              <p className="text-gray-600 text-sm">See your recent transactions</p>
              <button className="mt-4 w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md transition-colors">
                View History
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Learn About Money</h3>
              <p className="text-gray-600 text-sm">Fun lessons about saving and spending</p>
              <button className="mt-4 w-full py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md transition-colors">
                Start Learning
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-100 p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-purple-600 mb-2">Kid Mode</h1>
            <p className="text-gray-600">Select your profile and enter your PIN</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
              {error}
            </div>
          )}

          {!selectedKid ? (
            <div className="space-y-3">
              {kids.length === 0 ? (
                <p className="text-center text-gray-600">No kids found. Ask a parent to add you!</p>
              ) : (
                kids.map((kid) => (
                  <button
                    key={kid.id}
                    onClick={() => setSelectedKid(kid)}
                    className="w-full p-4 flex items-center gap-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    {kid.avatarUrl ? (
                      <img
                        src={kid.avatarUrl}
                        alt={kid.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-purple-200 flex items-center justify-center">
                        <span className="text-xl font-bold text-purple-600">
                          {kid.name.charAt(0)}
                        </span>
                      </div>
                    )}
                    <span className="text-lg font-medium text-gray-900">{kid.name}</span>
                  </button>
                ))
              )}
            </div>
          ) : (
            <form onSubmit={handlePinSubmit} className="space-y-6">
              <div className="text-center">
                {selectedKid.avatarUrl ? (
                  <img
                    src={selectedKid.avatarUrl}
                    alt={selectedKid.name}
                    className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-purple-200 flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl font-bold text-purple-600">
                      {selectedKid.name.charAt(0)}
                    </span>
                  </div>
                )}
                <p className="text-lg font-medium text-gray-900">{selectedKid.name}</p>
              </div>

              <div>
                <label htmlFor="pin" className="block text-sm font-medium text-gray-700 mb-1">
                  Enter your PIN
                </label>
                <input
                  id="pin"
                  type="password"
                  inputMode="numeric"
                  maxLength={4}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl tracking-widest"
                  placeholder="••••"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedKid(null)
                    setPin('')
                    setError(null)
                  }}
                  className="flex-1 py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-md transition-colors"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading || pin.length !== 4}
                  className="flex-1 py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Checking...' : 'Enter'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
