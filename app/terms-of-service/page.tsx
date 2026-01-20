import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Terms of Service - NextWave SMM",
  description: "Terms of Service for NextWave SMM - Legal Terms and Conditions",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-16">
        <Link href="/" className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>

        <div className="prose prose-sm sm:prose max-w-none">
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          
          <p className="text-lg text-muted-foreground mb-8">
            Last updated: January 2026
          </p>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using NextWave SMM ("the Service"), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
            <p>
              Permission is granted to temporarily download one copy of the materials (information or software) on NextWave SMM for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the site</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">3. Disclaimer</h2>
            <p>
              The materials on NextWave SMM are provided on an 'as is' basis. NextWave SMM makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">4. Limitations</h2>
            <p>
              In no event shall NextWave SMM or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on NextWave SMM.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on NextWave SMM could include technical, typographical, or photographic errors. NextWave SMM does not warrant that any of the materials on its website are accurate, complete, or current. NextWave SMM may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">6. Links</h2>
            <p>
              NextWave SMM has not reviewed all of the sites linked to its website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by NextWave SMM of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">7. Modifications</h2>
            <p>
              NextWave SMM may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">8. Prohibited Activities</h2>
            <p>
              You may not use our Service to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Engage in any conduct that restricts others' use or enjoyment of the Service</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use the Service for illegal activities or services</li>
              <li>Engage in harassment, abuse, or threats</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">9. Payment Terms</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>All prices are in USD unless otherwise stated</li>
              <li>Payment must be completed before service delivery</li>
              <li>We accept multiple payment methods as displayed on the platform</li>
              <li>Refunds are subject to our Refund Policy</li>
              <li>Prices may change at any time</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">10. Account Suspension</h2>
            <p>
              NextWave SMM reserves the right to suspend or terminate any account that:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violates these Terms of Service</li>
              <li>Engages in fraudulent activity</li>
              <li>Violates social media platform terms</li>
              <li>Uses the service for illegal purposes</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-4">11. Contact Information</h2>
            <p>
              If you have questions about these Terms of Service, please contact us at:
            </p>
            <p className="mt-4">
              <strong>NextWave SMM</strong><br/>
              Email: support@nextwavesmm.com<br/>
              Website: www.nextwavesmm.com
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
