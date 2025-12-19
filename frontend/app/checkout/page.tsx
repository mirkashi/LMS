'use client';

import { useState, useEffect } from 'react';
import { useShop } from '@/context/ShopContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import Link from 'next/link';
import { motion } from 'framer-motion';
import axios from 'axios';

type CheckoutFormInputs = {
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  paymentMethod: string;
};

export default function Checkout() {
  const { cart, cartTotal, isAuthenticated, clearCart, loading: shopLoading } = useShop();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  
  const { register, handleSubmit, formState: { errors } } = useForm<CheckoutFormInputs>({
    defaultValues: {
      paymentMethod: 'credit_card'
    }
  });

  useEffect(() => {
    if (!shopLoading && !isAuthenticated) {
      router.push('/login?redirect=/checkout');
    }
  }, [isAuthenticated, shopLoading, router]);

  if (shopLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h2 className="text-3xl font-serif font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added any items to your cart yet.</p>
          <Link 
            href="/shop" 
            className="inline-block bg-gray-900 text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors"
          >
            Return to Shop
          </Link>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CheckoutFormInputs) => {
    setIsSubmitting(true);
    setOrderError('');

    try {
      const token = localStorage.getItem('token');
      const orderData = {
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress: {
          street: data.address,
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country
        },
        paymentMethod: data.paymentMethod,
        totalAmount: cartTotal
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        clearCart();
        router.push(`/checkout/success?orderId=${response.data.data.orderId}`);
      }
    } catch (error: any) {
      console.error('Order creation failed:', error);
      setOrderError(error.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase securely.</p>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Checkout Form */}
          <section className="lg:col-span-7">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Contact Information</h2>
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                    <input
                      type="email"
                      id="email"
                      {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                  </div>
                  
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First name</label>
                    <input
                      type="text"
                      id="firstName"
                      {...register('firstName', { required: 'First name is required' })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                    />
                    {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last name</label>
                    <input
                      type="text"
                      id="lastName"
                      {...register('lastName', { required: 'Last name is required' })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                    />
                    {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName.message}</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping Address</h2>
                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                    <input
                      type="text"
                      id="address"
                      {...register('address', { required: 'Address is required' })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                    />
                    {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                    <input
                      type="text"
                      id="city"
                      {...register('city', { required: 'City is required' })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                    />
                    {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                    <input
                      type="text"
                      id="state"
                      {...register('state', { required: 'State is required' })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                    />
                    {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="zip" className="block text-sm font-medium text-gray-700">Postal code</label>
                    <input
                      type="text"
                      id="zip"
                      {...register('zip', { required: 'Postal code is required' })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                    />
                    {errors.zip && <p className="mt-1 text-sm text-red-600">{errors.zip.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                    <select
                      id="country"
                      {...register('country', { required: 'Country is required' })}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-6">Payment Method</h2>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      id="credit-card"
                      type="radio"
                      value="credit_card"
                      {...register('paymentMethod')}
                      className="focus:ring-gray-900 h-4 w-4 text-gray-900 border-gray-300"
                    />
                    <label htmlFor="credit-card" className="ml-3 block text-sm font-medium text-gray-700">
                      Credit Card
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="paypal"
                      type="radio"
                      value="paypal"
                      {...register('paymentMethod')}
                      className="focus:ring-gray-900 h-4 w-4 text-gray-900 border-gray-300"
                    />
                    <label htmlFor="paypal" className="ml-3 block text-sm font-medium text-gray-700">
                      PayPal
                    </label>
                  </div>
                </div>
              </div>

              {orderError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                  {orderError}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gray-900 border border-transparent rounded-md shadow-sm py-3 px-4 text-base font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? 'Processing...' : `Pay $${cartTotal.toFixed(2)}`}
              </button>
            </form>
          </section>

          {/* Order Summary */}
          <section className="lg:col-span-5 mt-8 lg:mt-0">
            <div className="bg-white shadow-sm rounded-lg p-6 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-6">Order Summary</h2>
              <ul className="divide-y divide-gray-200">
                {cart.map((item) => (
                  <li key={item.product._id} className="flex py-6">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                      {item.product.image ? (
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      ) : (
                        <div className="h-full w-full bg-gray-100 flex items-center justify-center text-2xl">📦</div>
                      )}
                    </div>

                    <div className="ml-4 flex flex-1 flex-col">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3>{item.product.name}</h3>
                          <p className="ml-4">${(item.product.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{item.product.category}</p>
                      </div>
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <p className="text-gray-500">Qty {item.quantity}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="border-t border-gray-200 pt-6 mt-6">
                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                  <p>Subtotal</p>
                  <p>${cartTotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                  <p>Shipping</p>
                  <p>Free</p>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-4">
                  <p>Total</p>
                  <p>${cartTotal.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
