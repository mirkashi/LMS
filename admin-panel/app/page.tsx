'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Admin Panel</h1>
          <p className="text-gray-600 mb-8">LMS Administration Dashboard</p>
          <Link
            href="/login"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg"
          >
            Go to Login
          </Link>
        </div>
      </div>
    </main>
  );
}
