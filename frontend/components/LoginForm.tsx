'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
        formData
      );

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      router.push(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputVariants = {
    focus: {
      boxShadow: '0 0 0 3px rgba(59, 130, 246, 0.1), inset 0 0 0 1px rgba(59, 130, 246, 0.5)',
    },
    blur: {
      boxShadow: '0 0 0 1px rgba(255, 255, 255, 0.1)',
    },
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
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
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

      {/* Email Field */}
      <motion.div variants={itemVariants}>
        <label className="block text-sm font-semibold text-gray-200 mb-2.5 uppercase tracking-wider">
          Email Address
        </label>
        <motion.div
          className="relative group"
          onMouseEnter={() => setFocusedField('email')}
          onMouseLeave={() => setFocusedField(null)}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-purple-500/0 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            animate={focusedField === 'email' ? { opacity: 0.3 } : { opacity: 0 }}
          />
          <motion.input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            onFocus={() => setFocusedField('email')}
            onBlur={() => setFocusedField(null)}
            placeholder="your@email.com"
            required
            className="relative w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 backdrop-blur-sm"
            variants={inputVariants}
            animate={focusedField === 'email' ? 'focus' : 'blur'}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          />
          <motion.span
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl"
            animate={focusedField === 'email' ? { scale: 1.1, rotate: 0 } : { scale: 0.8, rotate: -10 }}
          >
            ✉️
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Password Field */}
      <motion.div variants={itemVariants}>
        <label className="block text-sm font-semibold text-gray-200 mb-2.5 uppercase tracking-wider">
          Password
        </label>
        <motion.div
          className="relative group"
          onMouseEnter={() => setFocusedField('password')}
          onMouseLeave={() => setFocusedField(null)}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-500/0 via-blue-500/0 to-blue-500/0 rounded-lg blur opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            animate={focusedField === 'password' ? { opacity: 0.3 } : { opacity: 0 }}
          />
          <motion.input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            onFocus={() => setFocusedField('password')}
            onBlur={() => setFocusedField(null)}
            placeholder="••••••••"
            required
            className="relative w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 backdrop-blur-sm"
            variants={inputVariants}
            animate={focusedField === 'password' ? 'focus' : 'blur'}
            whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
          />
          <motion.span
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl"
            animate={focusedField === 'password' ? { scale: 1.1 } : { scale: 0.8 }}
          >
            🔒
          </motion.span>
        </motion.div>
      </motion.div>

      {/* Remember Me & Submit */}
      <motion.div variants={itemVariants} className="space-y-4 pt-2">
        <motion.button
          type="submit"
          disabled={loading}
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold uppercase tracking-wider hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none relative overflow-hidden group"
        >
          <motion.span
            className="absolute inset-0 bg-white/0 group-hover:bg-white/10"
            layoutId="buttonBg"
          />
          <span className="relative flex items-center justify-center gap-2">
            {loading ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  className="inline-block"
                >
                  ⏳
                </motion.span>
                Logging in...
              </>
            ) : (
              <>
                Sign In
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </>
            )}
          </span>
        </motion.button>
      </motion.div>

      {/* Divider with text */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 py-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="text-xs text-gray-400 font-medium">Secure Login</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/20 to-transparent" />
      </motion.div>

      {/* Additional info */}
      <motion.p
        variants={itemVariants}
        className="text-xs text-gray-400 text-center leading-relaxed"
      >
        Your login credentials are securely encrypted. We never share your data with third parties.
      </motion.p>
    </motion.form>
  );
}
