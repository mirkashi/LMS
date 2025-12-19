'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function StudentDashboard() {
  const router = useRouter();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (!token || !user) {
        router.push('/login');
        return;
      }

      try {
        const [coursesRes, ordersRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/enrolled/list`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/myorders`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        if (coursesRes.ok) {
          const data = await coursesRes.json();
          setEnrolledCourses(data.data || []);
        }
        
        if (ordersRes.ok) {
          const data = await ordersRes.json();
          setOrders(data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Courses Section */}
        <div className="mb-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h1 className="text-3xl font-serif font-bold text-gray-900">My Learning</h1>
              <p className="text-gray-600 mt-2">Continue learning and master new skills</p>
            </div>
            <Link href="/courses" className="text-gray-900 font-medium hover:underline">
              Browse all courses
            </Link>
          </div>

          {enrolledCourses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {enrolledCourses.map((course: any) => (
                <div
                  key={course._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100"
                >
                  {course.thumbnail && (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold mb-2 text-gray-900">{course.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                      {course.description}
                    </p>
                    <div className="mb-4">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gray-900 h-2 rounded-full"
                          style={{ width: '45%' }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">45% Complete</p>
                    </div>
                    <Link
                      href={`/courses/${course._id}`}
                      className="block w-full py-2 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition text-center text-sm"
                    >
                      Continue Learning
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-100">
              <h2 className="text-xl font-semibold mb-2 text-gray-900">No courses yet</h2>
              <p className="text-gray-600 mb-6">Enroll in a course to start learning</p>
              <Link
                href="/courses"
                className="inline-block px-6 py-2 bg-gray-900 text-white rounded-md font-medium hover:bg-gray-800 transition"
              >
                Browse Courses
              </Link>
            </div>
          )}
        </div>

        {/* Orders Section */}
        <div>
          <h2 className="text-2xl font-serif font-bold text-gray-900 mb-6">Order History</h2>
          {orders.length > 0 ? (
            <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
              <ul className="divide-y divide-gray-200">
                {orders.map((order: any) => (
                  <li key={order._id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="font-mono text-sm font-medium text-gray-500">#{order.orderId}</span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                              order.status === 'cancelled' ? 'bg-red-100 text-red-800' : 
                              'bg-yellow-100 text-yellow-800'}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()} • {order.items.length} items
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <span className="text-lg font-bold text-gray-900">PKR {order.totalAmount.toFixed(2)}</span>
                        {/* Future: Add View Details button */}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-100">
              <p className="text-gray-600">No orders found.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}
