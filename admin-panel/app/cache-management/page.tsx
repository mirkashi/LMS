'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrashIcon,
  ChartBarIcon,
  ClockIcon,
  ServerIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  BoltIcon,
} from '@heroicons/react/24/outline';
import { useCacheSocket } from '@/hooks/useCacheSocket';

interface CacheStats {
  provider: string;
  connected: boolean | string;
  stats: {
    hits: number;
    misses: number;
    sets: number;
    deletes: number;
    clears: number;
    keys: number | string;
    hitRate: string;
  };
  memoryUsage: string;
}

interface ClearResult {
  success: boolean;
  type: string;
  deletedCount?: number;
  message?: string;
  error?: string;
}

export default function CacheManagement() {
  const [stats, setStats] = useState<CacheStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [clearingType, setClearingType] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [lastCleared, setLastCleared] = useState<Record<string, string>>({});
  const { isConnected, lastEvent } = useCacheSocket();

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  // Handle real-time cache clear events
  useEffect(() => {
    if (lastEvent) {
      // Refresh stats when cache is cleared
      fetchStats();
      
      // Show notification
      setMessage({
        type: 'success',
        text: `${lastEvent.type} cache cleared by another admin`,
      });
      
      setTimeout(() => setMessage(null), 5000);
    }
  }, [lastEvent]);

  // Fetch cache statistics
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/cache/stats`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch cache stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();
    // Refresh stats every 10 seconds
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Clear cache function
  const clearCache = async (type: string) => {
    setClearingType(type);
    setLoading(true);
    setMessage(null);

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/cache/clear/${type}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        setLastCleared({ ...lastCleared, [type]: new Date().toISOString() });
        // Refresh stats after clearing
        setTimeout(fetchStats, 500);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to clear cache' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An error occurred while clearing cache' });
      console.error('Clear cache error:', error);
    } finally {
      setLoading(false);
      setClearingType(null);
      // Auto-hide message after 5 seconds
      setTimeout(() => setMessage(null), 5000);
    }
  };

  // Cache sections configuration
  const cacheSections = [
    {
      id: 'shop',
      title: 'Shop Cache',
      description: 'Product listings, categories, and shop page data',
      icon: '🛍️',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      id: 'courses',
      title: 'Course Cache',
      description: 'Course listings, details, and enrollment data',
      icon: '📚',
      color: 'from-purple-500 to-pink-500',
    },
    {
      id: 'orders',
      title: 'Order Cache',
      description: 'Order listings and order details',
      icon: '📦',
      color: 'from-green-500 to-emerald-500',
    },
    {
      id: 'payments',
      title: 'Payment Cache',
      description: 'Payment transactions and status data',
      icon: '💳',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      id: 'admin',
      title: 'Admin Panel Cache',
      description: 'Analytics, user data, and dashboard statistics',
      icon: '⚙️',
      color: 'from-red-500 to-pink-500',
    },
    {
      id: 'all',
      title: 'Clear All Cache',
      description: 'Remove all cached data from the system',
      icon: '🗑️',
      color: 'from-gray-700 to-gray-900',
      dangerous: true,
    },
  ];

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Cache Management</h1>
          <p className="text-gray-600">
            Manage and clear various types of cached data to ensure fresh content delivery
          </p>
        </div>

        {/* Connection Status Badge */}
        <div className="mb-4 flex justify-end">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
            isConnected 
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-gray-50 text-gray-700 border border-gray-200'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
            <span>{isConnected ? 'Real-time updates active' : 'Connecting...'}</span>
          </div>
        </div>

        {/* Alert Message */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800'
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}
            >
              {message.type === 'success' ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                <XCircleIcon className="w-6 h-6" />
              )}
              <span className="font-medium">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Statistics Card */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-6 mb-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <ChartBarIcon className="w-8 h-8 text-blue-600" />
              <h2 className="text-2xl font-bold text-gray-900">Cache Statistics</h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ServerIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Provider</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 capitalize">{stats.provider}</p>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircleIcon className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Hit Rate</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.stats.hitRate}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <ChartBarIcon className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Total Hits</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.stats.hits.toLocaleString()}</p>
              </div>

              <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrashIcon className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">Cached Keys</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stats.stats.keys}</p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={fetchStats}
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Refresh Stats
              </button>
            </div>
          </motion.div>
        )}

        {/* Cache Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cacheSections.map((section, index) => (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                section.dangerous ? 'ring-2 ring-red-200' : ''
              }`}
            >
              <div className={`h-2 bg-gradient-to-r ${section.color}`} />
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{section.icon}</span>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{section.title}</h3>
                      {lastCleared[section.id] && (
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <ClockIcon className="w-3 h-3" />
                          <span>Cleared {formatTime(lastCleared[section.id])}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <p className="text-gray-600 text-sm mb-6">{section.description}</p>

                <button
                  onClick={() => clearCache(section.id)}
                  disabled={loading && clearingType === section.id}
                  className={`w-full py-3 px-4 rounded-xl font-semibold text-white transition-all duration-200 flex items-center justify-center gap-2 ${
                    section.dangerous
                      ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
                      : 'bg-gradient-to-r ' + section.color + ' hover:shadow-lg'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading && clearingType === section.id ? (
                    <>
                      <ArrowPathIcon className="w-5 h-5 animate-spin" />
                      <span>Clearing...</span>
                    </>
                  ) : (
                    <>
                      <TrashIcon className="w-5 h-5" />
                      <span>Clear Cache</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Warning Notice */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6"
        >
          <div className="flex gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <h4 className="font-bold text-yellow-900 mb-2">Important Notice</h4>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• Clearing cache may temporarily slow down page loads as data is re-fetched</li>
                <li>• Cache is automatically rebuilt when users access the affected pages</li>
                <li>• Use "Clear All Cache" sparingly as it affects the entire system</li>
                <li>• Cache statistics update in real-time to reflect system performance</li>
              </ul>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
