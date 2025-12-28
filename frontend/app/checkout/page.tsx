'use client';

import AppImage from '@/components/AppImage';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useShop } from '@/context/ShopContext';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import axios from 'axios';

type CheckoutFormInputs = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  address2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  paymentMethod: string;
  shippingOption: string;
};

const pakistanStates: { name: string; cities: string[] }[] = [
  { name: 'Punjab', cities: ['Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 'Multan', 'Sialkot', 'Gujranwala'] },
  { name: 'Sindh', cities: ['Karachi', 'Hyderabad', 'Sukkur', 'Larkana'] },
  { name: 'Khyber Pakhtunkhwa', cities: ['Peshawar', 'Abbottabad', 'Mardan', 'Swat'] },
  { name: 'Balochistan', cities: ['Quetta', 'Gwadar', 'Khuzdar'] },
  { name: 'Gilgit-Baltistan', cities: ['Gilgit', 'Skardu'] },
  { name: 'Azad Kashmir', cities: ['Muzaffarabad', 'Mirpur'] }
];

const domesticShipping = [
  { value: 'pk-standard', label: 'Standard (2-4 days)', amount: 4, description: 'Tracked courier within Pakistan' },
  { value: 'pk-express', label: 'Express (24-48 hrs)', amount: 9, description: 'Priority handling for metros' }
];

const internationalShipping = [
  { value: 'intl-standard', label: 'International Economy', amount: 18, description: '5-10 business days, customs handled' },
  { value: 'intl-express', label: 'International Express', amount: 32, description: '2-5 business days with priority clearance' }
];

export default function Checkout() {
  const { cart, cartTotal, isAuthenticated, clearCart, loading: shopLoading } = useShop();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const steps = ['Contact', 'Shipping', 'Payment', 'Review'];
  
  const { register, handleSubmit, formState: { errors }, watch, setValue, trigger } = useForm<CheckoutFormInputs>({
    defaultValues: {
      paymentMethod: 'stripe',
      country: 'PK',
      state: 'Punjab',
      city: 'Lahore',
      shippingOption: 'pk-standard'
    }
  });

  const selectedCountry = watch('country');
  const selectedState = watch('state');
  const selectedShipping = watch('shippingOption');
  const availableCities = selectedCountry === 'PK'
    ? (pakistanStates.find((s) => s.name === selectedState)?.cities || [])
    : ['Select city'];
  const shippingOptions = selectedCountry === 'PK' ? domesticShipping : internationalShipping;
  const shippingFee = shippingOptions.find((opt) => opt.value === selectedShipping)?.amount || 0;

  useEffect(() => {
    if (selectedCountry !== 'PK') {
      setValue('state', 'N/A');
      setValue('city', '');
      setValue('zip', '');
      setValue('shippingOption', 'intl-standard');
    } else {
      const defaultCity = pakistanStates.find((s) => s.name === selectedState)?.cities[0] || '';
      setValue('city', defaultCity);
      if (!shippingOptions.some((opt) => opt.value === selectedShipping)) {
        setValue('shippingOption', domesticShipping[0].value);
      }
    }
  }, [selectedCountry, selectedState]);

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
      
      if (!token) {
        setOrderError('Authentication token not found. Please log in again.');
        setIsSubmitting(false);
        router.push('/login?redirect=/checkout');
        return;
      }

      if (!cart || cart.length === 0) {
        setOrderError('Your cart is empty.');
        setIsSubmitting(false);
        return;
      }

      const orderData = {
        items: cart.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          price: item.product.price
        })),
        shippingAddress: {
          street: data.address,
          street2: data.address2 || '',
          city: data.city,
          state: data.state,
          zip: data.zip,
          country: data.country
        },
        paymentMethod: data.paymentMethod,
        paymentMethodLabel: data.paymentMethod,
        shippingMethod: data.shippingOption,
        customerName: `${data.firstName} ${data.lastName}`.trim(),
        customerEmail: data.email,
        customerPhone: data.phone,
        totalAmount: cartTotal + shippingFee
      };

      console.log('Submitting order:', orderData);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Order response:', response.data);

      if (response.data.success) {
        clearCart();
        router.push(`/checkout/success?orderId=${response.data.data.orderId}`);
      } else {
        setOrderError(response.data.message || 'Failed to create order. Please try again.');
      }
    } catch (error: any) {
      console.error('Order creation failed:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
        
        // Handle specific error codes
        if (error.response?.data?.errorCode === 'EMPTY_CART') {
          errorMessage = 'Your cart is empty. Please add items before checking out.';
          setTimeout(() => router.push('/shop'), 2000);
        } else if (error.response?.data?.errorCode === 'INVALID_TOKEN') {
          errorMessage = 'Your session has expired. Please log in again.';
          localStorage.removeItem('token');
          setTimeout(() => router.push('/login?redirect=/checkout'), 2000);
        }
      } else if (error.response?.status === 401) {
        errorMessage = 'Your session has expired. Please log in again.';
        localStorage.removeItem('token');
        setTimeout(() => router.push('/login?redirect=/checkout'), 2000);
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid order information. Please check your details and try again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'One or more products are no longer available.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try again later.';
      } else if (error.message === 'Network Error') {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setOrderError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-gray-900">Checkout</h1>
          <p className="text-gray-600 mt-2">Complete your purchase securely.</p>
          <div className="mt-6 grid grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div key={step} className={`flex items-center gap-3 rounded-lg px-3 py-2 border ${index + 1 <= currentStep ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 text-gray-500'}`}>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-bold ${index + 1 <= currentStep ? 'bg-white text-gray-900' : 'bg-gray-100 text-gray-500'}`}>
                  {index + 1}
                </div>
                <span className="text-sm font-semibold">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">
          {/* Checkout Form */}
          <section className="lg:col-span-7">
            <form onSubmit={handleSubmit(onSubmit)}>
              {currentStep === 1 && (
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

                    <div className="sm:col-span-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                      <input
                        type="tel"
                        id="phone"
                        {...register('phone', { required: 'Phone is required' })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                        placeholder="03XX-XXXXXXX"
                      />
                      {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Shipping & Address</h2>
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

                    <div className="sm:col-span-2">
                      <label htmlFor="address2" className="block text-sm font-medium text-gray-700">Apartment, suite, etc. (optional)</label>
                      <input
                        type="text"
                        id="address2"
                        {...register('address2')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                      />
                    </div>

                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                      <select
                        id="country"
                        {...register('country', { required: 'Country is required' })}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                      >
                        <option value="PK">Pakistan</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="AE">UAE</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">State / Province</label>
                      {selectedCountry === 'PK' ? (
                        <select
                          id="state"
                          {...register('state', { required: 'State is required' })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                        >
                          {pakistanStates.map((s) => (
                            <option key={s.name} value={s.name}>{s.name}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          id="state"
                          {...register('state', { required: 'State is required' })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                        />
                      )}
                      {errors.state && <p className="mt-1 text-sm text-red-600">{errors.state.message}</p>}
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                      {selectedCountry === 'PK' ? (
                        <select
                          id="city"
                          {...register('city', { required: 'City is required' })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                        >
                          {availableCities.map((city) => (
                            <option key={city} value={city}>{city}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type="text"
                          id="city"
                          {...register('city', { required: 'City is required' })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-900 focus:border-gray-900 sm:text-sm py-2 px-3 border"
                        />
                      )}
                      {errors.city && <p className="mt-1 text-sm text-red-600">{errors.city.message}</p>}
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

                    <div className="sm:col-span-2">
                      <p className="text-sm font-medium text-gray-700 mb-2">Shipping method</p>
                      <div className="space-y-3">
                        {shippingOptions.map((option) => (
                          <label key={option.value} className="flex items-start gap-3 border border-gray-200 rounded-lg p-3 hover:border-gray-900 transition-colors cursor-pointer">
                            <input
                              type="radio"
                              value={option.value}
                              {...register('shippingOption')}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <div className="flex justify-between items-center">
                                <span className="text-sm font-semibold text-gray-900">{option.label}</span>
                                <span className="text-sm font-bold text-gray-900">PKR {option.amount.toFixed(2)}</span>
                              </div>
                              <p className="text-xs text-gray-500 mt-1">{option.description}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Payment Method</h2>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="stripe"
                        type="radio"
                        value="stripe"
                        {...register('paymentMethod')}
                        className="focus:ring-gray-900 h-4 w-4 text-gray-900 border-gray-300"
                      />
                      <label htmlFor="stripe" className="ml-3 block text-sm font-medium text-gray-700">
                        Card (Stripe)
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
                    <div className="flex items-center">
                      <input
                        id="cod"
                        type="radio"
                        value="cod"
                        {...register('paymentMethod')}
                        className="focus:ring-gray-900 h-4 w-4 text-gray-900 border-gray-300"
                      />
                      <label htmlFor="cod" className="ml-3 block text-sm font-medium text-gray-700">
                        Cash on Delivery (eligible regions)
                      </label>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-3">Payments are processed securely over SSL. You will receive an order confirmation email after checkout.</p>
                </div>
              )}

              {currentStep === 4 && (
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-medium text-gray-900 mb-6">Review & Confirm</h2>
                  <div className="space-y-2 text-sm text-gray-700">
                    <p><span className="font-semibold">Email:</span> {watch('email')}</p>
                    <p><span className="font-semibold">Ship to:</span> {watch('address')} {watch('address2') && `, ${watch('address2')}`}, {watch('city')}, {watch('state')}, {watch('country')} {watch('zip')}</p>
                    <p><span className="font-semibold">Shipping method:</span> {shippingOptions.find((opt) => opt.value === selectedShipping)?.label}</p>
                    <p><span className="font-semibold">Payment:</span> {watch('paymentMethod')?.toUpperCase()}</p>
                  </div>
                </div>
              )}

              {orderError && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
                  {orderError}
                </div>
              )}

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
                  className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                  disabled={currentStep === 1}
                >
                  Back
                </button>

                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={async () => {
                      const fieldsByStep: Record<number, (keyof CheckoutFormInputs)[]> = {
                        1: ['email', 'firstName', 'lastName', 'phone'],
                        2: ['address', 'city', 'state', 'zip', 'country', 'shippingOption'],
                        3: ['paymentMethod']
                      };
                      const fieldsToValidate = fieldsByStep[currentStep] || [];
                      const valid = await trigger(fieldsToValidate as any);
                      if (valid) setCurrentStep((s) => s + 1);
                    }}
                    className="px-6 py-3 bg-gray-900 text-white rounded-md font-semibold hover:bg-gray-800 transition-colors"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gray-900 text-white rounded-md font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : `Pay PKR ${(cartTotal + shippingFee).toFixed(2)}`}
                  </button>
                )}
              </div>
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
                      {(item.product.images?.[0] || item.product.image) ? (
                        <AppImage
                          path={item.product.images?.[0] || item.product.image}
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
                          <p className="ml-4">PKR {(item.product.price * item.quantity).toFixed(2)}</p>
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
                  <p>PKR {cartTotal.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-base font-medium text-gray-900 mb-4">
                  <p>Shipping</p>
                  <p>PKR {shippingFee.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-xl font-bold text-gray-900 border-t border-gray-200 pt-4">
                  <p>Total</p>
                  <p>PKR {(cartTotal + shippingFee).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
