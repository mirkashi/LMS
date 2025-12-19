import React from 'react';

export default function TermsOfService() {
  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4 tracking-tight">
            Terms of Service
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">
            Last Updated: October 24, 2023
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-800">
          <p className="lead text-xl text-gray-600 mb-12">
            Please read these Terms of Service ("Terms", "Terms of Service") carefully before using the website operated by us.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-600 mb-4">
              By accessing or using our service, you agree to be bound by these Terms. If you disagree with any part of the terms, then you may not access the service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-4">2. Purchases</h2>
            <p className="text-gray-600 mb-4">
              If you wish to purchase any product or service made available through the Service ("Purchase"), you may be asked to supply certain information relevant to your Purchase including, without limitation, your credit card number, the expiration date of your credit card, your billing address, and your shipping information.
            </p>
            <p className="text-gray-600 mb-4">
              You represent and warrant that: (i) you have the legal right to use any credit card(s) or other payment method(s) in connection with any Purchase; and that (ii) the information you supply to us is true, correct and complete.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-4">3. Intellectual Property</h2>
            <p className="text-gray-600 mb-4">
              The Service and its original content, features, and functionality are and will remain the exclusive property of our company and its licensors. The Service is protected by copyright, trademark, and other laws of both the United States and foreign countries. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of our company.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-4">4. User Accounts</h2>
            <p className="text-gray-600 mb-4">
              When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
            </p>
            <p className="text-gray-600 mb-4">
              You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-4">5. Limitation of Liability</h2>
            <p className="text-gray-600 mb-4">
              In no event shall our company, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-4">6. Changes</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-4">7. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              If you have any questions about these Terms, please contact us via our contact page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}