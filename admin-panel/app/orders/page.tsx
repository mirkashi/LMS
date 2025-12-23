"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import AdminLayout from "@/components/AdminLayout";

interface ShippingAddress {
  street: string;
  street2?: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface OrderItem {
  product?: {
    _id: string;
    name: string;
  };
  course?: {
    _id: string;
    title: string;
  };
  quantity: number;
  price: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
}

interface Order {
  _id: string;
  orderId: string;
  user?: User;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod?: string;
  paymentMethodLabel?: string;
  transactionId?: string;
  shippingMethod?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  shippingAddress?: ShippingAddress;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [filtered, setFiltered] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [updating, setUpdating] = useState(false);
  const [confirmBulkUpdate, setConfirmBulkUpdate] = useState<{ status: string; count: number } | null>(null);
  const [sortBy, setSortBy] = useState<'createdAt' | 'totalAmount' | 'status' | 'customerName'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAuthAndFetchOrders = async () => {
      const token = localStorage.getItem("adminToken");
      const userData = localStorage.getItem("adminUser");

      if (!token || !userData) {
        router.push("/login");
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/admin/orders`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setOrders(data.data || []);
          setFiltered(data.data || []);
          setError(null);
        } else {
          setError("Failed to load orders. Please try again.");
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
        setError("Network error. Please check your connection.");
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchOrders();
  }, [router]);

  // WebSocket connection for real-time updates
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000');

    socket.on('order-update', (data: { orderId: string; status: string }) => {
      console.log('Real-time order update:', data);
      setOrders((prev) =>
        prev.map((order) =>
          order._id === data.orderId ? { ...order, status: data.status as Order['status'] } : order
        )
      );
      setFiltered((prev) =>
        prev.map((order) =>
          order._id === data.orderId ? { ...order, status: data.status as Order['status'] } : order
        )
      );
      if (selected && selected._id === data.orderId) {
        setSelected({ ...selected, status: data.status as Order['status'] });
      }
    });

    return () => {
      socket.close();
    };
  }, [selected]);

  // Filter and Sort
  useEffect(() => {
    let filteredOrders = orders;

    // Filter by query
    if (query) {
      const q = query.toLowerCase();
      filteredOrders = filteredOrders.filter((o: Order) => {
        const id = (o.orderId || o._id)?.toString().toLowerCase();
        const name = (o.customerName || o.user?.name || "").toLowerCase();
        const email = (o.customerEmail || o.user?.email || "").toLowerCase();
        return (
          id?.includes(q) || name.includes(q) || email.includes(q)
        );
      });
    }

    // Filter by status
    if (statusFilter) {
      filteredOrders = filteredOrders.filter((o: Order) => o.status === statusFilter);
    }

    // Filter by date range
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      filteredOrders = filteredOrders.filter((o: Order) => new Date(o.createdAt) >= fromDate);
    }
    if (dateTo) {
      const toDate = new Date(dateTo);
      toDate.setHours(23, 59, 59, 999); // End of day
      filteredOrders = filteredOrders.filter((o: Order) => new Date(o.createdAt) <= toDate);
    }

    // Sort
    filteredOrders = [...filteredOrders].sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortBy) {
        case 'createdAt':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'totalAmount':
          aVal = a.totalAmount;
          bVal = b.totalAmount;
          break;
        case 'status':
          aVal = a.status;
          bVal = b.status;
          break;
        case 'customerName':
          aVal = (a.customerName || a.user?.name || "").toLowerCase();
          bVal = (b.customerName || b.user?.name || "").toLowerCase();
          break;
        default:
          return 0;
      }
      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    setFiltered(filteredOrders);
  }, [query, statusFilter, dateFrom, dateTo, orders, sortBy, sortOrder]);

  const totalRevenue = useMemo(
    () => filtered.reduce((sum, o) => sum + (o.totalAmount || 0), 0),
    [filtered]
  );

  const statusClass = (status: string) =>
    status === "completed"
      ? "bg-green-100 text-green-800"
      : status === "pending"
      ? "bg-yellow-100 text-yellow-800"
      : status === "processing"
      ? "bg-blue-100 text-blue-800"
      : status === "shipped"
      ? "bg-indigo-100 text-indigo-800"
      : status === "delivered"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-red-100 text-red-800";

  const handleUpdateStatus = async (orderId: string, status: string) => {
    try {
      setUpdating(true);
      const token = localStorage.getItem("adminToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/orders/${orderId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o._id === data.data._id ? data.data : o)));
        setFiltered((prev) => prev.map((o) => (o._id === data.data._id ? data.data : o)));
        // Optimistically reflect immediately
        if (selected && selected._id === data.data._id) setSelected(data.data);
        setError(null);
      } else {
        setError("Failed to update order status. Please try again.");
      }
    } catch (e) {
      console.error("Status update failed", e);
      setError("Network error during update.");
    } finally {
      setUpdating(false);
    }
  };

  const [printPending, setPrintPending] = useState(false);

  const handlePrintInvoice = useCallback(() => {
    // The print area is conditionally rendered from `selected`.
    // We trigger printing after React flushes the UI update.
    setPrintPending(true);
  }, []);

  useEffect(() => {
    if (!printPending) return;
    if (!selected) {
      setPrintPending(false);
      return;
    }

    const id = window.setTimeout(() => {
      window.print();
      setPrintPending(false);
    }, 0);

    return () => window.clearTimeout(id);
  }, [printPending, selected]);

  const handleSort = (column: typeof sortBy) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(filtered.map(o => o._id));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders(prev => [...prev, orderId]);
    } else {
      setSelectedOrders(prev => prev.filter(id => id !== orderId));
    }
  };

  const handleBulkUpdateStatus = (status: string) => {
    if (selectedOrders.length === 0) return;
    setConfirmBulkUpdate({ status, count: selectedOrders.length });
  };

  const confirmBulkUpdateStatus = async () => {
    if (!confirmBulkUpdate) return;
    const { status } = confirmBulkUpdate;
    try {
      setUpdating(true);
      setConfirmBulkUpdate(null);
      const token = localStorage.getItem("adminToken");
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/orders/bulk-update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ orderIds: selectedOrders, status }),
      });
      if (!response.ok) {
        throw new Error("Bulk update failed");
      }
      // Update local state
      setOrders(prev => prev.map(o => selectedOrders.includes(o._id) ? { ...o, status: status as Order['status'] } : o));
      setFiltered(prev => prev.map(o => selectedOrders.includes(o._id) ? { ...o, status: status as Order['status'] } : o));
      setSelectedOrders([]);
      setError(null);
    } catch (e) {
      console.error("Bulk update failed", e);
      setError("Failed to update selected orders. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Order ID', 'Customer Name', 'Email', 'Items', 'Amount', 'Status', 'Date'],
      ...filtered.map(o => [
        o.orderId || o._id,
        o.customerName || o.user?.name || '',
        o.customerEmail || o.user?.email || '',
        o.items.map(i => `${i.product?.name || i.course?.title || 'Item'} x${i.quantity}`).join('; '),
        o.totalAmount,
        o.status,
        new Date(o.createdAt).toLocaleDateString()
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'orders.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4" aria-hidden="true"></div>
          <p className="text-gray-600">Loading orders…</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout user={user}>
      <div className="p-6 lg:p-8">
        {/* Breadcrumbs */}
        <nav className="mb-6" aria-label="Breadcrumb">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link href="/dashboard" className="hover:text-gray-700 transition-colors">
                Dashboard
              </Link>
            </li>
            <li>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </li>
            <li>
              <span className="text-gray-900 font-medium">Orders</span>
            </li>
          </ol>
        </nav>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-600 hover:text-red-800 transition-colors"
              aria-label="Dismiss error"
            >
              ✕
            </button>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-gray-900">Manage Orders</h1>
            <p className="text-gray-600 mt-2">Professional, accessible, and efficient order management.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm text-gray-500">Showing <span className="font-semibold text-gray-900">{filtered.length}</span> orders</p>
              <p className="text-sm text-gray-500">Total: <span className="font-semibold text-gray-900">PKR {totalRevenue.toLocaleString()}</span></p>
            </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by ID, customer name, or email…"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  aria-label="Search orders"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 text-sm" aria-hidden="true">⌕</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  aria-label="Filter by status"
                >
                  <option value="">All Statuses</option>
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  aria-label="Filter from date"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
                  aria-label="Filter to date"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedOrders.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <span className="text-sm text-blue-800 font-medium">
              {selectedOrders.length} order{selectedOrders.length > 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <select
                onChange={(e) => handleBulkUpdateStatus(e.target.value)}
                disabled={updating}
                className="text-sm border border-blue-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Bulk update status"
              >
                <option value="">Update Status</option>
                {STATUS_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <button
                onClick={handleExport}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                aria-label="Export selected orders"
              >
                Export
              </button>
            </div>
          </div>
        )}

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full" role="table" aria-label="Orders table">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === filtered.length && filtered.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      aria-label="Select all orders"
                      className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900">
                    <button
                      onClick={() => handleSort('createdAt')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                      aria-label={`Sort by date ${sortBy === 'createdAt' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
                    >
                      ID / Date
                      {sortBy === 'createdAt' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900">
                    <button
                      onClick={() => handleSort('customerName')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                      aria-label={`Sort by customer ${sortBy === 'customerName' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
                    >
                      Customer
                      {sortBy === 'customerName' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900">
                    <button
                      onClick={() => handleSort('totalAmount')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                      aria-label={`Sort by amount ${sortBy === 'totalAmount' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
                    >
                      Amount
                      {sortBy === 'totalAmount' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900">
                    <button
                      onClick={() => handleSort('status')}
                      className="flex items-center gap-1 hover:text-gray-700 transition-colors"
                      aria-label={`Sort by status ${sortBy === 'status' ? (sortOrder === 'asc' ? 'ascending' : 'descending') : ''}`}
                    >
                      Status
                      {sortBy === 'status' && (
                        <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </button>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors" role="row">
                    <td className="px-6 py-4 align-top" role="cell">
                      <input
                        type="checkbox"
                        checked={selectedOrders.includes(order._id)}
                        onChange={(e) => handleSelectOrder(order._id, e.target.checked)}
                        aria-label={`Select order ${order.orderId || order._id}`}
                        className="rounded border-gray-300 text-gray-900 focus:ring-gray-900"
                      />
                    </td>
                    <td className="px-6 py-4 align-top" role="cell">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm text-gray-600">{order.orderId || order._id?.slice(0, 8)}</span>
                        <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top" role="cell">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center" aria-hidden="true">
                          <span className="text-sm font-bold">
                            {(order.customerName || order.user?.name || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{order.customerName || order.user?.name || "N/A"}</p>
                          <p className="text-xs text-gray-500">{order.user?.email || order.customerEmail || "N/A"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top" role="cell">
                      <ul className="text-sm text-gray-900 space-y-2">
                        {(order.items || []).map((item, idx) => {
                          const imgPath = (item.product as any)?.images?.[0] || (item.product as any)?.image || (item.course as any)?.thumbnail;
                          const imgUrl = imgPath ? `${process.env.NEXT_PUBLIC_API_URL}/${imgPath.replace(/^\/+/, '')}` : null;
                          return (
                            <li key={idx} className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                {imgUrl && (
                                  <img src={imgUrl} alt={item.product?.name || item.course?.title || 'Item'} className="w-8 h-8 rounded object-cover border border-gray-200" loading="lazy" />
                                )}
                                <span className="truncate max-w-[200px]">{item.product?.name || item.course?.title || 'Item'}</span>
                              </div>
                              <span className="text-xs text-gray-500">x{item.quantity}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </td>
                    <td className="px-6 py-4 align-top" role="cell">
                      <span className="font-semibold text-gray-900">PKR {order.totalAmount?.toLocaleString() || 0}</span>
                    </td>
                    <td className="px-6 py-4 align-top" role="cell">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass(order.status)}`}>{order.status}</span>
                        <select
                          aria-label={`Update status for order ${order.orderId || order._id}`}
                          className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-900"
                          defaultValue={order.status}
                          onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                          disabled={updating}
                        >
                          {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top" role="cell">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50 transition-colors"
                          onClick={() => setSelected(order)}
                          aria-label={`View details for order ${order.orderId || order._id}`}
                        >
                          Details
                        </button>
                        <button
                          className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-colors"
                          onClick={() => {
                            setSelected(order);
                            handlePrintInvoice();
                          }}
                          aria-label={`Generate invoice for order ${order.orderId || order._id}`}
                        >
                          Invoice
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No orders found.</p>
          </div>
        )}

        {/* Details Drawer */}
        {selected && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-40">
            <div className="absolute inset-0 bg-black/30" onClick={() => setSelected(null)}></div>
            <div className="absolute right-0 top-0 bottom-0 w-full sm:w-[520px] bg-white shadow-xl p-6 overflow-y-auto">
              <div className="flex items-start justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
                <button className="text-gray-500 hover:text-gray-900" aria-label="Close details" onClick={() => setSelected(null)}>✕</button>
              </div>
              <div className="mt-4 space-y-6">
                {/* Customer */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-700">Customer</h3>
                  <div className="mt-2 text-sm text-gray-700">
                    <p className="font-medium">{selected.customerName || selected.user?.name}</p>
                    <p>{selected.customerEmail || selected.user?.email}</p>
                    {selected.customerPhone && <p>{selected.customerPhone}</p>}
                  </div>
                </section>
                {/* Shipping */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-700">Shipping Address</h3>
                  <p className="mt-2 text-sm text-gray-700">
                    {selected.shippingAddress ? (
                      <span>
                        {selected.shippingAddress.street}
                        {selected.shippingAddress.street2 ? ", " + selected.shippingAddress.street2 : ""},
                        {" "}{selected.shippingAddress.city}, {selected.shippingAddress.state}, {selected.shippingAddress.country} {selected.shippingAddress.zip}
                      </span>
                    ) : (
                      "—"
                    )}
                  </p>
                </section>
                {/* Items */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-700">Items</h3>
                  <ul className="mt-2 divide-y divide-gray-200 border border-gray-200 rounded-lg">
                    {(selected.items || []).map((item: any, idx: number) => {
                      const imgPath = item?.product?.images?.[0] || item?.product?.image || item?.course?.thumbnail;
                      const imgUrl = imgPath ? `${process.env.NEXT_PUBLIC_API_URL}/${String(imgPath).replace(/^\/+/, '')}` : null;
                      return (
                        <li key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            {imgUrl && (
                              <img src={imgUrl} alt={item.product?.name || item.course?.title || 'Item'} className="w-10 h-10 rounded object-cover border border-gray-200" />
                            )}
                            <span className="font-medium truncate">{item.product?.name || item.course?.title || 'Item'}</span>
                          </div>
                          <span className="text-gray-600">x{item.quantity}</span>
                          <span className="font-semibold">PKR {(item.price || 0).toLocaleString()}</span>
                        </li>
                      );
                    })}
                  </ul>
                  <div className="flex justify-between mt-3 text-sm">
                    <span className="text-gray-600">Total</span>
                    <span className="font-semibold">PKR {selected.totalAmount?.toLocaleString()}</span>
                  </div>
                </section>
                {/* Status */}
                <section>
                  <h3 className="text-sm font-semibold text-gray-700">Status</h3>
                  <div className="mt-2 flex items-center gap-2">
                    <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass(selected.status)}`}>{selected.status}</span>
                    <select
                      aria-label="Update order status"
                      className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-900"
                      defaultValue={selected.status}
                      onChange={(e) => handleUpdateStatus(selected._id, e.target.value)}
                      disabled={updating}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </section>
                {/* Actions */}
                <section className="flex items-center gap-3">
                  <button
                    className="px-4 py-2 rounded-md bg-gray-900 text-white hover:bg-gray-800"
                    onClick={handlePrintInvoice}
                    aria-label="Print invoice"
                  >
                    Print Invoice
                  </button>
                  <button
                    className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50"
                    onClick={() => setSelected(null)}
                  >
                    Close
                  </button>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Dialog */}
        {confirmBulkUpdate && (
          <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={() => setConfirmBulkUpdate(null)}></div>
            <div className="relative bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Confirm Bulk Update</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to update the status of {confirmBulkUpdate.count} order{confirmBulkUpdate.count > 1 ? 's' : ''} to {`"${STATUS_OPTIONS.find(opt => opt.value === confirmBulkUpdate.status)?.label}"`}?
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setConfirmBulkUpdate(null)}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmBulkUpdateStatus}
                  disabled={updating}
                  className="px-4 py-2 text-sm bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Printable Invoice */}
        <div ref={printRef} className="hidden print:block print-area">
          {selected && (
            <div className="p-8 text-black">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-serif font-bold">Invoice</h1>
                  <p className="text-sm">Order: {selected.orderId || selected._id}</p>
                  <p className="text-sm">Date: {new Date(selected.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <h2 className="text-xl font-bold">Your Company</h2>
                  <p className="text-sm">www.example.com</p>
                  <p className="text-sm">info@example.com</p>
                </div>
              </div>
              <hr className="my-4" />
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold">Bill To</h3>
                  <p>{selected.customerName || selected.user?.name}</p>
                  <p>{selected.customerEmail || selected.user?.email}</p>
                  {selected.customerPhone && <p>{selected.customerPhone}</p>}
                  {selected.shippingAddress && (
                    <p className="mt-1">
                      {selected.shippingAddress.street}
                      {selected.shippingAddress.street2 ? ", " + selected.shippingAddress.street2 : ""}, {selected.shippingAddress.city}, {selected.shippingAddress.state}, {selected.shippingAddress.country} {selected.shippingAddress.zip}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p><span className="font-semibold">Payment:</span> {selected.paymentMethodLabel || selected.paymentMethod || "—"}</p>
                  {selected.shippingMethod && <p><span className="font-semibold">Shipping:</span> {selected.shippingMethod}</p>}
                  <p><span className="font-semibold">Status:</span> {selected.status}</p>
                </div>
              </div>
              <div className="mt-6">
                <table className="w-full">
                  <thead>
                    <tr>
                      <th className="text-left text-sm">Item</th>
                      <th className="text-right text-sm">Qty</th>
                      <th className="text-right text-sm">Price</th>
                      <th className="text-right text-sm">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selected.items || []).map((item: any, idx: number) => (
                      <tr key={idx}>
                        <td className="py-2 text-sm">{item.product?.name || item.course?.title || "Item"}</td>
                        <td className="py-2 text-sm text-right">{item.quantity}</td>
                        <td className="py-2 text-sm text-right">PKR {(item.price || 0).toLocaleString()}</td>
                        <td className="py-2 text-sm text-right">PKR {((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>PKR {selected.totalAmount?.toLocaleString()}</span>
                    </div>
                    {/* Taxes/Discounts placeholders */}
                    <div className="flex justify-between text-sm">
                      <span>Tax (0%)</span>
                      <span>PKR 0</span>
                    </div>
                    <div className="flex justify-between text-sm font-semibold mt-2">
                      <span>Total</span>
                      <span>PKR {selected.totalAmount?.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
              <hr className="my-6" />
              <p className="text-xs">Thank you for your business.</p>
            </div>
          )}
        </div>

        {/* Print Styles */}
        <style>{`
          @media print {
            body * { visibility: hidden; }

            /* Ensure the invoice is both visible AND rendered (not display:none). */
            .print-area, .print-area * { visibility: visible; }
            .print-area { 
              display: block !important;
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
