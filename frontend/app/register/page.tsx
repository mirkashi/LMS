'use client';

import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import RegisterForm from '@/components/RegisterForm';

export default function Register() {
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
              <p className="text-gray-600">Create your account</p>
            </div>

            <RegisterForm />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
