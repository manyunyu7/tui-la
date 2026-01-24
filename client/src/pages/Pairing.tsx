import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Card } from '@/components/ui'
import { useToast } from '@/components/ui/Toast'
import { api } from '@/services/api'
import { APP_NAME } from '@/config/constants'

interface CoupleStatus {
  id: string
  inviteCode: string
  partner: {
    id: string
    displayName: string
    avatarPath: string | null
  } | null
  pairedAt: string | null
}

export function Pairing() {
  const navigate = useNavigate()
  const { user, refreshUser } = useAuth()
  const toast = useToast()

  const [coupleStatus, setCoupleStatus] = useState<CoupleStatus | null>(null)
  const [inviteCode, setInviteCode] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchCoupleStatus()
  }, [])

  useEffect(() => {
    // If paired, redirect to maps
    if (coupleStatus?.pairedAt) {
      navigate('/maps')
    }
  }, [coupleStatus, navigate])

  const fetchCoupleStatus = async () => {
    try {
      const status = await api.get<CoupleStatus>('/couple/status')
      setCoupleStatus(status)
    } catch (err) {
      console.error('Failed to fetch couple status:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyCode = async () => {
    if (coupleStatus?.inviteCode) {
      await navigator.clipboard.writeText(coupleStatus.inviteCode)
      toast.success('Invite code copied!')
    }
  }

  const handleJoinCouple = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsJoining(true)

    try {
      await api.post('/couple/join', { inviteCode: inviteCode.toUpperCase() })
      await refreshUser()
      toast.success('Successfully paired with your partner!')
      navigate('/maps')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join couple. Please check the code.')
    } finally {
      setIsJoining(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white">
        <div className="animate-pulse text-primary-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-50 to-white p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2">
            <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center">
              <svg className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-neutral-800">{APP_NAME}</span>
          </div>
        </div>

        <Card>
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-primary-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">
              Connect with Your Partner
            </h1>
            <p className="text-neutral-500">
              Hi {user?.displayName}! Share your invite code or enter your partner's code to connect.
            </p>
          </div>

          {/* Your Invite Code Section */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-neutral-600 mb-2">
              Your Invite Code
            </h2>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-neutral-100 rounded-xl px-4 py-3 text-center">
                <span className="text-2xl font-mono font-bold tracking-widest text-neutral-800">
                  {coupleStatus?.inviteCode || '------'}
                </span>
              </div>
              <Button
                variant="secondary"
                onClick={handleCopyCode}
                className="shrink-0"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </Button>
            </div>
            <p className="text-xs text-neutral-400 mt-2 text-center">
              Share this code with your partner
            </p>
          </div>

          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-sm text-neutral-500">or</span>
            </div>
          </div>

          {/* Enter Partner's Code Section */}
          <form onSubmit={handleJoinCouple}>
            <h2 className="text-sm font-medium text-neutral-600 mb-2">
              Enter Partner's Code
            </h2>

            {error && (
              <div className="mb-4 p-3 bg-error-500/10 border border-error-500/20 rounded-xl text-error-500 text-sm">
                {error}
              </div>
            )}

            <div className="flex items-center gap-2">
              <Input
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="XXXXXX"
                maxLength={6}
                className="text-center font-mono text-lg tracking-widest uppercase"
              />
              <Button
                type="submit"
                loading={isJoining}
                disabled={inviteCode.length !== 6}
              >
                Join
              </Button>
            </div>
          </form>
        </Card>

        <p className="text-center text-sm text-neutral-400 mt-6">
          Once connected, you'll share maps, pins, and memories together!
        </p>
      </div>
    </div>
  )
}
