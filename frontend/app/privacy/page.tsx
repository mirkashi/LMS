import React from 'react';

export default function PrivacyPolicy() {
  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h1 className="text-4xl font-serif font-bold text-gray-900 mb-4 tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm uppercase tracking-widest font-bold">
            Last Updated: October 24, 2023
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-a:text-blue-600 hover:prose-a:text-blue-800">
          <p className="lead text-xl text-gray-600 mb-12">
            This Privacy Policy describes how your personal information is collected, used, and shared when you visit or make a purchase from our website.
          </p>

          <section className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-4">1. Personal Information We Collect</h2>
            <p className="text-gray-600 mb-4">
              When you visit the Site, we automatically collect certain information about your device, including information about your web browser, IP address, time zone, and some of the cookies that are installed on your device. Additionally, as you browse the Site, we collect information about the individual web pages or products that you view, what websites or search terms referred you to the Site, and information about how you interact with the Site.
            </p>
            <p className="text-gray-600 mb-4">
              We collect Device Information using the following technologies:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>"Cookies" are data files that are placed on your device or computer and often include an anonymous unique identifier.</li>
              <li>"Log files" track actions occurring on the Site, and collect data including your IP address, browser type, Internet service provider, referring/exit pages, and date/time stamps.</li>
              <li>"Web beacons," "tags," and "pixels" are electronic files used to record information about how you browse the Site.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-4">2. How We Use Your Personal Information</h2>
            <p className="text-gray-600 mb-4">
              We use the Order Information that we collect generally to fulfill any orders placed through the Site (including processing your payment information, arranging for shipping, and providing you with invoices and/or order confirmations). Additionally, we use this Order Information to:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4 space-y-2">
              <li>Communicate with you;</li>
              <li>Screen our orders for potential risk or fraud; and</li>
              <li>When in line with the preferences you have shared with us, provide you with information or advertising relating to our products or services.</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-4">3. Sharing Your Personal Information</h2>
            <p className="text-gray-600 mb-4">
              We share your Personal Information with third parties to help us use your Personal Information, as described above. For example, we use Google Analytics to help us understand how our customers use the Site.
            </p>
            <p className="text-gray-600 mb-4">
              Finally, we may also share your Personal Information to comply with applicable laws and regulations, to respond to a subpoena, search warrant or other lawful request for information we receive, or to otherwise protect our rights.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-4">4. Your Rights</h2>
            <p className="text-gray-600 mb-4">
              If you are a European resident, you have the right to access personal information we hold about you and to ask that your personal information be corrected, updated, or deleted. If you would like to exercise this right, please contact us through the contact information below.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-4">5. Data Retention</h2>
            <p className="text-gray-600 mb-4">
              When you place an order through the Site, we will maintain your Order Information for our records unless and until you ask us to delete this information.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-4">6. Changes</h2>
            <p className="text-gray-600 mb-4">
              We may update this privacy policy from time to time in order to reflect, for example, changes to our practices or for other operational, legal or regulatory reasons.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl text-gray-900 mb-4">7. Contact Us</h2>
            <p className="text-gray-600 mb-4">
              For more information about our privacy practices, if you have questions, or if you would like to make a complaint, please contact us by e-mail or by mail using the details provided on our contact page.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}