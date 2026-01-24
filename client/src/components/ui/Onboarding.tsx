import { useState, useEffect } from 'react'
import { cn } from '@/utils/cn'
import { Button } from './Button'

interface OnboardingStep {
  title: string
  description: string
  icon: string
}

const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    title: 'Welcome to Twy!',
    description: 'Your shared space to capture memories with your partner. Let\'s show you around.',
    icon: '💕',
  },
  {
    title: 'Add Memory Pins',
    description: 'Click anywhere on the map to drop a pin. Add photos, dates, and notes to remember special moments.',
    icon: '📍',
  },
  {
    title: 'Draw Together',
    description: 'Press D or click the pencil icon to draw on the map. Doodles sync in real-time with your partner!',
    icon: '✏️',
  },
  {
    title: 'Stay Connected',
    description: 'See your partner\'s cursor as they explore the map. Add pins together in real-time.',
    icon: '👀',
  },
  {
    title: 'Explore the Timeline',
    description: 'Press T to view all your memories chronologically. Relive your journey together!',
    icon: '📅',
  },
]

interface OnboardingProps {
  onComplete: () => void
}

export function Onboarding({ onComplete }: OnboardingProps) {
  const [currentStep, setCurrentStep] = useState(0)

  const isLastStep = currentStep === ONBOARDING_STEPS.length - 1
  const step = ONBOARDING_STEPS[currentStep]

  const handleNext = () => {
    if (isLastStep) {
      onComplete()
    } else {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleSkip = () => {
    onComplete()
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-[2000] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-xl">
        {/* Progress dots */}
        <div className="flex justify-center gap-2 mb-6">
          {ONBOARDING_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'w-2 h-2 rounded-full transition-colors',
                i === currentStep ? 'bg-primary-500' : 'bg-neutral-200'
              )}
            />
          ))}
        </div>

        {/* Icon */}
        <div className="text-6xl text-center mb-4">{step.icon}</div>

        {/* Content */}
        <h2 className="text-xl font-bold text-neutral-800 text-center mb-2">
          {step.title}
        </h2>
        <p className="text-neutral-600 text-center mb-8">
          {step.description}
        </p>

        {/* Actions */}
        <div className="flex gap-3">
          {!isLastStep && (
            <Button variant="ghost" onClick={handleSkip} className="flex-1">
              Skip
            </Button>
          )}
          <Button onClick={handleNext} className="flex-1">
            {isLastStep ? 'Get Started' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Hook to manage onboarding state
const ONBOARDING_KEY = 'twy_onboarding_complete'

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_KEY)
    if (!completed) {
      setShowOnboarding(true)
    }
  }, [])

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true')
    setShowOnboarding(false)
  }

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY)
    setShowOnboarding(true)
  }

  return {
    showOnboarding,
    completeOnboarding,
    resetOnboarding,
  }
}
