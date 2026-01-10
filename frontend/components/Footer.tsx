'use client';

import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="space-y-4">
            <h3 className="text-2xl font-serif font-bold tracking-tight text-white">
              9tangle
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Curating premium digital resources for the modern entrepreneur. Elevate your business with our exclusive collection.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-gray-200">Explore</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/" className="hover:text-white transition-colors">Home</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">The Collection</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">Our Story</Link></li>
              <li><Link href="/courses" className="hover:text-white transition-colors">Courses</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-gray-200">Support</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider mb-6 text-gray-200">Stay Connected</h4>
            <p className="text-gray-400 text-sm mb-4">Join our newsletter for exclusive offers and updates.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="w-full px-4 py-2 bg-gray-800 border border-gray-700 text-white text-sm focus:outline-none focus:border-gray-500 transition-colors"
              />
              <button className="bg-white text-gray-900 px-4 py-2 text-sm font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <p>&copy; {new Date().getFullYear()} 9tangle. All rights reserved.</p>
              <span className="hidden md:inline text-gray-700 mx-36"></span>
              <p className="text-gray-400">
                This website is created by{' '}
                <a 
                  href="https://www.linkedin.com/in/mir-kashif-28987428b/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 font-medium transition-colors underline decoration-blue-400/30 hover:decoration-blue-300"
                >
                  Kashif Mir
                </a>
              </p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-white transition-colors">Instagram</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
