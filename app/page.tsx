import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle2, Zap, Shield, TrendingUp, Users } from "lucide-react"
import { PlatformLogos } from "@/components/landing/platform-logos"
import { StatsSection } from "@/components/landing/stats-section"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden relative">
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/30 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 sm:h-16 md:h-16 items-center justify-between px-3 sm:px-4">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="NextWave SMM"
              width={600}
              height={150}
              className="w-40 sm:w-48 md:w-56 lg:w-64 h-auto"
              priority
            />
          </Link>
          <nav className="hidden md:flex items-center gap-4 lg:gap-6">
            <Link
              href="#features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#services"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Services
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm" className="h-8 sm:h-9 px-2 sm:px-3 text-xs sm:text-sm">
                Get Started
                <ArrowRight className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container px-4 py-16 md:py-24 lg:py-32">
          <div className="mx-auto max-w-5xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Zap className="mr-1 h-3 w-3" />
              NextWave v2.0 is now live
            </Badge>
            <h1 className="text-balance text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              Best SMM Tool for Genuine
              <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                {" "}
                Social Media Engagement
              </span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
              A perfect solution for Spotify Artists, Influencers, Businesses, NFT Projects & Crypto companies.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Signup for free today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                View pricing
              </Button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2">
              <div className="flex -space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 border-2 border-background" />
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-500 to-teal-500 border-2 border-background" />
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-500 border-2 border-background" />
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 border-2 border-background" />
              </div>
              <div className="text-sm">
                <span className="font-semibold">4.8/5</span>
                <span className="text-muted-foreground"> Rating over 500 Reviews</span>
              </div>
            </div>
          </div>

          <div className="mt-12 md:mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={Zap} title="Starting at just $0.001K" />
            <FeatureCard icon={Shield} title="Non-drop services" />
            <FeatureCard icon={TrendingUp} title="Lifetime Refills" />
            <FeatureCard icon={Users} title="24/7 Support" />
          </div>
        </section>

        <section className="border-t bg-muted/50 py-8 md:py-12">
          <div className="container px-4">
            <p className="text-center text-xs md:text-sm font-medium text-muted-foreground mb-6 md:mb-8">
              Providing solutions for best platforms
            </p>
            <PlatformLogos />
          </div>
        </section>

        <section id="features" className="container py-24">
          <div className="mx-auto max-w-5xl text-center mb-16">
            <Badge variant="secondary" className="mb-4">
              <CheckCircle2 className="mr-1 h-3 w-3" />
              How it works?
            </Badge>
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">
              How to <span className="text-primary">grow</span> in social in{" "}
              <span className="text-primary">3 steps</span>?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              The All-In-One Social Media Marketing tool you will need!
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <StepCard number={1} title="Signup for free!" description="Create your account in seconds" />
            <StepCard number={2} title="Select service & order!" description="Choose from our extensive catalog" />
            <StepCard number={3} title="Enjoy your growth!" description="Watch your social media thrive" />
          </div>
        </section>

        <section id="services" className="bg-muted/50 py-24">
          <div className="container">
            <div className="mx-auto max-w-5xl text-center mb-16">
              <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Popular Services</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                High-quality services for all major social media platforms
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <ServiceCard
                platform="Instagram"
                services={["Followers", "Likes", "Views", "Comments"]}
                color="from-pink-500 to-rose-500"
              />
              <ServiceCard
                platform="YouTube"
                services={["Views", "Subscribers", "Likes", "Comments"]}
                color="from-red-500 to-rose-600"
              />
              <ServiceCard
                platform="TikTok"
                services={["Followers", "Likes", "Views", "Shares"]}
                color="from-cyan-500 to-blue-500"
              />
              <ServiceCard
                platform="Facebook"
                services={["Page Likes", "Followers", "Shares", "Comments"]}
                color="from-blue-600 to-indigo-600"
              />
              <ServiceCard
                platform="Twitter"
                services={["Followers", "Retweets", "Likes", "Comments"]}
                color="from-sky-500 to-blue-600"
              />
              <ServiceCard
                platform="Telegram"
                services={["Members", "Post Views", "Reactions", "Shares"]}
                color="from-blue-500 to-cyan-500"
              />
            </div>
          </div>
        </section>

        <StatsSection />

        <section className="container py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-4xl font-bold tracking-tight md:text-5xl">Ready to grow your social presence?</h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of satisfied customers and start your journey today
            </p>
            <div className="mt-8">
              <Link href="/auth/signup">
                <Button size="lg">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-12">
        <div className="container px-3 sm:px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <Link href="/" className="flex items-center mb-4">
                <Image
                  src="/logo.png"
                  alt="NextWave SMM"
                  width={500}
                  height={125}
                  className="w-40 sm:w-48 md:w-56 h-auto"
                />
              </Link>
              <p className="text-sm text-muted-foreground">
                Professional SMM panel for social media marketing services
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Services</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Instagram</li>
                <li>YouTube</li>
                <li>TikTok</li>
                <li>Facebook</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-foreground transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="text-muted-foreground hover:text-foreground transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/privacy-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/refund-policy" className="text-muted-foreground hover:text-foreground transition-colors">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="mailto:nextwavedigitalsolutions1@gmail.com" className="text-muted-foreground hover:text-foreground transition-colors">
                    Email Support
                  </a>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    API Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-muted-foreground hover:text-foreground transition-colors">
                    FAQs
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2026 NextWave Panel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon: Icon, title }: { icon: any; title: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <span className="text-sm font-medium">{title}</span>
      </CardContent>
    </Card>
  )
}

function StepCard({ number, title, description }: { number: number; title: string; description: string }) {
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
          {number}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

function ServiceCard({ platform, services, color }: { platform: string; services: string[]; color: string }) {
  return (
    <Card className="overflow-hidden">
      <div className={`h-2 bg-gradient-to-r ${color}`} />
      <CardContent className="p-6">
        <h3 className="text-xl font-bold mb-4">{platform}</h3>
        <ul className="space-y-2">
          {services.map((service) => (
            <li key={service} className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              {service}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
