'use client';

import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function SetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validations, setValidations] = useState({
    passwordLength: false,
    passwordMatch: false,
  });

  // Get email from session storage
  useEffect(() => {
    const storedEmail = sessionStorage.getItem('verifiedEmail');
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      // Redirect to register if no email
      router.push('/register');
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Validation checks
    if (name === 'password') {
      setValidations(prev => ({
        ...prev,
        passwordLength: value.length >= 8 && value.length <= 12,
        passwordMatch: value === formData.confirmPassword && value.length >= 8 && value.length <= 12,
      }));
    }
    if (name === 'confirmPassword') {
      setValidations(prev => ({
        ...prev,
        passwordMatch: value === formData.password && formData.password.length >= 8 && formData.password.length <= 12,
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Call API to set password
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/set-password`,
        {
          email,
          password: formData.password,
        }
      );

      setSuccess('✓ Password set successfully! Redirecting to dashboard...');
      // Store token from response
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      setTimeout(() => {
        sessionStorage.removeItem('registerEmail');
        sessionStorage.removeItem('verifiedEmail');
        router.push('/dashboard');
      }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to set password');
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

  const ValidationIcon = ({ isValid }: { isValid: boolean }) => (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: isValid ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      className="text-green-400 text-sm"
    >
      ✓
    </motion.span>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-md bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 border border-white/20"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-8">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-white mb-2">Set Your Password</h1>
          <p className="text-gray-300 text-sm">Create a secure password for your account</p>
          {email && (
            <p className="text-gray-400 text-xs mt-3 bg-white/5 px-3 py-2 rounded-lg">
              📧 {email}
            </p>
          )}
        </motion.div>

        <motion.form onSubmit={handleSubmit} className="space-y-5" variants={containerVariants}>
          {/* Success Alert */}
          <motion.div
            variants={itemVariants}
            initial={false}
            animate={success ? 'visible' : 'hidden'}
            className="relative"
          >
            {success && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-green-500/20 border border-green-500/50 rounded-lg backdrop-blur-sm"
              >
                <p className="text-green-200 text-sm font-medium flex items-center gap-2">
                  ✓ {success}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Error Alert */}
          <motion.div
            variants={itemVariants}
            initial={false}
            animate={error ? 'visible' : 'hidden'}
            className="relative"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-4 bg-red-500/20 border border-red-500/50 rounded-lg backdrop-blur-sm"
              >
                <p className="text-red-200 text-sm font-medium flex items-center gap-2">
                  <span className="text-lg">⚠️</span>
                  {error}
                </p>
              </motion.div>
            )}
          </motion.div>

          {/* Password Field */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-200 mb-2.5 uppercase tracking-wider flex items-center justify-between">
              <span>Password</span>
              <ValidationIcon isValid={validations.passwordLength} />
            </label>
            <motion.div
              className="relative group"
              onMouseEnter={() => setFocusedField('password')}
              onMouseLeave={() => setFocusedField(null)}
            >
              <motion.input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('password')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                minLength={8}
                maxLength={12}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              />
              <motion.span
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl"
                animate={focusedField === 'password' ? { scale: 1.1 } : { scale: 0.8 }}
              >
                🔒
              </motion.span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-gray-400 mt-2 flex items-center gap-2"
            >
              <span className={validations.passwordLength ? 'text-green-400' : 'text-gray-500'}>
                {validations.passwordLength ? '✓' : '○'} 8–12 characters
              </span>
            </motion.p>
          </motion.div>

          {/* Confirm Password Field */}
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-semibold text-gray-200 mb-2.5 uppercase tracking-wider flex items-center justify-between">
              <span>Confirm Password</span>
              <ValidationIcon isValid={validations.passwordMatch} />
            </label>
            <motion.div
              className="relative group"
              onMouseEnter={() => setFocusedField('confirmPassword')}
              onMouseLeave={() => setFocusedField(null)}
            >
              <motion.input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('confirmPassword')}
                onBlur={() => setFocusedField(null)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 backdrop-blur-sm focus:ring-2 focus:ring-blue-500"
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              />
              <motion.span
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl"
                animate={focusedField === 'confirmPassword' ? { scale: 1.1 } : { scale: 0.8 }}
              >
                🔐
              </motion.span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-gray-400 mt-2 flex items-center gap-2"
            >
              <span className={validations.passwordMatch ? 'text-green-400' : 'text-gray-500'}>
                {validations.passwordMatch ? '✓' : '○'} Passwords match
              </span>
            </motion.p>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading || !validations.passwordMatch}
            variants={itemVariants}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold uppercase tracking-wider hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    className="inline-block"
                  >
                    ⏳
                  </motion.span>
                  Setting Password...
                </>
              ) : (
                <>
                  Complete Registration
                  <motion.span
                    animate={{ x: [0, 4, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ✓
                  </motion.span>
                </>
              )}
            </span>
          </motion.button>
        </motion.form>

        {/* Help Text */}
        <motion.div variants={itemVariants} className="mt-6 text-center text-sm text-gray-300">
          <p>You're almost done! Set your password to complete registration.</p>
          <div className="mt-3 flex items-center justify-center space-x-4">
            <Link href="/login" className="text-blue-300 hover:text-blue-200 font-semibold">Back to Login</Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
