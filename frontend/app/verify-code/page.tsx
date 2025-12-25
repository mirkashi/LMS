'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function VerifyCodePage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    code: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Get email from session storage on mount
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('registerEmail');
    if (storedEmail) {
      setFormData(prev => ({ ...prev, email: storedEmail }));
    }
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-code`, formData);
      setSuccess('Email verified successfully!');
      // Store email for password setup
      sessionStorage.setItem('verifiedEmail', formData.email);
      setTimeout(() => router.push('/set-password'), 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Verification failed. Please check the code and try again.');
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 border border-white/20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
          <p className="text-gray-300 text-sm">Enter the 6-digit code we sent to your email.</p>
        </motion.div>

        <motion.form onSubmit={handleSubmit} className="space-y-4" variants={containerVariants}>
          {error && (
            <motion.div
              variants={itemVariants}
              className="p-3 rounded-lg border border-red-500/50 bg-red-500/10 text-red-100 text-sm"
            >
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div
              variants={itemVariants}
              className="p-3 rounded-lg border border-green-500/50 bg-green-500/10 text-green-100 text-sm"
            >
              {success}
            </motion.div>
          )}

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-200 mb-2">Verification Code</label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              required
              maxLength={6}
              pattern="\d{6}"
              className="w-full tracking-[0.6em] text-center px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="123456"
            />
          </motion.div>

          <motion.button
            type="submit"
            disabled={loading}
            variants={itemVariants}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold uppercase tracking-wide hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Verify Code'}
          </motion.button>
        </motion.form>

        <motion.div variants={itemVariants} className="mt-6 text-center text-sm text-gray-300">
          <p>
            Didn’t receive the code? Check spam, then request a new one from the register page.
          </p>
          <div className="mt-3 flex items-center justify-center space-x-4">
            <Link href="/register" className="text-blue-300 hover:text-blue-200 font-semibold">Register</Link>
            <span className="text-gray-500">•</span>
            <Link href="/login" className="text-blue-300 hover:text-blue-200 font-semibold">Back to Login</Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
