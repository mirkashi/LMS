'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AppImage from '@/components/AppImage';
import { MagnifyingGlassIcon, FunnelIcon, AcademicCapIcon } from '@heroicons/react/24/outline';

interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail?: string;
  category: string;
  price: number;
  level: string;
  duration: number;
  rating: number;
  totalRatings: number;
  students?: any[];
  createdAt: string;
}

export default function CourseCategoriesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [headerBackgroundImage, setHeaderBackgroundImage] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const categories = [
    { id: 'all', name: 'All Categories', icon: '📚' },
    { id: 'eBay Basics', name: 'eBay Basics', icon: '🎯' },
    { id: 'Advanced Selling', name: 'Advanced Selling', icon: '📈' },
    { id: 'Marketing', name: 'Marketing', icon: '📢' },
    { id: 'Product Sourcing', name: 'Product Sourcing', icon: '🔍' },
    { id: 'Business Management', name: 'Business Management', icon: '💼' },
  ];

  const levels = [
    { id: 'all', name: 'All Levels' },
    { id: 'beginner', name: 'Beginner' },
    { id: 'intermediate', name: 'Intermediate' },
    { id: 'advanced', name: 'Advanced' },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch courses
        const coursesResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses`);
        const coursesData = await coursesResponse.json();
        if (coursesData.success) {
          setCourses(coursesData.data);
          setFilteredCourses(coursesData.data);
        }

        // Fetch page background
        const backgroundResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/page-backgrounds/course`);
        if (backgroundResponse.ok) {
          const backgroundData = await backgroundResponse.json();
          if (backgroundData.success && backgroundData.data) {
            const imageUrl = backgroundData.data.imageUrl;
            // Add API URL prefix if the URL is a relative path
            const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;
            setHeaderBackgroundImage(fullImageUrl);
          }
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = courses;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((c) => c.category === selectedCategory);
    }

    // Filter by level
    if (selectedLevel !== 'all') {
      filtered = filtered.filter((c) => c.level === selectedLevel);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by price range
    filtered = filtered.filter((c) => c.price >= priceRange[0] && c.price <= priceRange[1]);

    // Sort courses
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'popular':
        filtered.sort((a, b) => (b.students?.length || 0) - (a.students?.length || 0));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }

    setFilteredCourses(filtered);
  }, [selectedCategory, selectedLevel, searchTerm, courses, sortBy, priceRange]);

  const getCategoryCourseCount = (categoryId: string) => {
    if (categoryId === 'all') return courses.length;
    return courses.filter((c) => c.category === categoryId).length;
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header with Background Image */}
      <section
        className="relative text-white py-16 px-4 bg-gradient-primary overflow-hidden"
        style={{
          backgroundImage: headerBackgroundImage ? `url('${headerBackgroundImage}')` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center mb-4">
            <AcademicCapIcon className="w-12 h-12 mr-4" />
            <h1 className="text-5xl font-bold">Course Categories</h1>
          </div>
          <p className="text-xl text-gray-100 max-w-2xl">
            Explore our comprehensive collection of courses organized by category and skill level
          </p>
        </div>
      </section>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`p-6 rounded-xl shadow-md transition-all transform hover:scale-105 ${
                selectedCategory === category.id
                  ? 'bg-gradient-primary text-white shadow-xl'
                  : 'bg-white text-gray-700 hover:shadow-lg'
              }`}
            >
              <div className="text-4xl mb-2">{category.icon}</div>
              <div className="font-semibold text-sm mb-1">{category.name}</div>
              <div className="text-xs opacity-75">{getCategoryCourseCount(category.id)} courses</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        {/* Search and Sort Bar */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>

            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="md:hidden px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center justify-center"
            >
              <FunnelIcon className="w-5 h-5 mr-2" />
              Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Filters Sidebar */}
          <div className={`lg:block ${showMobileFilters ? 'block' : 'hidden'}`}>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-4">
              <h3 className="text-xl font-bold mb-6 flex items-center">
                <FunnelIcon className="w-6 h-6 mr-2" />
                Filters
              </h3>

              {/* Level Filter */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-700">Difficulty Level</h4>
                <div className="space-y-2">
                  {levels.map((level) => (
                    <label key={level.id} className="flex items-center cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="radio"
                        name="level"
                        checked={selectedLevel === level.id}
                        onChange={() => setSelectedLevel(level.id)}
                        className="mr-3 w-4 h-4 text-blue-600"
                      />
                      <span className="capitalize">{level.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3 text-gray-700">Price Range</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>PKR {priceRange[0]}</span>
                    <span>PKR {priceRange[1]}</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100000"
                    step="1000"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([0, parseInt(e.target.value)])}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Reset Filters */}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                  setSearchTerm('');
                  setPriceRange([0, 100000]);
                  setSortBy('newest');
                }}
                className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
              >
                Reset Filters
              </button>
            </div>
          </div>

          {/* Courses Grid */}
          <div className="lg:col-span-3">
            <div className="text-sm text-gray-600 mb-4">
              Showing {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
              {selectedCategory !== 'all' && (
                <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  {categories.find((c) => c.id === selectedCategory)?.name}
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <div
                    key={course._id}
                    className="bg-white rounded-xl shadow-md hover:shadow-2xl transition-all transform hover:-translate-y-1 overflow-hidden"
                  >
                    {course.thumbnail && (
                      <div className="relative">
                        <AppImage path={course.thumbnail} alt={course.title} className="w-full h-48 object-cover" />
                        <div className="absolute top-2 right-2">
                          <span className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-1 rounded-full text-xs font-semibold">
                            {course.level}
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-5">
                      <div className="mb-3">
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                          {course.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold mb-2 line-clamp-2 min-h-[3.5rem]">{course.title}</h3>
                      <p className="text-gray-600 mb-4 text-sm line-clamp-2">{course.description}</p>
                      <div className="flex items-center mb-4">
                        <div className="flex text-yellow-400 text-sm">
                          {'⭐'.repeat(Math.round(course.rating || 0))}
                        </div>
                        <span className="text-gray-600 ml-2 text-sm">
                          {course.rating?.toFixed(1) || '0.0'} ({course.totalRatings || 0})
                        </span>
                      </div>
                      <div className="flex justify-between items-center mb-4 pt-4 border-t">
                        <span className="text-2xl font-bold text-blue-600">PKR {course.price}</span>
                        <span className="text-sm text-gray-500">{course.students?.length || 0} students</span>
                      </div>
                      <Link
                        href={`/courses/${course._id}`}
                        className="block w-full py-2.5 bg-gradient-primary text-white rounded-lg font-semibold hover:shadow-lg transition text-center"
                      >
                        View Course
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-16">
                  <div className="text-gray-400 mb-4">
                    <AcademicCapIcon className="w-24 h-24 mx-auto" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-700 mb-2">No courses found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                  <button
                    onClick={() => {
                      setSelectedCategory('all');
                      setSelectedLevel('all');
                      setSearchTerm('');
                      setPriceRange([0, 100000]);
                    }}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
