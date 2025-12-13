'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

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

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h1 className="text-5xl font-bold mb-6">
                  Learn from eBay Experts
                </h1>
                <p className="text-xl mb-8 text-gray-100">
                  Master eBay selling strategies with professional courses in PDF and video formats. 
                  Join thousands of successful sellers.
                </p>
                <div className="space-x-4">
                  <Link
                    href="/courses"
                    className="inline-block px-8 py-3 bg-white text-primary font-semibold rounded-lg hover:shadow-lg transition"
                  >
                    Explore Courses
                  </Link>
                  <Link
                    href="/about"
                    className="inline-block px-8 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary transition"
                  >
                    Learn More
                  </Link>
                </div>
              </div>
              <div className="bg-white/20 rounded-lg p-8 backdrop-blur">
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-bold">
                      ✓
                    </div>
                    <span>Expert-led courses</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-bold">
                      ✓
                    </div>
                    <span>PDF & Video content</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-bold">
                      ✓
                    </div>
                    <span>Lifetime access</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-primary font-bold">
                      ✓
                    </div>
                    <span>Certification included</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Courses */}
        <section className="max-w-7xl mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Featured Courses</h2>
            <p className="text-gray-600 text-lg">
              Choose from our selection of professional eBay courses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course: any) => (
              <div
                key={course._id}
                className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition overflow-hidden"
              >
                {course.thumbnail && (
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{course.title}</h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {course.description}
                  </p>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-2xl font-bold text-primary">
                      ${course.price}
                    </span>
                    <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">
                      {course.level}
                    </span>
                  </div>
                  <div className="flex items-center mb-4">
                    <div className="flex text-yellow-400">
                      {'⭐'.repeat(Math.round(course.rating))}
                    </div>
                    <span className="text-gray-600 ml-2">
                      ({course.totalRatings} reviews)
                    </span>
                  </div>
                  <Link
                    href={`/courses/${course._id}`}
                    className="w-full py-2 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition text-center"
                  >
                    View Course
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/courses"
              className="px-8 py-3 bg-gradient-primary text-white font-semibold rounded-lg hover:shadow-lg transition"
            >
              See All Courses
            </Link>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-dark text-white py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
              <div>
                <h3 className="text-4xl font-bold mb-2">500+</h3>
                <p className="text-gray-400">Active Students</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold mb-2">15+</h3>
                <p className="text-gray-400">Expert Courses</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold mb-2">4.8/5</h3>
                <p className="text-gray-400">Average Rating</p>
              </div>
              <div>
                <h3 className="text-4xl font-bold mb-2">100%</h3>
                <p className="text-gray-400">Satisfaction</p>
              </div>
            </div>
          </div>
          </section>
      </div>
      );
    }
