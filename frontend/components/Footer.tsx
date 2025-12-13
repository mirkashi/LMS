'use client';

export default function Footer() {
  return (
    <footer className="bg-dark text-white mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-2xl font-bold mb-4 bg-gradient-accent bg-clip-text text-transparent">
              9tangle
            </h3>
            <p className="text-gray-400">
              Professional LMS platform for eBay consultants to sell courses in PDF and video formats.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="/" className="hover:text-white transition">Home</a></li>
              <li><a href="/courses" className="hover:text-white transition">Courses</a></li>
              <li><a href="/shop" className="hover:text-white transition">Shop</a></li>
              <li><a href="/about" className="hover:text-white transition">About</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition">FAQ</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">Subscribe to get updates on new courses.</p>
            <input
              type="email"
              placeholder="Your email"
              className="w-full px-4 py-2 rounded-lg bg-gray-700 text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; 2025 9tangle. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
