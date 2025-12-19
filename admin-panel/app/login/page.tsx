'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  EnvelopeIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

export default function AdminLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [captcha, setCaptcha] = useState('');
  const [captchaInput, setCaptchaInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [showCaptcha, setShowCaptcha] = useState(false);

  // Generate simple CAPTCHA
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCaptcha(result);
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate CAPTCHA if shown
    if (showCaptcha && captchaInput.toLowerCase() !== captcha.toLowerCase()) {
      setError('Invalid CAPTCHA. Please try again.');
      generateCaptcha();
      setCaptchaInput('');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/admin-login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);

        if (newAttempts >= 3) {
          setShowCaptcha(true);
        }

        setError(data.message || 'Login failed');
        generateCaptcha();
        setCaptchaInput('');
        return;
      }

      // Store token and user data
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUser', JSON.stringify(data.user));

      // Reset attempts on successful login
      setAttempts(0);
      setShowCaptcha(false);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCaptcha = () => {
    generateCaptcha();
    setCaptchaInput('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg mb-6">
            <ShieldCheckIcon className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Access</h1>
          <p className="text-gray-600">Secure login to LMS Administration Panel</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start">
                  <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{error}</span>
                </div>
              )}

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="admin@example.com"
                    required
                    autoComplete="email"
                    aria-describedby="email-description"
                  />
                </div>
                <p id="email-description" className="sr-only">Enter your admin email address</p>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <LockClosedIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    placeholder="Enter your password"
                    required
                    autoComplete="current-password"
                    aria-describedby="password-description"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                <p id="password-description" className="sr-only">Enter your admin password</p>
              </div>

              {/* CAPTCHA */}
              {showCaptcha && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Security Verification
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1 bg-gray-100 rounded-lg p-3 font-mono text-lg font-bold text-gray-800 tracking-wider text-center">
                        {captcha}
                      </div>
                      <button
                        type="button"
                        onClick={handleRefreshCaptcha}
                        className="p-3 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                        aria-label="Refresh CAPTCHA"
                      >
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={captchaInput}
                      onChange={(e) => setCaptchaInput(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                      placeholder="Enter the code above"
                      required={showCaptcha}
                      aria-describedby="captcha-description"
                    />
                    <p id="captcha-description" className="text-xs text-gray-500">
                      Enter the characters shown above to verify you&apos;re not a robot
                    </p>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing in...
                  </>
                ) : (
                  <>
                    <ShieldCheckIcon className="w-5 h-5 mr-2" />
                    Sign In Securely
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-start">
                <CheckCircleIcon className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Secure Connection</p>
                  <p>Your login is protected with SSL encryption and multi-factor authentication.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-8 pb-6">
            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors inline-flex items-center"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Additional Security Info */}
        <div className="mt-6 text-center text-xs text-gray-500 max-w-sm mx-auto">
          <p>
            This system is monitored and protected. Unauthorized access attempts are logged and may result in account suspension.
          </p>
        </div>
      </div>
    </div>
  );
}
