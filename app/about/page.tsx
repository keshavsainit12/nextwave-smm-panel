import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Users, Zap, TrendingUp } from "lucide-react"

export const metadata = {
  title: "About Us - NextWave SMM",
  description: "Learn about NextWave SMM - Your Social Media Marketing Partner",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="space-y-16">
          {/* Header */}
          <section className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">About NextWave SMM</h1>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              We are a leading Social Media Marketing panel providing authentic engagement services for artists, influencers, businesses, and crypto projects worldwide.
            </p>
          </section>

          {/* Mission */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 md:p-12">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-muted-foreground mb-4">
              To empower content creators and businesses by providing affordable, reliable, and authentic social media growth services. We believe every brand deserves access to quality marketing tools regardless of their size or budget.
            </p>
            <p className="text-lg text-muted-foreground">
              Our commitment is to deliver genuine engagement that helps you build real connections with your audience and achieve sustainable growth.
            </p>
          </section>

          {/* Why Choose Us */}
          <section>
            <h2 className="text-3xl font-bold mb-12 text-center">Why Choose NextWave SMM</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <Zap className="h-12 w-12 text-blue-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Fast & Reliable</h3>
                  <p className="text-muted-foreground">
                    Quick delivery with 99.9% uptime. Our systems are optimized for speed and reliability.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <Users className="h-12 w-12 text-purple-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Genuine Engagement</h3>
                  <p className="text-muted-foreground">
                    Real users, real followers, and authentic interactions. No bots, no fake accounts.
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <TrendingUp className="h-12 w-12 text-green-600 mb-4" />
                  <h3 className="text-xl font-semibold mb-3">Affordable Pricing</h3>
                  <p className="text-muted-foreground">
                    Competitive rates without compromising quality. Get the best value for your investment.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* What We Offer */}
          <section>
            <h2 className="text-3xl font-bold mb-8">What We Offer</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">✓</div>
                <div>
                  <h3 className="font-semibold mb-2">Instagram Services</h3>
                  <p className="text-muted-foreground">Followers, likes, comments, story views, and engagement packages</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">✓</div>
                <div>
                  <h3 className="font-semibold mb-2">YouTube Services</h3>
                  <p className="text-muted-foreground">Channel subscribers, video views, likes, and comment services</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">✓</div>
                <div>
                  <h3 className="font-semibold mb-2">TikTok Services</h3>
                  <p className="text-muted-foreground">Followers, likes, views, shares, and viral growth packages</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-white">✓</div>
                <div>
                  <h3 className="font-semibold mb-2">Facebook & Twitter Services</h3>
                  <p className="text-muted-foreground">Followers, likes, shares, and engagement across all platforms</p>
                </div>
              </div>
            </div>
          </section>

          {/* Stats */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold mb-2">50K+</div>
                <p className="text-blue-100">Happy Clients</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">1M+</div>
                <p className="text-blue-100">Orders Delivered</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <p className="text-blue-100">Customer Support</p>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Grow Your Social Media?</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of creators and businesses who are already using NextWave SMM to accelerate their growth.
            </p>
            <Link href="/auth/signup">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Start Growing Today
              </Button>
            </Link>
          </section>
        </div>
      </div>
    </div>
  )
}
