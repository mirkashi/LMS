'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function About() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <section className="bg-gradient-primary text-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-5xl font-bold mb-4">About 9tangle</h1>
            <p className="text-xl text-gray-100">
              Professional Learning Management System for eBay Consultants
            </p>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-600 text-lg mb-4">
                9tangle is dedicated to empowering eBay consultants and sellers with 
                professional, comprehensive courses that teach proven strategies for success.
              </p>
              <p className="text-gray-600 text-lg mb-4">
                We believe education is the key to unlocking your full potential on eBay. 
                Our platform provides access to expert-led courses in both PDF and video formats, 
                ensuring flexible learning that fits your schedule.
              </p>
            </div>
            <div className="bg-gradient-primary text-white rounded-lg p-8 h-fit">
              <h3 className="text-2xl font-bold mb-4">Why Choose 9tangle?</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <span>✓</span>
                  <span>Expert instructors with proven track records</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span>✓</span>
                  <span>Multiple learning formats (PDF & Video)</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span>✓</span>
                  <span>Lifetime access to course materials</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span>✓</span>
                  <span>Certificate of completion</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span>✓</span>
                  <span>Money-back guarantee</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">500+</div>
              <p className="text-gray-600">Active Students</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">15+</div>
              <p className="text-gray-600">Expert Courses</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">4.8/5</div>
              <p className="text-gray-600">Average Rating</p>
            </div>
          </div>

          <div>
            <h2 className="text-3xl font-bold mb-6">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((member) => (
                <div key={member} className="text-center">
                  <div className="w-24 h-24 bg-gradient-primary rounded-full mx-auto mb-4 flex items-center justify-center text-white text-4xl">
                    👤
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Expert Instructor</h3>
                  <p className="text-gray-600">
                    Specialized in eBay selling strategies and ecommerce growth
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
