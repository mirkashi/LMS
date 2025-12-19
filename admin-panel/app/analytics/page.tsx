'use client';

import AdminLayout from '@/components/AdminLayout';
import { ChartBarIcon } from '@heroicons/react/24/outline';

export default function AnalyticsPage() {
  return (
    <AdminLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics</h1>
          <p className="text-gray-600">Detailed platform analytics and reports.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChartBarIcon className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Coming Soon</h3>
          <p className="text-gray-600 mb-6">Advanced analytics features are currently under development.</p>
        </div>
      </div>
    </AdminLayout>
  );
}
