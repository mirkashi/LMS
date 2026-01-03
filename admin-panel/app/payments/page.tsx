'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useRouter } from 'next/navigation';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon,
  DocumentArrowDownIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import { getAssetUrl } from '@/lib/assets';

interface PaymentProof {
  url: string;
  filename: string;
  uploadedAt: string;
  storageType: string;
}

interface TransactionDetails {
  accountNumber?: string;
  accountName?: string;
  transactionId?: string;
  transactionDate?: string;
  notes?: string;
}

interface Enrollment {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  course: {
    _id: string;
    title: string;
    price: number;
    category: string;
    thumbnail?: string;
  };
  status: 'pending' | 'approved' | 'rejected';
  paymentStatus: 'pending' | 'submitted' | 'verified' | 'rejected';
  paymentMethod: string;
  paymentAmount: number;
  paymentProof?: PaymentProof;
  transactionDetails?: TransactionDetails;
  requestedAt: string;
  rejectionReason?: string;
}

export default function PaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('submitted');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<Enrollment | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const userData = localStorage.getItem('adminUser');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchEnrollments();
  }, [filter]);

  const fetchEnrollments = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/enrollments?paymentStatus=${filter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setEnrollments(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (enrollmentId: string) => {
    setActionLoading(true);
    const token = localStorage.getItem('adminToken');

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

      if (response.ok) {
        alert('Enrollment approved successfully!');
        setShowModal(false);
        fetchEnrollments();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to approve enrollment');
      }
    } catch (error) {
      console.error('Failed to approve enrollment:', error);
      alert('An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (enrollmentId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }

    setActionLoading(true);
    const token = localStorage.getItem('adminToken');

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/enrollments/${enrollmentId}/reject`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ rejectionReason }),
        }
      );

      if (response.ok) {
        alert('Enrollment rejected');
        setShowModal(false);
        setRejectionReason('');
        fetchEnrollments();
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to reject enrollment');
      }
    } catch (error) {
      console.error('Failed to reject enrollment:', error);
      alert('An error occurred');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredEnrollments = enrollments.filter((enrollment) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      enrollment.user.name.toLowerCase().includes(searchLower) ||
      enrollment.user.email.toLowerCase().includes(searchLower) ||
      enrollment.course?.title?.toLowerCase().includes(searchLower)
    );
  });

  const getPaymentMethodLabel = (method: string) => {
    const labels: { [key: string]: string } = {
      'jazzcash': 'JazzCash',
      'easypaisa': 'EasyPaisa',
      'bank-transfer': 'Bank Transfer',
      'credit-card': 'Credit Card',
    };
    return labels[method] || method;
  };

  return (
    <AdminLayout user={user}>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Payment Received</h1>
          <p className="text-gray-600 mt-2">Review and approve enrollment payment proofs</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FunnelIcon className="w-4 h-4 inline mr-1" />
                Payment Status
              </label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="submitted">Submitted (Pending Review)</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Awaiting Payment</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MagnifyingGlassIcon className="w-4 h-4 inline mr-1" />
                Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or course..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Enrollments List */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading payment proofs...</p>
          </div>
        ) : filteredEnrollments.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <DocumentArrowDownIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No payment proofs found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredEnrollments.map((enrollment) => (
              <div key={enrollment._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">
                            {enrollment.user.name.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{enrollment.user.name}</h3>
                        <p className="text-sm text-gray-600">{enrollment.user.email}</p>
                        {enrollment.user.phone && (
                          <p className="text-sm text-gray-600">{enrollment.user.phone}</p>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        PKR {enrollment.paymentAmount.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {new Date(enrollment.requestedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Course:</span>
                      <p className="text-gray-900">{enrollment.course?.title || 'N/A'}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Payment Method:</span>
                      <p className="text-gray-900">{getPaymentMethodLabel(enrollment.paymentMethod)}</p>
                    </div>
                  </div>

                  {enrollment.transactionDetails && (
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2">Transaction Details</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        {enrollment.transactionDetails.transactionId && (
                          <div>
                            <span className="text-gray-600">Transaction ID:</span>
                            <span className="ml-2 font-medium">{enrollment.transactionDetails.transactionId}</span>
                          </div>
                        )}
                        {enrollment.transactionDetails.accountNumber && (
                          <div>
                            <span className="text-gray-600">Account:</span>
                            <span className="ml-2 font-medium">{enrollment.transactionDetails.accountNumber}</span>
                          </div>
                        )}
                        {enrollment.transactionDetails.accountName && (
                          <div>
                            <span className="text-gray-600">Account Name:</span>
                            <span className="ml-2 font-medium">{enrollment.transactionDetails.accountName}</span>
                          </div>
                        )}
                        {enrollment.transactionDetails.notes && (
                          <div className="col-span-2">
                            <span className="text-gray-600">Notes:</span>
                            <p className="mt-1 text-gray-900">{enrollment.transactionDetails.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        setSelectedEnrollment(enrollment);
                        setShowModal(true);
                      }}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <EyeIcon className="w-5 h-5 mr-2" />
                      View Details & Approve
                    </button>

                    {enrollment.paymentProof && (
                      <a
                        href={getAssetUrl(enrollment.paymentProof.url) || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <DocumentArrowDownIcon className="w-5 h-5 mr-2" />
                        View Payment Proof
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && selectedEnrollment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Review Payment Proof</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Student Information</h3>
                    <p><strong>Name:</strong> {selectedEnrollment.user.name}</p>
                    <p><strong>Email:</strong> {selectedEnrollment.user.email}</p>
                    {selectedEnrollment.user.phone && <p><strong>Phone:</strong> {selectedEnrollment.user.phone}</p>}
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-700 mb-2">Course Information</h3>
                    <p><strong>Course:</strong> {selectedEnrollment.course?.title || 'N/A'}</p>
                    <p><strong>Price:</strong> PKR {selectedEnrollment.course?.price?.toLocaleString?.() || 'N/A'}</p>
                    <p><strong>Amount Paid:</strong> PKR {selectedEnrollment.paymentAmount.toLocaleString()}</p>
                  </div>
                </div>

                {selectedEnrollment.paymentProof && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-2">Payment Proof</h3>
                    <div className="border border-gray-300 rounded-lg p-2 bg-gray-50">
                      <img
                        src={getAssetUrl(selectedEnrollment.paymentProof.url) || ''}
                        alt="Payment Proof"
                        className="max-w-full h-auto rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300"><rect fill="%23f3f4f6" width="400" height="300"/><text x="50%" y="50%" text-anchor="middle" fill="%239ca3af" font-size="16">Image failed to load</text></svg>';
                        }}
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        <strong>Filename:</strong> {selectedEnrollment.paymentProof.filename}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Uploaded:</strong> {new Date(selectedEnrollment.paymentProof.uploadedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rejection Reason (Optional - only if rejecting)
                  </label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter reason for rejection..."
                  />
                </div>

                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => {
                      setShowModal(false);
                      setRejectionReason('');
                    }}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    disabled={actionLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleReject(selectedEnrollment._id)}
                    className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    <XCircleIcon className="w-5 h-5 mr-2" />
                    {actionLoading ? 'Processing...' : 'Reject'}
                  </button>
                  <button
                    onClick={() => handleApprove(selectedEnrollment._id)}
                    className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    disabled={actionLoading}
                  >
                    <CheckCircleIcon className="w-5 h-5 mr-2" />
                    {actionLoading ? 'Processing...' : 'Approve Enrollment'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
