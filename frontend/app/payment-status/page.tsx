'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

interface PaymentRecord {
  _id: string;
  enrollment: { _id: string };
  user: { name: string; email: string };
  course: { title: string; price: number };
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  canRetry?: boolean;
  retryCount?: number;
  maxRetries?: number;
  createdAt: string;
}

export default function UserPaymentsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [payments, setPayments] = useState<{
    approved: PaymentRecord[];
    rejected: PaymentRecord[];
    pending: PaymentRecord[];
  }>({
    approved: [],
    rejected: [],
    pending: [],
  });
  const [loading, setLoading] = useState(true);
  const [retryingPaymentId, setRetryingPaymentId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');

      if (!token) {
        router.push('/login');
        return;
      }

      setUser(userData ? JSON.parse(userData) : null);

      try {
        // Fetch payments for all statuses
        const [approvedRes, rejectedRes, pendingRes] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/payment-tracking/user/status?status=approved`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/payment-tracking/user/status?status=rejected`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/payment-tracking/user/status?status=pending`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        const [approvedData, rejectedData, pendingData] = await Promise.all([
          approvedRes.json(),
          rejectedRes.json(),
          pendingRes.json(),
        ]);

        setPayments({
          approved: approvedData.data || [],
          rejected: rejectedData.data || [],
          pending: pendingData.data || [],
        });
      } catch (error) {
        console.error('Failed to fetch payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, [router]);

  const handleRetryPayment = async (paymentId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setRetryingPaymentId(paymentId);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/payment-tracking/${paymentId}/retry`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setSuccessMessage('Payment retry initiated. Please resubmit payment details.');
        setTimeout(() => setSuccessMessage(''), 5000);

        // Refresh payments
        window.location.reload();
      }
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setRetryingPaymentId(null);
    }
  };

  const PaymentCard = ({ payment, status }: { payment: PaymentRecord; status: string }) => {
    const statusConfig = {
      approved: {
        icon: CheckCircleIcon,
        color: 'text-green-600',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        label: 'Approved',
      },
      rejected: {
        icon: XCircleIcon,
        color: 'text-red-600',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        label: 'Rejected',
      },
      pending: {
        icon: ClockIcon,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        label: 'Pending',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <div className={`border ${config.borderColor} rounded-lg p-4 ${config.bgColor}`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <Icon className={`w-6 h-6 ${config.color} flex-shrink-0 mt-1`} />
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{payment.course.title}</h3>
              <p className="text-sm text-gray-600 mt-1">₹{payment.amount}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(payment.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
              {config.label}
            </span>
          </div>
        </div>

        {/* Rejection Reason */}
        {payment.rejectionReason && (
          <div className="mt-4 p-3 bg-white rounded border border-gray-200">
            <p className="text-xs font-medium text-gray-700 uppercase">Rejection Reason</p>
            <p className="text-sm text-gray-600 mt-1">{payment.rejectionReason}</p>
          </div>
        )}

        {/* Retry Button */}
        {status === 'rejected' && payment.canRetry && (
          <button
            onClick={() => handleRetryPayment(payment._id)}
            disabled={retryingPaymentId === payment._id}
            className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded font-medium hover:bg-blue-700 disabled:bg-gray-400 flex items-center justify-center gap-2 transition-colors"
          >
            <ArrowPathIcon className="w-4 h-4" />
            {retryingPaymentId === payment._id ? 'Processing...' : 'Retry Payment'}
          </button>
        )}

        {/* Retry Limit Message */}
        {status === 'rejected' && !payment.canRetry && (
          <div className="mt-4 p-3 bg-white rounded border border-red-200 flex items-start gap-2">
            <ExclamationCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">
              Maximum retries exceeded. Please contact support for assistance.
            </p>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Status</h1>
          <p className="text-gray-600">View and manage your course payment status</p>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <p className="text-green-800">{successMessage}</p>
          </div>
        )}

        {/* Approved Payments */}
        {payments.approved.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              Approved ({payments.approved.length})
            </h2>
            <div className="grid gap-4">
              {payments.approved.map((payment) => (
                <PaymentCard key={payment._id} payment={payment} status="approved" />
              ))}
            </div>
          </div>
        )}

        {/* Pending Payments */}
        {payments.pending.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <ClockIcon className="w-6 h-6 text-yellow-600" />
              Pending Review ({payments.pending.length})
            </h2>
            <div className="grid gap-4">
              {payments.pending.map((payment) => (
                <PaymentCard key={payment._id} payment={payment} status="pending" />
              ))}
            </div>
          </div>
        )}

        {/* Rejected Payments */}
        {payments.rejected.length > 0 && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <XCircleIcon className="w-6 h-6 text-red-600" />
              Rejected ({payments.rejected.length})
            </h2>
            <div className="grid gap-4">
              {payments.rejected.map((payment) => (
                <PaymentCard key={payment._id} payment={payment} status="rejected" />
              ))}
            </div>
          </div>
        )}

        {/* No Payments */}
        {payments.approved.length === 0 &&
          payments.pending.length === 0 &&
          payments.rejected.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">No payment records found</p>
            </div>
          )}
      </div>
    </main>
  );
}
