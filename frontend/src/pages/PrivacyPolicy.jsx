import { AppLayout } from "@/components/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Lock, Eye, Database, Mail, Globe } from "lucide-react";

export const PrivacyPolicy = ({ user }) => {
  const navigate = useNavigate();
  const lastUpdated = "February 17, 2026";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
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
          <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Shield className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-muted-foreground mt-2">Last updated: {lastUpdated}</p>
        </div>

        <Card className="rounded-2xl">
          <CardContent className="p-6 sm:p-8 space-y-8">
            {/* Introduction */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Globe className="w-5 h-5 text-green-600" />
                Introduction
              </h2>
              <p className="text-gray-700 leading-relaxed">
                CanineCompass ("we," "our," or "us") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, disclose, and safeguard your 
                information when you use our mobile application and website (collectively, the "Service").
              </p>
            </section>

            {/* Information We Collect */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Database className="w-5 h-5 text-green-600" />
                Information We Collect
              </h2>
              <div className="space-y-4 text-gray-700">
                <div>
                  <h3 className="font-medium mb-2">Personal Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Name and email address (via Google Sign-In)</li>
                    <li>Profile picture (optional, from Google account)</li>
                    <li>Dog profile information you provide (name, breed, age, etc.)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Usage Data</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Training progress and completed lessons</li>
                    <li>Achievements and badges earned</li>
                    <li>Virtual pet game interactions</li>
                    <li>App usage statistics and preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Camera & Media Access</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Camera access is used solely to capture photos of your dog for training documentation</li>
                    <li>Photos are stored securely and are only accessible by you</li>
                    <li>You can delete your photos at any time from the app</li>
                    <li>We do not share your photos with third parties without your explicit consent</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Payment Information</h3>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Transaction history for token purchases</li>
                    <li>Payment processing handled securely by Stripe/PayPal (we never store card details)</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* How We Use Information */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                How We Use Your Information
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Provide and maintain our Service</li>
                <li>Track your training progress and achievements</li>
                <li>Process payments and manage your account</li>
                <li>Send push notifications (with your consent)</li>
                <li>Improve our Service and develop new features</li>
                <li>Respond to your inquiries and support requests</li>
                <li>Comply with legal obligations</li>
              </ul>
            </section>

            {/* Data Security */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-600" />
                Data Security
              </h2>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures to protect your personal information, 
                including encryption in transit (HTTPS) and at rest. However, no method of transmission 
                over the Internet is 100% secure, and we cannot guarantee absolute security.
              </p>
            </section>

            {/* Camera Permission Usage */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Eye className="w-5 h-5 text-green-600" />
                Camera Permission Usage
              </h2>
              <div className="space-y-3 text-gray-700">
                <p className="leading-relaxed">
                  CanineCompass requests access to your device's camera for the following purposes:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>
                    <strong>Training Documentation:</strong> Capture photos and videos of your dog's training progress
                  </li>
                  <li>
                    <strong>Dog Profile Photos:</strong> Upload profile pictures for your registered dogs
                  </li>
                  <li>
                    <strong>Behavior Tracking:</strong> Document behavioral observations with visual evidence
                  </li>
                  <li>
                    <strong>Achievement Sharing:</strong> Create shareable content of your training milestones
                  </li>
                </ul>
                <p className="leading-relaxed mt-3">
                  <strong>Important:</strong> Camera access is optional and the app can be used without granting 
                  this permission. You can revoke camera access at any time through your device settings. 
                  We never access your camera without your explicit action and consent.
                </p>
              </div>
            </section>

            {/* Data Sharing */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Data Sharing</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                We do not sell your personal information. We may share data with:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Service providers (payment processors, cloud hosting)</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your explicit consent</li>
              </ul>
            </section>

            {/* Your Rights */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Your Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Depending on your location, you may have the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and data</li>
                <li>Export your data</li>
                <li>Opt-out of marketing communications</li>
              </ul>
            </section>

            {/* Children's Privacy */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Children's Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our Service is not intended for children under 13. We do not knowingly collect 
                information from children under 13. If you believe we have collected such information, 
                please contact us immediately.
              </p>
            </section>

            {/* Contact */}
            <section>
              <h2 className="text-xl font-semibold mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-green-600" />
                Contact Us
              </h2>
              <p className="text-gray-700 leading-relaxed">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-2 text-green-600 font-medium">
                privacy@caninecompass.app
              </p>
            </section>

            {/* Updates */}
            <section>
              <h2 className="text-xl font-semibold mb-3">Policy Updates</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy periodically. We will notify you of any changes 
                by posting the new policy on this page and updating the "Last updated" date.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
