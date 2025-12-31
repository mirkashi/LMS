'use client';

import { useState, FormEvent } from 'react';
import { XMarkIcon, CameraIcon } from '@heroicons/react/24/outline';

interface EnrollmentPaymentModalProps {
  course: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EnrollmentPaymentModal({
  course,
  isOpen,
  onClose,
  onSuccess,
}: EnrollmentPaymentModalProps) {
  const [paymentMethod, setPaymentMethod] = useState('jazzcash');
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentProofPreview, setPaymentProofPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    accountNumber: '',
    accountName: '',
    transactionId: '',
    transactionDate: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPaymentProof(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    if (!paymentProof) {
      setError('Please upload payment proof screenshot');
      return;
    }

    setLoading(true);
    setError('');

    const token = localStorage.getItem('token');
    const formDataToSend = new FormData();
    
    formDataToSend.append('paymentMethod', paymentMethod);
    formDataToSend.append('paymentAmount', course.price.toString());
    formDataToSend.append('paymentProof', paymentProof);
    formDataToSend.append('accountNumber', formData.accountNumber);
    formDataToSend.append('accountName', formData.accountName);
    formDataToSend.append('transactionId', formData.transactionId);
    formDataToSend.append('transactionDate', formData.transactionDate || new Date().toISOString());
    formDataToSend.append('notes', formData.notes);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/courses/${course._id}/enroll`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formDataToSend,
        }
      );

      if (response.ok) {
        alert('Enrollment request submitted! Please wait for admin approval.');
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to submit enrollment request');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const paymentInstructions: { [key: string]: { account: string; name: string; instructions: string } } = {
    jazzcash: {
      account: '03XX-XXXXXXX',
      name: 'LMS Admin',
      instructions: 'Send payment to the JazzCash account above and upload the screenshot',
    },
    easypaisa: {
      account: '03XX-XXXXXXX',
      name: 'LMS Admin',
      instructions: 'Send payment to the EasyPaisa account above and upload the screenshot',
    },
    'bank-transfer': {
      account: 'XXXX-XXXX-XXXX-XXXX',
      name: 'LMS Education Platform',
      instructions: 'Transfer to the bank account above (Bank: ABC Bank) and upload the receipt',
    },
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Complete Payment</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900">{course.title}</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              PKR {course.price.toLocaleString()}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Method Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['jazzcash', 'easypaisa', 'bank-transfer'].map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPaymentMethod(method)}
                    className={`p-4 border-2 rounded-lg text-center transition-all ${
                      paymentMethod === method
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="font-semibold capitalize">
                      {method.replace('-', ' ')}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment Instructions */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-900 mb-2">Payment Instructions</h4>
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Account Number:</strong> {paymentInstructions[paymentMethod].account}
              </p>
              <p className="text-sm text-yellow-800 mb-2">
                <strong>Account Name:</strong> {paymentInstructions[paymentMethod].name}
              </p>
              <p className="text-sm text-yellow-800">
                {paymentInstructions[paymentMethod].instructions}
              </p>
            </div>

            {/* Transaction Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sender Account/Phone Number
                </label>
                <input
                  type="text"
                  value={formData.accountNumber}
                  onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="03XX-XXXXXXX"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sender Name
                </label>
                <input
                  type="text"
                  value={formData.accountName}
                  onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID (Optional)
                </label>
                <input
                  type="text"
                  value={formData.transactionId}
                  onChange={(e) => setFormData({ ...formData, transactionId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Transaction reference"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction Date
                </label>
                <input
                  type="date"
                  value={formData.transactionDate}
                  onChange={(e) => setFormData({ ...formData, transactionDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional information..."
              />
            </div>

            {/* Payment Proof Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Payment Proof <span className="text-red-500">*</span>
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                {paymentProofPreview ? (
                  <div className="relative">
                    <img
                      src={paymentProofPreview}
                      alt="Payment proof preview"
                      className="max-w-full h-auto mx-auto rounded-lg max-h-64"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentProof(null);
                        setPaymentProofPreview('');
                      }}
                      className="mt-2 text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-1">Click to upload payment screenshot</p>
                    <p className="text-sm text-gray-500">PNG, JPG up to 5MB</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}

            <div className="flex items-center justify-end space-x-4 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Enrollment Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
