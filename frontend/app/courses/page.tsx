'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [filteredCourses, setFilteredCourses] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
        const data = await response.json();
        if (data.success) {
          setCourses(data.data);
          setFilteredCourses(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch courses:', error);
      }
    };

    fetchCourses();
  }, []);

  useEffect(() => {
    let filtered = courses;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((c: any) => c.category === selectedCategory);
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter((c: any) => c.level === selectedLevel);
    }

    setFilteredCourses(filtered);
  }, [selectedCategory, selectedLevel, courses]);

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      'programming': 'Programming',
      'design': 'Design',
      'business': 'Business',
      'marketing': 'Marketing',
      'data-science': 'Data Science',
      'language': 'Language',
      'other': 'Other'
    };
    return categoryMap[category] || category;
  };

  const categories = ['all', 'programming', 'design', 'business', 'marketing', 'data-science', 'language', 'other'];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  return (
    <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <section className="bg-gradient-primary text-white py-12 px-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">All Courses</h1>
            <p className="text-xl text-gray-100">
              Explore our collection of professional eBay courses
            </p>
          </div>
        </section>

        {/* Filters and Courses */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-6">Filters</h3>

              <div className="mb-6">
                <h4 className="font-semibold mb-3">Category</h4>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <label key={cat} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="category"
                        checked={selectedCategory === cat}
                        onChange={() => setSelectedCategory(cat)}
                        className="mr-2"
                      />
                      <span className="capitalize">{cat === 'all' ? 'All' : getCategoryLabel(cat)}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Level</h4>
                <div className="space-y-2">
                  {levels.map((level) => (
                    <label key={level} className="flex items-center cursor-pointer">
                      <input
                        type="radio"
                        name="level"
                        checked={selectedLevel === level}
                        onChange={() => setSelectedLevel(level)}
                        className="mr-2"
                      />
                      <span className="capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Courses Grid */}
            <div className="md:col-span-3">
              <div className="text-sm text-gray-600 mb-6">
                Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((course: any) => (
                    <div
                      key={course._id}
                      className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition overflow-hidden"
                    >
                      {course.thumbnail && (
                        <img
                          src={course.thumbnail}
                          alt={course.title}
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            // Fallback if image fails to load
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Course+Image';
                          }}
                        />
                      )}
                      <div className="p-6">
                        <div className="mb-2">
                          <span className="text-sm bg-primary text-white px-3 py-1 rounded-full capitalize">
                            {course.level}
                          </span>
                          <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full capitalize">
                            {getCategoryLabel(course.category)}
                          </span>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">{course.title}</h3>
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2">
                          {course.description}
                        </p>
                        <div className="flex items-center mb-4">
                          <div className="flex text-yellow-400 text-sm">
                            {'⭐'.repeat(Math.round(course.rating))}
                          </div>
                          <span className="text-gray-600 ml-2 text-sm">
                            ({course.totalRatings})
                          </span>
                        </div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-2xl font-bold text-primary">
                            ${course.price}
                          </span>
                          <span className="text-sm text-gray-600">
                            {course.students?.length || 0} students
                          </span>
                        </div>
                        <Link
                          href={`/courses/${course._id}`}
                          className="block w-full py-2 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition text-center text-sm"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-12">
                    <p className="text-gray-600 text-lg">No courses found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
