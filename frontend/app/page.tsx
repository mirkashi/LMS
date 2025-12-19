'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Home() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/courses?limit=6`
        );
        const data = await response.json();
        if (data.success) {
          setCourses(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    fetchCourses();
  }, []);

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 text-white min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-blue-900/50"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block py-1 px-3 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-sm font-medium mb-6 backdrop-blur-sm">
                🚀 #1 Platform for eBay Sellers
              </span>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Master the Art of <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">
                  Online Selling
                </span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-lg">
                Unlock your potential with expert-led courses, premium resources, and a community of successful entrepreneurs.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/courses"
                  className="px-8 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition transform hover:-translate-y-1 shadow-lg shadow-blue-900/20"
                >
                  Start Learning
                </Link>
                <Link
                  href="/shop"
                  className="px-8 py-4 bg-blue-700/30 border border-blue-400/30 text-white font-bold rounded-xl hover:bg-blue-700/50 transition backdrop-blur-sm"
                >
                  Browse Shop
                </Link>
              </div>
              
              <div className="mt-12 flex items-center gap-8 text-blue-200/80">
                <div className="flex -space-x-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-blue-800 border-2 border-blue-900 flex items-center justify-center text-xs font-bold">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
                <div>
                  <p className="font-bold text-white">500+ Students</p>
                  <p className="text-sm">Joined this month</p>
                </div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-30 blur-3xl animate-pulse"></div>
              <div className="relative bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl transform rotate-3 hover:rotate-0 transition duration-500">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  <div className="text-white/50 text-sm">Dashboard Preview</div>
                </div>
                <div className="space-y-4">
                  <div className="h-32 bg-white/5 rounded-lg w-full animate-pulse"></div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-24 bg-white/5 rounded-lg animate-pulse delay-75"></div>
                    <div className="h-24 bg-white/5 rounded-lg animate-pulse delay-100"></div>
                    <div className="h-24 bg-white/5 rounded-lg animate-pulse delay-150"></div>
                  </div>
                  <div className="h-8 bg-white/5 rounded w-3/4 animate-pulse"></div>
                </div>
              </div>
              
              {/* Floating Elements */}
              <motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-12 -right-12 bg-white p-4 rounded-xl shadow-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    💰
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="font-bold text-gray-900">+$12,450</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Why Choose 9tangle?</h2>
            <p className="text-xl text-gray-600">We provide everything you need to succeed in the competitive world of e-commerce.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "🎓",
                title: "Expert-Led Courses",
                desc: "Learn from industry veterans with proven track records in eBay selling."
              },
              {
                icon: "⚡",
                title: "Instant Access",
                desc: "Get immediate access to course materials, templates, and resources upon purchase."
              },
              {
                icon: "🤝",
                title: "Community Support",
                desc: "Join a vibrant community of sellers to share tips, tricks, and success stories."
              }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition duration-300 border border-gray-100"
              >
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center text-3xl mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Featured Courses</h2>
              <p className="text-xl text-gray-600">Top-rated courses to boost your sales</p>
            </div>
            <Link href="/courses" className="hidden md:inline-flex items-center text-blue-600 font-semibold hover:text-blue-700">
              View All Courses →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course: any, idx) => (
              <motion.div
                key={course._id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300 overflow-hidden border border-gray-100"
              >
                <div className="relative h-48 overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover transform group-hover:scale-110 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-4xl">📚</span>
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-bold text-blue-600 shadow-sm">
                    ${course.price}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2 py-1 bg-blue-50 text-blue-600 text-xs font-semibold rounded-md uppercase tracking-wide">
                      {course.level}
                    </span>
                    <div className="flex items-center text-yellow-400 text-sm">
                      <span>★</span>
                      <span className="text-gray-600 ml-1">{course.rating || '4.8'}</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition">
                    {course.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                    {course.description}
                  </p>
                  <Link
                    href={`/courses/${course._id}`}
                    className="block w-full py-3 bg-gray-50 text-gray-900 font-semibold rounded-xl hover:bg-blue-600 hover:text-white transition text-center"
                  >
                    View Details
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-12 text-center md:hidden">
            <Link href="/courses" className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg">
              View All Courses
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Success Stories</h2>
            <p className="text-blue-200 text-xl">Hear from our successful students</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Power Seller",
                quote: "The strategies I learned here helped me double my eBay sales in just 3 months. Highly recommended!",
                image: "https://randomuser.me/api/portraits/women/1.jpg"
              },
              {
                name: "Michael Chen",
                role: "E-commerce Entrepreneur",
                quote: "Clear, concise, and actionable. The templates alone are worth the price of the course.",
                image: "https://randomuser.me/api/portraits/men/2.jpg"
              },
              {
                name: "Emily Davis",
                role: "Side Hustler",
                quote: "I started with zero knowledge and now I'm making a steady income. Thank you 9tangle!",
                image: "https://randomuser.me/api/portraits/women/3.jpg"
              }
            ].map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white/10 backdrop-blur p-8 rounded-2xl border border-white/10"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-gray-300 overflow-hidden">
                    {/* Placeholder for avatar if external image fails to load */}
                    <div className="w-full h-full bg-blue-800 flex items-center justify-center text-lg font-bold">
                      {testimonial.name.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-blue-300 text-sm">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-blue-100 italic">"{testimonial.quote}"</p>
                <div className="mt-4 flex text-yellow-400 text-sm">
                  ★★★★★
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white p-12 rounded-3xl shadow-xl border border-gray-100">
            <span className="inline-block p-3 bg-blue-100 text-blue-600 rounded-full mb-6 text-2xl">
              📩
            </span>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Join Our Newsletter</h2>
            <p className="text-gray-600 mb-8 max-w-lg mx-auto">
              Get the latest eBay tips, market trends, and exclusive offers delivered straight to your inbox.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                className="px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-600/20"
              >
                Subscribe
              </button>
            </form>
            <p className="text-xs text-gray-400 mt-4">
              We respect your privacy. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
