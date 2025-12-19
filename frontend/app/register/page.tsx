'use client';

import { useState } from 'react';
import RegisterForm from '@/components/RegisterForm';
import { motion } from 'framer-motion';

export default function Register() {
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { number: 1, label: 'Account', icon: '👤' },
    { number: 2, label: 'Security', icon: '🔐' },
    { number: 3, label: 'Confirm', icon: '✓' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-800 flex items-center justify-center px-4 py-12 overflow-hidden relative">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Flowing lines animation */}
        <motion.svg
          className="absolute w-full h-full opacity-20"
          viewBox="0 0 1200 600"
          xmlns="http://www.w3.org/2000/svg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 2 }}
        >
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>

          {/* Geometric shapes */}
          <motion.circle
            cx="200"
            cy="150"
            r="80"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="2"
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.rect
            x="900"
            y="100"
            width="150"
            height="150"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="2"
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
          />
          <motion.polygon
            points="600,50 700,200 500,200"
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="2"
            animate={{ y: [0, 30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.svg>

        {/* Animated gradient orbs */}
        <motion.div
          className="absolute top-10 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            y: [0, 100, 0],
            x: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-10 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            y: [0, -100, 0],
            x: [0, -50, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Parallax floating elements */}
        <motion.div
          className="absolute top-1/3 right-1/3 w-20 h-20 border-2 border-blue-400/30 rounded-lg"
          animate={{
            y: [-10, 10, -10],
            rotate: [0, 10, 0],
          }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-16 h-16 border-2 border-purple-400/30 rounded-full"
          animate={{
            y: [10, -10, 10],
            rotate: [360, 0, 360],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      <motion.div
        className="w-full max-w-lg relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Progress indicator */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex justify-between items-center mb-6">
            {steps.map((step, index) => (
              <motion.div key={step.number} className="flex flex-col items-center flex-1">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mb-2 transition-all duration-300 ${
                    currentStep >= step.number
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                      : 'bg-white/10 text-gray-400 border border-white/20'
                  }`}
                  whileHover={{ scale: 1.1 }}
                >
                  {step.icon}
                </motion.div>
                <span className="text-xs sm:text-sm font-semibold text-gray-300 text-center">
                  {step.label}
                </span>

                {index < steps.length - 1 && (
                  <motion.div
                    className="absolute top-6 left-1/2 w-16 h-0.5 bg-gradient-to-r from-blue-500/30 to-transparent"
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: currentStep > step.number ? 1 : 0 }}
                    transition={{ duration: 0.5 }}
                    style={{ originX: 0, marginLeft: '2rem' }}
                  />
                )}
              </motion.div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              animate={{ width: `${(currentStep / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Main card */}
        <motion.div
          className="relative bg-white/8 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 sm:p-10 border border-white/20 overflow-hidden"
          whileHover={{ borderColor: 'rgba(168, 85, 247, 0.5)' }}
          transition={{ duration: 0.3 }}
        >
          {/* Gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 rounded-2xl transition-all duration-300 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <motion.div
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                  Join 9tangle
                </h1>
              </motion.div>
              <motion.p
                className="text-gray-300 text-base sm:text-lg font-light"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                Start your learning journey today
              </motion.p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <RegisterForm onStepChange={setCurrentStep} />
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom decorative elements */}
        <motion.div
          className="absolute -bottom-10 -right-10 w-32 h-32 border border-purple-400/10 rounded-full pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div
          className="absolute -top-10 -left-10 w-32 h-32 border border-blue-400/10 rounded-full pointer-events-none"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        />
      </motion.div>
    </div>
  );
}
