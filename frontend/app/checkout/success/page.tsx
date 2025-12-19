'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircleIcon } from '@heroicons/react/24/outline';

export default function CheckoutSuccess() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <main className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-8 text-center">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
          <CheckCircleIcon className="h-10 w-10 text-green-600" />
        </div>
        
        <h2 className="text-3xl font-serif font-bold text-gray-900 mb-2">
          Order Confirmed!
        </h2>
        
        <p className="text-gray-600 mb-6">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>

        {orderId && (
          <div className="bg-gray-50 rounded-md p-4 mb-8">
            <p className="text-sm text-gray-500 mb-1">Order ID</p>
            <p className="text-lg font-mono font-medium text-gray-900">{orderId}</p>
          </div>
        )}

        <div className="space-y-3">
          <Link 
            href="/dashboard" 
            className="block w-full bg-gray-900 text-white px-4 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
          >
            View Order in Dashboard
          </Link>
          
          <Link 
            href="/shop" 
            className="block w-full bg-white text-gray-900 border border-gray-300 px-4 py-3 rounded-md font-medium hover:bg-gray-50 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </main>
  );
}
