import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Mail, MessageSquare, Phone, MapPin } from "lucide-react"

export const metadata = {
  title: "Contact Us - NextWave SMM",
  description: "Get in touch with NextWave SMM support team for help and inquiries",
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="space-y-12">
          {/* Header */}
          <section className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Us</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Have questions? Our support team is here to help. Get in touch with us through any of the channels below.
            </p>
          </section>

          {/* Contact Methods */}
          <section className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardContent className="p-8">
                <Mail className="h-12 w-12 text-blue-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Email</h3>
                <p className="text-muted-foreground mb-2">Send us an email anytime</p>
                <a href="mailto:support@nextwavesmm.com" className="text-blue-600 hover:text-blue-700 font-semibold">
                  support@nextwavesmm.com
                </a>
                <p className="text-sm text-muted-foreground mt-2">
                  Response time: Within 24 hours
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8">
                <MessageSquare className="h-12 w-12 text-purple-600 mb-4" />
                <h3 className="text-xl font-semibold mb-3">Support Ticket</h3>
                <p className="text-muted-foreground mb-4">Create a ticket in your dashboard</p>
                <Link href="/dashboard/tickets">
                  <Button variant="outline" className="w-full bg-transparent">
                    Go to Support Tickets
                  </Button>
                </Link>
                <p className="text-sm text-muted-foreground mt-2">
                  Priority support for logged-in users
                </p>
              </CardContent>
            </Card>
          </section>

          {/* Additional Contact Info */}
          <section className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8 md:p-12">
            <h2 className="text-2xl font-bold mb-8">Other Ways to Reach Us</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <MapPin className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Website</h3>
                  <a href="https://www.nextwavesmm.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700">
                    www.nextwavesmm.com
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <Phone className="h-6 w-6 text-purple-600 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-2">Support Hours</h3>
                  <p className="text-muted-foreground">
                    24/7 Support Available<br/>
                    Response time: Usually within 24 hours
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold mb-8">Frequently Asked Questions</h2>
            
            <div className="space-y-4">
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">How do I create an account?</h3>
                  <p className="text-muted-foreground">
                    Visit our signup page and fill in your email and password. You'll be able to start using our services immediately after verification.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
                  <p className="text-muted-foreground">
                    We accept credit cards, PayPal, cryptocurrency, and other payment methods. Check our payment page for the latest options.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">How long does delivery take?</h3>
                  <p className="text-muted-foreground">
                    Most orders start processing within minutes. Delivery times vary by service but typically complete within 24-72 hours.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Is there a refund policy?</h3>
                  <p className="text-muted-foreground">
                    Yes, we have a comprehensive refund policy. Check our Refund Policy page for complete details.
                  </p>
                  <Link href="/refund-policy" className="text-blue-600 hover:text-blue-700 text-sm font-semibold mt-2 inline-block">
                    Read Refund Policy →
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-2">Are the followers real?</h3>
                  <p className="text-muted-foreground">
                    Yes, we only provide genuine followers and engagement. No bots or fake accounts. All interactions are from real users.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Support CTA */}
          <section className="text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 md:p-12 text-white">
            <h2 className="text-2xl font-bold mb-4">Need Immediate Assistance?</h2>
            <p className="mb-6">Our support team is available 24/7 to help you with any questions.</p>
            <Link href="/dashboard/tickets">
              <Button size="lg" variant="secondary">
                Create Support Ticket
              </Button>
            </Link>
          </section>
          {/* Email Cards */}
          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <Card className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <Mail className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Email Support</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Reach out to our support team with any questions or concerns.
                    </p>
                    <a 
                      href="mailto:nextwavedigitalsolutions1@gmail.com" 
                      className="text-blue-600 hover:text-blue-700 font-medium text-sm"
                    >
                      nextwavedigitalsolutions1@gmail.com
                    </a>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-slate-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <MessageSquare className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold mb-2">Quick Response</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      We typically respond to all inquiries within 24 hours.
                    </p>
                    <p className="text-blue-600 font-medium text-sm">
                      Support Hours: 24/7
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
