"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminLayout from "@/components/AdminLayout";

type Order = any;

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
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);
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
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthAndFetchOrders();
  }, [router]);

  // Filter
  useEffect(() => {
    if (!query) {
      setFiltered(orders);
      return;
    }
    const q = query.toLowerCase();
    setFiltered(
      orders.filter((o: Order) => {
        const id = (o.orderId || o._id)?.toString().toLowerCase();
        const name = (o.customerName || o.user?.name || "").toLowerCase();
        const email = (o.customerEmail || o.user?.email || "").toLowerCase();
        return (
          id?.includes(q) || name.includes(q) || email.includes(q)
        );
      })
    );
  }, [query, orders]);

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
      }
    } catch (e) {
      console.error("Status update failed", e);
    } finally {
      setUpdating(false);
    }
  };

  const handlePrintInvoice = () => {
    if (!printRef.current) return;
    // Open print dialog with dedicated stylesheet
    window.print();
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
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label className="relative flex-1" aria-label="Search orders">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by ID, customer name, or email…"
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-gray-900"
              />
              <span className="absolute right-3 top-2.5 text-gray-400 text-sm">⌕</span>
            </label>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900">Contact & Shipping</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900">Items</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold tracking-wider text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filtered.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-col">
                        <span className="font-mono text-sm text-gray-600">{order.orderId || order._id?.slice(0, 8)}</span>
                        <span className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleString()}</span>
                        <span className="text-xs text-gray-500">Payment: {order.paymentMethodLabel || order.paymentMethod || "—"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 bg-gray-900 text-white rounded-full flex items-center justify-center" aria-hidden="true">
                          <span className="text-sm font-bold">
                            {(order.customerName || order.user?.name || "U").charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{order.customerName || order.user?.name || "N/A"}</p>
                          <p className="text-xs text-gray-500">{order.user?.email || order.customerEmail || "N/A"}</p>
                          {order.customerPhone && (
                            <p className="text-xs text-gray-500">{order.customerPhone}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="text-sm text-gray-700">
                        {order.shippingAddress ? (
                          <p className="max-w-xs">{order.shippingAddress.street}{order.shippingAddress.street2 ? ", " + order.shippingAddress.street2 : ""}, {order.shippingAddress.city}, {order.shippingAddress.state}, {order.shippingAddress.country} {order.shippingAddress.zip}</p>
                        ) : (
                          <p>—</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <ul className="text-sm text-gray-900 space-y-1">
                        {(order.items || []).map((item: any, idx: number) => (
                          <li key={idx} className="flex justify-between gap-3">
                            <span className="truncate max-w-[220px]">{item.product?.name || item.course?.title || "Item"}</span>
                            <span className="text-xs text-gray-500">x{item.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <span className="font-semibold text-gray-900">PKR {order.totalAmount?.toLocaleString() || 0}</span>
                    </td>
                    <td className="px-6 py-4 align-top">
                      <div className="flex items-center gap-2">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusClass(order.status)}`}>{order.status}</span>
                        <select
                          aria-label="Update order status"
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
                    <td className="px-6 py-4 align-top">
                      <div className="flex flex-wrap gap-2">
                        <button
                          className="px-3 py-1.5 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                          onClick={() => setSelected(order)}
                          aria-label="View order details"
                        >
                          Details
                        </button>
                        <button
                          className="px-3 py-1.5 text-sm rounded-md bg-gray-900 text-white hover:bg-gray-800"
                          onClick={() => {
                            setSelected(order);
                            setTimeout(handlePrintInvoice, 100);
                          }}
                          aria-label="Generate invoice"
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
                    {(selected.items || []).map((item: any, idx: number) => (
                      <li key={idx} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="font-medium">{item.product?.name || item.course?.title || "Item"}</span>
                        <span className="text-gray-600">x{item.quantity}</span>
                        <span className="font-semibold">PKR {(item.price || 0).toLocaleString()}</span>
                      </li>
                    ))}
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

        {/* Printable Invoice */}
        <div ref={printRef} className="print:block hidden">
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
            .print\:block, .print\:block * { visibility: visible; }
            .print\:block { position: absolute; left: 0; top: 0; width: 100%; }
          }
        `}</style>
      </div>
    </AdminLayout>
  );
}
