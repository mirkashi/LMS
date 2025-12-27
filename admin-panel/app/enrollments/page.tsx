'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function EnrollmentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchEnrollments(token);
  }, [router, filter]);

  const fetchEnrollments = async (token: string) => {
    setLoading(true);
    try {
      const url = filter 
        ? `${process.env.NEXT_PUBLIC_API_URL}/admin/enrollments?status=${filter}`
        : `${process.env.NEXT_PUBLIC_API_URL}/admin/enrollments`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setEnrollments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    if (!confirm('Are you sure you want to approve this enrollment request?')) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/enrollments/${enrollmentId}/approve`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Enrollment approved successfully!');
        fetchEnrollments(token);
      } else {
        alert(data.message || 'Failed to approve enrollment');
      }
    } catch (error) {
      console.error('Failed to approve enrollment:', error);
      alert('Failed to approve enrollment');
    }
  };

  const handleReject = async (enrollmentId: string) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;

    const reason = prompt('Enter rejection reason (optional):');
    if (reason === null) return; // User cancelled

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/enrollments/${enrollmentId}/reject`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reason: reason || 'No reason provided' }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert('Enrollment rejected');
        fetchEnrollments(token);
      } else {
        alert(data.message || 'Failed to reject enrollment');
      }
    } catch (error) {
      console.error('Failed to reject enrollment:', error);
      alert('Failed to reject enrollment');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <AdminLayout user={user}>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Enrollment Requests</h1>
          <p className="text-gray-600">Review and manage course enrollment requests</p>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex space-x-4 border-b">
          <button
            onClick={() => setFilter('pending')}
            className={`pb-3 px-4 font-medium transition-colors ${
              filter === 'pending'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`pb-3 px-4 font-medium transition-colors ${
              filter === 'approved'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`pb-3 px-4 font-medium transition-colors ${
              filter === 'rejected'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Rejected
          </button>
          <button
            onClick={() => setFilter('')}
            className={`pb-3 px-4 font-medium transition-colors ${
              filter === ''
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            All
          </button>
        </div>

        {/* Enrollments List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-500 text-lg">No enrollment requests found</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {enrollments.map((enrollment) => (
                  <tr key={enrollment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="font-medium text-gray-900">{enrollment.user?.name}</div>
                        <div className="text-sm text-gray-500">{enrollment.user?.email}</div>
                        {enrollment.user?.phone && (
                          <div className="text-sm text-gray-500">{enrollment.user?.phone}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{enrollment.course?.title}</div>
                        <div className="text-sm text-gray-500 capitalize">{enrollment.course?.category}</div>
                        <div className="text-sm font-semibold text-green-600">${enrollment.course?.price}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(enrollment.requestedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(enrollment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {enrollment.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleApprove(enrollment._id)}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(enrollment._id)}
                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {enrollment.status === 'approved' && (
                        <span className="text-green-600 font-medium">✓ Enrolled</span>
                      )}
                      {enrollment.status === 'rejected' && (
                        <div>
                          <span className="text-red-600 font-medium">✗ Rejected</span>
                          {enrollment.rejectionReason && (
                            <p className="text-xs text-gray-500 mt-1">{enrollment.rejectionReason}</p>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
