'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LoginForm from '@/components/LoginForm';
import Link from 'next/link';

export default function Login() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
                9tangle
              </h1>
              <p className="text-gray-600">Login to your account</p>
            </div>

            <LoginForm />

            <div className="mt-6 text-center border-t pt-6">
              <p className="text-gray-600">
                Forgot your password?{' '}
                <Link
                  href="/forgot-password"
                  className="text-primary font-semibold hover:underline"
                >
                  Reset it here
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
