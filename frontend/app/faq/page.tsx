'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    question: "How do I access my purchased products?",
    answer: "Once your purchase is complete, you will receive an email with a download link. You can also access all your purchased products directly from your dashboard under the 'My Orders' section."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay. All transactions are securely processed."
  },
  {
    question: "Can I get a refund if I'm not satisfied?",
    answer: "Due to the digital nature of our products, we generally do not offer refunds. However, if you encounter a technical issue or the product is materially different from the description, please contact our support team within 14 days."
  },
  {
    question: "Do you offer technical support?",
    answer: "Yes, we offer technical support for all our products. If you have any issues with installation or usage, please reach out to us via the contact page, and we'll be happy to assist you."
  },
  {
    question: "Can I use the templates for client projects?",
    answer: "Yes, our commercial license allows you to use the templates for both personal and client projects. However, you cannot resell or redistribute the templates as standalone products."
  },
  {
    question: "How often do you update your products?",
    answer: "We regularly update our products to ensure compatibility with the latest software versions and to add new features. All updates are free for existing customers."
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <main className="min-h-screen bg-white text-gray-900 font-sans">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 tracking-tight">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-light">
            Everything you need to know about our products and services.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className="border border-gray-200 rounded-lg overflow-hidden transition-all duration-300 hover:border-gray-300"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-6 text-left bg-white hover:bg-gray-50 transition-colors focus:outline-none"
              >
                <span className="text-lg font-medium text-gray-900 pr-8">{faq.question}</span>
                <span className={`transform transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : ''}`}>
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              
              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="p-6 pt-0 text-gray-600 leading-relaxed border-t border-gray-100 bg-gray-50/50">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center bg-gray-50 p-8 rounded-xl border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-6">Can't find the answer you're looking for? Please chat to our friendly team.</p>
          <a 
            href="/contact" 
            className="inline-block bg-gray-900 text-white px-8 py-3 text-sm font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
          >
            Get in Touch
          </a>
        </div>
      </div>
    </main>
  );
}