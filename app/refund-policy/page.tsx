import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Refund Policy - NextWave SMM",
  description: "Refund Policy for NextWave SMM - Service Credits and Cancellations",
}

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose prose-sm sm:prose max-w-none">
          <h1 className="text-4xl font-bold mb-8">Refund Policy</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: January 2026
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. Service Credits and Refunds</h2>
            <p>
              At NextWave SMM, we stand behind the quality of our services. If you are not satisfied with your service, we offer a refund policy to protect your investment.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Refund Eligibility</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refund requests must be submitted within 7 days of service purchase</li>
              <li>Service must not have been completed or initiated</li>
              <li>Account must not have violated our Terms of Service</li>
              <li>Refunds are not available for already delivered services</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. Service Credit Policy</h2>
            <p>
              If you experience issues with a completed service:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Report the issue within 24 hours of service completion</li>
              <li>Provide evidence of the issue (screenshots, documentation)</li>
              <li>We will investigate and provide service credit if applicable</li>
              <li>Service credits can be applied to future orders</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. How to Request a Refund</h2>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Login to your NextWave SMM account</li>
              <li>Go to Support → Create a Support Ticket</li>
              <li>Select "Refund Request" as the issue type</li>
              <li>Provide order ID and reason for refund</li>
              <li>Our team will review and respond within 24-48 hours</li>
            </ol>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Refund Processing Time</h2>
            <p>
              Once a refund is approved:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Refunds are processed to your account balance immediately</li>
              <li>You can use the balance for future orders</li>
              <li>Wallet withdrawals may take 1-3 business days depending on payment method</li>
              <li>Bank transfers may take 3-5 business days</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">6. Non-Refundable Services</h2>
            <p>
              The following are non-refundable:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Services already delivered or in progress</li>
              <li>Services used for violating platform or social media terms</li>
              <li>Accounts banned for suspicious activity</li>
              <li>Promotional or discounted services (unless defective)</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7. Cancellation Policy</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Orders can be cancelled before service initiation</li>
              <li>Cancelled orders receive full refund to account balance</li>
              <li>In-progress services cannot be cancelled</li>
              <li>Partial refunds are not available</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">8. Disputes and Appeals</h2>
            <p>
              If you disagree with a refund decision:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Contact our support team with additional evidence</li>
              <li>Submit an appeal within 7 days of the initial decision</li>
              <li>Our management team will review the case</li>
              <li>Final decision will be provided within 48 hours</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">9. Contact Us</h2>
            <p>
              For refund inquiries, please contact:
            </p>
            <p className="mt-4">
              <strong>NextWave SMM Support</strong><br/>
              Email: support@nextwavesmm.com<br/>
              Support Portal: Dashboard → Support → Create Ticket
            </p>
          </section>
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">Contact Us for Refunds</h2>
            <p>
              To request a refund or if you have any questions about our refund policy, please contact our support team:
            </p>
            <p className="mt-4 font-semibold">
              Email: <a href="mailto:nextwavedigitalsolutions1@gmail.com" className="text-blue-600 hover:text-blue-700">
                nextwavedigitalsolutions1@gmail.com
              </a>
            </p>
            <p className="mt-2">
              Website: <a href="https://nextwavesmm.com" className="text-blue-600 hover:text-blue-700">
                nextwavesmm.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
