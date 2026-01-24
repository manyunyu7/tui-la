import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { APP_NAME } from '@/config/constants'

export function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16 lg:py-24">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          {/* Left: Text Content */}
          <div className="flex-1 text-center lg:text-left">
            <h1 className="text-4xl lg:text-6xl font-bold text-neutral-900 mb-6">
              Your Love Story,{' '}
              <span className="text-primary-500">Mapped Together</span>
            </h1>

            <p className="text-lg lg:text-xl text-neutral-600 mb-8 max-w-2xl">
              {APP_NAME} helps couples preserve their most precious memories on a
              beautiful, interactive map. Pin your favorite places, draw doodles
              together, and relive your journey anytime.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link to="/register">
                <Button size="lg">
                  Start Your Map
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="secondary" size="lg">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Hero Image/Illustration */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md lg:max-w-lg">
              <div className="absolute -inset-4 bg-primary-200 rounded-3xl transform rotate-3 opacity-30" />
              <div className="relative bg-white rounded-3xl shadow-xl p-8 border-2 border-neutral-100">
                {/* Simple map illustration */}
                <div className="aspect-square bg-gradient-to-br from-primary-100 to-primary-50 rounded-2xl flex items-center justify-center">
                  <svg className="w-32 h-32 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>

                {/* Sample pins */}
                <div className="absolute top-16 left-12 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce">
                  <span className="text-sm">1</span>
                </div>
                <div className="absolute top-32 right-16 w-8 h-8 bg-warning-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-sm">2</span>
                </div>
                <div className="absolute bottom-24 left-20 w-8 h-8 bg-success-500 rounded-full flex items-center justify-center text-white shadow-lg">
                  <span className="text-sm">3</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 lg:py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl lg:text-4xl font-bold text-center text-neutral-900 mb-12">
            Everything You Need to Share Your Journey
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              }
              title="Memory Pins"
              description="Drop pins on places that matter. Add photos, dates, and notes to remember every detail."
            />

            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              }
              title="Draw Together"
              description="Doodle hearts, draw routes, or leave playful marks on your shared map in real-time."
            />

            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
              title="Real-Time Sync"
              description="See your partner's cursor, pins, and drawings appear instantly as they make them."
            />

            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              }
              title="Photo Memories"
              description="Attach photos to pins and create a visual journey of your adventures together."
            />

            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              }
              title="Beautiful Themes"
              description="Choose from romantic color themes to make your map uniquely yours."
            />

            <FeatureCard
              icon={
                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
              title="Private & Secure"
              description="Your memories are private. Only you and your partner can see your map."
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
            Create your free account and invite your partner. Your love story deserves to be remembered.
          </p>
          <Link to="/register">
            <Button variant="secondary" size="lg">
              Get Started Free
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-neutral-900 text-neutral-400 py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="flex items-center justify-center gap-2">
            Made with
            <span className="text-primary-500">&#10084;</span>
            for couples everywhere
          </p>
        </div>
      </footer>
    </div>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white rounded-2xl p-6 border-2 border-neutral-100 hover:border-primary-200 transition-colors">
      <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center text-primary-500 mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-neutral-900 mb-2">{title}</h3>
      <p className="text-neutral-600">{description}</p>
    </div>
  )
}
