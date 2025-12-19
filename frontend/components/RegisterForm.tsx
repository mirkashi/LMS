'use client';

import { useState, FormEvent } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface RegisterFormProps {
  onStepChange?: (step: number) => void;
}

export default function RegisterForm({ onStepChange }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [validations, setValidations] = useState({
    passwordLength: false,
    passwordMatch: false,
    emailValid: false,
  });

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
        passwordLength: value.length >= 6,
        passwordMatch: value === formData.confirmPassword && value.length >= 6,
      }));
    }
    if (name === 'confirmPassword') {
      setValidations(prev => ({
        ...prev,
        passwordMatch: value === formData.password && value.length >= 6,
      }));
    }
    if (name === 'email') {
      setValidations(prev => ({
        ...prev,
        emailValid: /^\S+@\S+\.\S+$/.test(value),
      }));
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/register`,
        formData
      );

      setSuccess('✓ Registration successful! Please check your email to verify your account.');
      setFormData({ name: '', email: '', password: '', confirmPassword: '' });
      setCurrentStep(1);
      onStepChange?.(1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
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
        delayChildren: 0.1,
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
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
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
              {success}
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

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <motion.div
          variants={itemVariants}
          key="step1"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="space-y-5"
        >
          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2.5 uppercase tracking-wider">
              Full Name
            </label>
            <motion.div
              className="relative group"
              onMouseEnter={() => setFocusedField('name')}
              onMouseLeave={() => setFocusedField(null)}
            >
              <motion.input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('name')}
                onBlur={() => setFocusedField(null)}
                placeholder="John Doe"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              />
              <motion.span
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl"
                animate={focusedField === 'name' ? { scale: 1.1 } : { scale: 0.8 }}
              >
                👤
              </motion.span>
            </motion.div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2.5 uppercase tracking-wider flex items-center justify-between">
              <span>Email Address</span>
              <ValidationIcon isValid={validations.emailValid && formData.email.length > 0} />
            </label>
            <motion.div
              className="relative group"
              onMouseEnter={() => setFocusedField('email')}
              onMouseLeave={() => setFocusedField(null)}
            >
              <motion.input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onFocus={() => setFocusedField('email')}
                onBlur={() => setFocusedField(null)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 backdrop-blur-sm"
                whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.08)' }}
              />
              <motion.span
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-xl"
                animate={focusedField === 'email' ? { scale: 1.1 } : { scale: 0.8 }}
              >
                ✉️
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Security */}
      {currentStep === 2 && (
        <motion.div
          variants={itemVariants}
          key="step2"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="space-y-5"
        >
          {/* Password */}
          <div>
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
                minLength={6}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 backdrop-blur-sm"
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
                {validations.passwordLength ? '✓' : '○'} At least 6 characters
              </span>
            </motion.p>
          </div>

          {/* Confirm Password */}
          <div>
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
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none transition-all duration-200 backdrop-blur-sm"
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
          </div>
        </motion.div>
      )}

      {/* Step 3: Review & Confirm */}
      {currentStep === 3 && (
        <motion.div
          variants={itemVariants}
          key="step3"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="space-y-4"
        >
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-lg mt-1">👤</span>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Full Name</p>
                <p className="text-white font-medium">{formData.name}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg mt-1">✉️</span>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Email Address</p>
                <p className="text-white font-medium">{formData.email}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-lg mt-1">🔒</span>
              <div>
                <p className="text-xs text-gray-400 font-semibold uppercase">Security</p>
                <p className="text-white font-medium">••••••• (Protected)</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-gray-400 text-center">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </motion.div>
      )}

      {/* Navigation buttons */}
      <motion.div variants={itemVariants} className="flex gap-3 pt-4">
        {currentStep > 1 && (
          <motion.button
            type="button"
            onClick={() => {
              setCurrentStep(currentStep - 1);
              onStepChange?.(currentStep - 1);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 px-4 bg-white/10 border border-white/20 text-white rounded-lg font-bold uppercase tracking-wider hover:bg-white/15 transition-all duration-200"
          >
            ← Back
          </motion.button>
        )}

        {currentStep < 3 && (
          <motion.button
            type="button"
            onClick={() => {
              setCurrentStep(currentStep + 1);
              onStepChange?.(currentStep + 1);
            }}
            disabled={
              (currentStep === 1 && (!formData.name || !validations.emailValid)) ||
              (currentStep === 2 && !validations.passwordMatch)
            }
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg font-bold uppercase tracking-wider hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            Next →
          </motion.button>
        )}

        {currentStep === 3 && (
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-bold uppercase tracking-wider hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none relative overflow-hidden group"
          >
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
                  Creating...
                </>
              ) : (
                <>
                  Create Account
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
        )}
      </motion.div>

      {/* Divider with text */}
      <motion.div variants={itemVariants} className="flex items-center gap-3 py-2">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <span className="text-xs text-gray-400 font-medium">Step {currentStep} of 3</span>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/20 to-transparent" />
      </motion.div>

      {/* Sign In Link */}
      <motion.p
        variants={itemVariants}
        className="text-xs text-gray-400 text-center"
      >
        Already have an account?{' '}
        <Link href="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors duration-200">
          Sign in
        </Link>
      </motion.p>
    </motion.form>
  );
}
