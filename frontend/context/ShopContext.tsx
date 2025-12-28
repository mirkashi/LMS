'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Product {
  _id: string;
  name: string;
  price: number;
  image?: string;
  images?: string[];
  category: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface ShopContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  loading: boolean;
  isAuthenticated: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    if (token) {
      fetchUserData(token);
    } else {
      // Load from local storage for guests
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const localWishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      setCart(localCart);
      setWishlist(localWishlist);
      setLoading(false);
    }
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const [cartRes, wishlistRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/cart`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/wishlist`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (cartRes.ok) {
        const cartData = await cartRes.json();
        setCart(cartData.data);
      }
      if (wishlistRes.ok) {
        const wishlistData = await wishlistRes.json();
        setWishlist(wishlistData.data);
      }
    } catch (error) {
      console.error('Error fetching shop data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (product: Product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          alert('Please log in to add items to cart');
          window.location.href = '/login';
          return;
        }
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/cart`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ productId: product._id, quantity })
        });
        
        if (res.status === 401) {
          const data = await res.json();
          console.error('Authentication error:', data.message);
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          window.location.href = '/login';
          return;
        }
        
        if (res.ok) {
          const data = await res.json();
          setCart(data.data);
        } else {
          const data = await res.json();
          console.error('Error adding to cart:', data.message);
          alert(`Failed to add to cart: ${data.message}`);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        alert('Failed to add item to cart. Please try again.');
      }
    } else {
      const newCart = [...cart];
      const existingItem = newCart.find(item => item.product._id === product._id);
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        newCart.push({ product, quantity });
      }
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const removeFromCart = async (productId: string) => {
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/cart/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setCart(data.data);
        }
      } catch (error) {
        console.error('Error removing from cart:', error);
      }
    } else {
      const newCart = cart.filter(item => item.product._id !== productId);
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/cart/${productId}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
          },
          body: JSON.stringify({ quantity })
        });
        if (res.ok) {
          const data = await res.json();
          setCart(data.data);
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    } else {
      const newCart = cart.map(item => 
        item.product._id === productId ? { ...item, quantity } : item
      );
      setCart(newCart);
      localStorage.setItem('cart', JSON.stringify(newCart));
    }
  };

  const addToWishlist = async (product: Product) => {
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          alert('Please log in to add items to wishlist');
          window.location.href = '/login';
          return;
        }
        
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/wishlist/${product._id}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.status === 401) {
          const data = await res.json();
          console.error('Authentication error:', data.message);
          alert('Your session has expired. Please log in again.');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          window.location.href = '/login';
          return;
        }
        
        if (res.ok) {
          const data = await res.json();
          // Re-fetch populated wishlist
          const wishlistRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/wishlist`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (wishlistRes.ok) {
            const wishlistData = await wishlistRes.json();
            setWishlist(wishlistData.data);
          }
        } else {
          const data = await res.json();
          console.error('Error adding to wishlist:', data.message);
          alert(`Failed to add to wishlist: ${data.message}`);
        }
      } catch (error) {
        console.error('Error adding to wishlist:', error);
        alert('Failed to add item to wishlist. Please try again.');
      }
    } else {
      if (!wishlist.find(p => p._id === product._id)) {
        const newWishlist = [...wishlist, product];
        setWishlist(newWishlist);
        localStorage.setItem('wishlist', JSON.stringify(newWishlist));
      }
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (isAuthenticated) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/wishlist/${productId}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        setWishlist(prev => prev.filter(p => p._id !== productId));
      } catch (error) {
        console.error('Error removing from wishlist:', error);
      }
    } else {
      const newWishlist = wishlist.filter(p => p._id !== productId);
      setWishlist(newWishlist);
      localStorage.setItem('wishlist', JSON.stringify(newWishlist));
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some(p => p._id === productId);
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem('cart');
  };

  // Filter out items with null/undefined products and calculate totals
  const validCart = cart.filter(item => item.product && item.product.price !== undefined);
  const cartTotal = validCart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const cartCount = validCart.reduce((count, item) => count + item.quantity, 0);

  // Clean up invalid cart items
  useEffect(() => {
    if (cart.length > validCart.length) {
      console.warn('Removing invalid items from cart');
      setCart(validCart);
      if (!isAuthenticated) {
        localStorage.setItem('cart', JSON.stringify(validCart));
      }
    }
  }, [cart, validCart, isAuthenticated]);

  return (
    <ShopContext.Provider value={{
      cart,
      wishlist,
      addToCart,
      removeFromCart,
      updateQuantity,
      addToWishlist,
      removeFromWishlist,
      isInWishlist,
      clearCart,
      cartTotal,
      cartCount,
      loading,
      isAuthenticated
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (context === undefined) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
