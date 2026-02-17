import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, Users, CreditCard, AlertTriangle, Scale, Mail } from "lucide-react";

export const TermsOfService = ({ user }) => {
  const navigate = useNavigate();
  const lastUpdated = "February 17, 2026";

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 rounded-full"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          <p className="text-muted-foreground mt-2">Last updated: {lastUpdated}</p>
        </div>

        <Card className="rounded-2xl">
          <CardContent className="p-6 sm:p-8 space-y-8">
            {/* Agreement */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5 text-blue-600" />
                Agreement to Terms
              </h2>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using CanineCompass ("the Service"), you agree to be bound by these 
                Terms of Service. If you disagree with any part of these terms, you may not access 
                the Service. These Terms apply to all visitors, users, and others who access the Service.
              </p>
            </section>

            {/* Description */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Service Description</h2>
              <p className="text-gray-700 leading-relaxed">
                CanineCompass is a dog training application that provides educational content, 
                training programs, achievement tracking, virtual pet features, and K9 handler 
                certification programs. The Service includes both free and premium features 
                accessible through token purchases.
              </p>
            </section>

            {/* User Accounts */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                User Accounts
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>When you create an account, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                  <li>Be at least 13 years of age</li>
                </ul>
                <p className="mt-3">
                  We reserve the right to suspend or terminate accounts that violate these terms 
                  or engage in prohibited activities.
                </p>
              </div>
            </section>

            {/* Purchases */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Purchases & Tokens
              </h2>
              <div className="space-y-3 text-gray-700">
                <p>Regarding in-app purchases:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Tokens are virtual currency used to unlock premium training content</li>
                  <li>All purchases are final and non-refundable unless required by law</li>
                  <li>Tokens have no real-world monetary value and cannot be exchanged for cash</li>
                  <li>Prices are subject to change without notice</li>
                  <li>We are not responsible for unauthorized purchases made from your account</li>
                </ul>
              </div>
            </section>

            {/* NASDU Courses & Pre-Test */}
            <section>
              <h2 className="text-xl font-semibold mb-3">NASDU Course Enrollment</h2>
              <div className="space-y-3 text-gray-700">
                <p>Regarding NASDU course enrollment and pre-test:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Pre-test fee (£19.99) is required before course enrollment and is non-refundable</li>
                  <li>Pre-test requires 48/50 correct answers (96%) to pass</li>
                  <li>We act as third-party providers facilitating course allocation with NASDU-approved training centres</li>
                  <li>All course prices include a 12% service fee covering booking management and support</li>
                  <li>Course availability and schedules are subject to trainer and centre availability</li>
                  <li>Course fees are non-refundable once enrollment is confirmed</li>
                </ul>
              </div>
            </section>

            {/* Trainer Booking Policy */}
            <section>
              <h2 className="text-xl font-semibold mb-3">K9 Trainer Booking Policy</h2>
              <div className="space-y-3 text-gray-700">
                <p className="font-semibold">Virtual Sessions:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>30 minutes: £44.99</li>
                  <li>1 hour: £67.50</li>
                </ul>
                <p className="font-semibold">Home Visit Sessions:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>1 hour (minimum): From £150</li>
                  <li>2 hours: £480.00</li>
                  <li>3 hours intensive: £630.00</li>
                  <li>Call-out fee: £25.00</li>
                  <li>Travel: £0.85 per mile (calculated from postcode to postcode)</li>
                  <li>K9 Risk & Equipment Fee: £8.99 (for dangerous dogs)</li>
                  <li>Additional charges may apply for hotel stays on remote locations</li>
                </ul>
                <p className="font-semibold">24/7 Emergency Call Outs:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>Emergency service: £1,349.99</li>
                  <li>Includes 24-48 hour by your side assistance</li>
                  <li>Risk assessment and containment of dangerous pets</li>
                  <li>Expert advice and support</li>
                </ul>
                <p className="font-semibold">Rehabilitation Programs:</p>
                <ul className="list-disc list-inside space-y-2 ml-4 mb-4">
                  <li>Available from 1 week to 12 weeks</li>
                  <li>Pricing upon request - contact our 24/7 support for assessment</li>
                </ul>
                <p className="font-semibold text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                  IMPORTANT: All trainer booking fees are non-refundable. Rescheduling or location changes incur a £25 admin fee. 
                  Please ensure your calendar fits the trainer's schedule before booking.
                </p>
                <p className="mt-3">Currently available for UK customers only. EU and USA expansion planned for future release.</p>
                <p className="mt-2 text-green-700">For FAQs and booking assistance, speak with our 24/7 AI support bot.</p>
              </div>
            </section>

            {/* Content */}
            <section>
              <h2 className="text-xl font-semibold mb-3">User Content</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                You retain ownership of content you submit (dog profiles, photos, etc.). 
                By submitting content, you grant us a non-exclusive, worldwide, royalty-free 
                license to use, display, and distribute that content within the Service.
              </p>
              <p className="text-gray-700 leading-relaxed">
                You agree not to submit content that is illegal, harmful, threatening, abusive, 
                defamatory, or otherwise objectionable.
              </p>
            </section>

            {/* Prohibited */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-blue-600" />
                Prohibited Activities
              </h2>
              <p className="text-gray-700 leading-relaxed mb-3">You agree NOT to:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Use the Service for any illegal purpose</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service</li>
                <li>Use automated systems (bots) to access the Service</li>
                <li>Sell, trade, or transfer your account</li>
                <li>Exploit bugs or glitches for unfair advantage</li>
                <li>Harass, abuse, or harm other users</li>
                <li>Impersonate others or misrepresent your identity</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Intellectual Property</h2>
              <p className="text-gray-700 leading-relaxed">
                The Service and its original content, features, and functionality are owned by 
                CanineCompass and are protected by international copyright, trademark, and other 
                intellectual property laws. Our training content, graphics, and branding may not 
                be reproduced without express written permission.
              </p>
            </section>

            {/* Disclaimer */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Disclaimer</h2>
              <p className="text-gray-700 leading-relaxed">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND. We do not guarantee 
                that the Service will be uninterrupted, secure, or error-free. Training content is 
                for informational purposes only and should not replace professional veterinary or 
                behavioral advice. We are not responsible for any harm to you or your pets resulting 
                from use of the Service.
              </p>
            </section>

            {/* Limitation */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed">
                To the maximum extent permitted by law, CanineCompass shall not be liable for any 
                indirect, incidental, special, consequential, or punitive damages arising from your 
                use of the Service. Our total liability shall not exceed the amount you paid us in 
                the past 12 months.
              </p>
            </section>

            {/* Changes */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Changes to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these terms at any time. We will notify users of 
                significant changes via email or in-app notification. Continued use of the Service 
                after changes constitutes acceptance of the new terms.
              </p>
            </section>

            {/* Governing Law */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Governing Law</h2>
              <p className="text-gray-700 leading-relaxed">
                These Terms shall be governed by and construed in accordance with applicable laws, 
                without regard to conflict of law principles.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-blue-600" />
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about these Terms of Service, please contact us at:
              </p>
              <p className="mt-2 text-blue-600 font-medium">
                legal@caninecompass.app
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
