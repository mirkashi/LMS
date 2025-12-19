'use client';

import { useState, useEffect, useRef } from 'react';
import LoginForm from '@/components/LoginForm';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Particle {
  id: number;
  x: number;
  y: number;
  duration: number;
}

export default function Login() {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const particleIdRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Create trailing particles
      if (Math.random() > 0.8) {
        const newParticle: Particle = {
          id: particleIdRef.current++,
          x: e.clientX,
          y: e.clientY,
          duration: Math.random() * 0.5 + 0.5
        };
        setParticles(prev => [...prev.slice(-15), newParticle]);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center px-4 py-12 overflow-hidden relative"
    >
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 right-10 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            y: [0, 50, 0],
            x: [0, 30, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl"
          animate={{
            y: [0, -50, 0],
            x: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="fixed w-2 h-2 bg-blue-400 rounded-full pointer-events-none"
          initial={{ x: particle.x, y: particle.y, opacity: 1, scale: 1 }}
          animate={{ x: particle.x, y: particle.y + 100, opacity: 0, scale: 0 }}
          transition={{ duration: particle.duration }}
        />
      ))}

      <motion.div
        className="w-full max-w-md relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Card with glassmorphism and glow effect */}
        <motion.div
          className="relative bg-white/10 backdrop-blur-2xl rounded-2xl shadow-2xl p-8 sm:p-10 border border-white/20 overflow-hidden"
          whileHover={{ borderColor: 'rgba(59, 130, 246, 0.5)' }}
          transition={{ duration: 0.3 }}
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-purple-500/0 rounded-2xl transition-all duration-300 group-hover:from-blue-500/10 group-hover:to-purple-500/10 pointer-events-none" />

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
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <h1 className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-blue-400 via-blue-300 to-purple-400 bg-clip-text text-transparent mb-3">
                  9tangle
                </h1>
              </motion.div>
              <motion.p
                className="text-gray-300 text-base sm:text-lg font-light tracking-wide"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                Welcome back to your learning hub
              </motion.p>
            </motion.div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <LoginForm />
            </motion.div>

            {/* Divider */}
            <div className="flex items-center my-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            {/* Footer */}
            <motion.div
              className="mt-6 text-center space-y-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
            >
              <p className="text-gray-400 text-sm">
                Forgot your password?{' '}
                <Link
                  href="/forgot-password"
                  className="text-blue-400 font-semibold hover:text-blue-300 transition-colors duration-200 relative group"
                >
                  Reset it here
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-400 group-hover:w-full transition-all duration-300" />
                </Link>
              </p>
              <p className="text-gray-400 text-sm">
                Don't have an account?{' '}
                <Link
                  href="/register"
                  className="text-purple-400 font-semibold hover:text-purple-300 transition-colors duration-200 relative group"
                >
                  Create one
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300" />
                </Link>
              </p>
            </motion.div>
          </div>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          className="absolute -top-20 -right-20 w-40 h-40 border border-blue-400/20 rounded-full pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
        <motion.div
          className="absolute -bottom-20 -left-20 w-40 h-40 border border-purple-400/20 rounded-full pointer-events-none"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
}
