'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Package, Eye, RefreshCw, Loader2, CheckCircle, XCircle, Clock, Truck, PackageCheck, AlertCircle, Search, Filter } from 'lucide-react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import Navbar from '@/components/Navbar';
import FooterPart from '@/components/FooterPart';
import Link from 'next/link';

const OrderManagement = () => {
  const userId = localStorage.getItem("arttagUserId")
  const router = useRouter();
  
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isChecking, setIsChecking] = useState(true);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const storedUserId = localStorage.getItem("arttagUserId");
        const storedToken = localStorage.getItem("arttagtoken");

        if (!storedUserId || !storedToken || storedUserId !== userId) {
          router.replace("/login");
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/user/${userId}/get/profile`);

        if (!response.data.success || response.data.user.role !== "ADMIN") {
          router.replace("/login");
          return;
        }
      } catch (error) {
        console.error("Error verifying user:", error);
        router.replace("/login");
      } finally {
        setIsChecking(false);
      }
    };

    if (userId) checkAccess();
  }, [userId, router]);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, statusFilter, searchQuery]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/payment/get/all/orders`);

      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      showAlert('error', 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((order : any) => order.orderStatus === statusFilter);
    }

    // Filter by search query (order number or customer name/email)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((order : any) => 
        order.id.toLowerCase().includes(query) ||
        (order.orderNumber && order.orderNumber.toLowerCase().includes(query)) ||
        (order.user?.name && order.user.name.toLowerCase().includes(query)) ||
        (order.user?.email && order.user.email.toLowerCase().includes(query))
      );
    }

    setFilteredOrders(filtered);
  };

  const updateOrderStatus : any = async (orderId, newStatus, deliveryDate = null) => {
    try {
      setUpdating(true);
      const payload : any = { newStatus };
      
      if (deliveryDate) {
        payload.deliveryDate = deliveryDate;
      }

      const response = await axios.patch(
        `${API_BASE_URL}/payment/update/order/status/${orderId}`,
        payload
      );

      if (response.data.success) {
        showAlert('success', 'Order status updated successfully');
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (error : any) {
      showAlert('error', error.response?.data?.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const showAlert = (type, message) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  const getStatusColor = (status) => {
    const colors = {
      CREATED: 'bg-gray-500',
      CONFIRMED: 'bg-blue-500',
      SHIPPED: 'bg-indigo-500',
      DELIVERED: 'bg-green-500',
      CANCELLED: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusIcon = (status) => {
    const icons = {
      CREATED: Clock,
      CONFIRMED: CheckCircle,
      SHIPPED: Truck,
      DELIVERED: PackageCheck,
      CANCELLED: XCircle
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleViewproduct = () => {
    router.push(`/${userId}/admin/product`);
  };

  const handleviewCategory = () => {
    router.push(`/${userId}/admin/category`);
  };

  const OrderDetailsDialog = ({ order, onClose }) => {
    const [newStatus, setNewStatus] = useState(order.orderStatus);
    const [deliveryDate, setDeliveryDate] = useState('');

    const handleUpdate = async () => {
      await updateOrderStatus(order.id, newStatus, deliveryDate || null);
      onClose();
    };

    return (
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-amber-50 w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-bold">Order Details</DialogTitle>
          <DialogDescription className="text-sm">Order #{order.orderNumber}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 mt-4">
          {/* Customer Info Card */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border">
            <h3 className="font-semibold text-sm mb-3">Customer Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <div>
                <p className="text-xs text-gray-500">Name</p>
                <p className="font-medium text-sm break-words">{order.user?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-sm break-all">{order.user?.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Phone</p>
                <p className="font-medium text-sm">{order.user?.phoneNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Order Date</p>
                <p className="font-medium text-sm">{formatDate(order.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          {order.shippingAddress && (
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border">
              <h3 className="font-semibold text-sm mb-3">Shipping Address</h3>
              <p className="text-sm">{order.shippingAddress.street}</p>
              <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}</p>
              <p className="text-sm">{order.shippingAddress.country}</p>
            </div>
          )}

          {/* Payment Information */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border">
            <h3 className="font-semibold text-sm mb-3">Payment Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-gray-500">Payment Method</p>
                <p className="font-medium text-sm">{order.paymentMethod}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Status</p>
                <Badge className="mt-1 text-xs">{order.payment?.status || 'PENDING'}</Badge>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Order Items ({order.items.length})</h3>

            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="border rounded-lg p-3 bg-white">
                  <div className="flex gap-3 mb-3">
                    <img
                      src={item.product.primaryImage1 || 'https://via.placeholder.com/48'}
                      alt={item.product.name}
                      className="w-16 h-16 rounded object-cover border flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm break-words">{item.product.name}</p>
                      <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Price</p>
                      <p className="font-medium">{formatCurrency(item.price)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-600">Product</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">Price</th>
                    <th className="text-center py-3 px-4 text-xs font-semibold text-gray-600">Qty</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={item.id} className={idx !== order.items.length - 1 ? 'border-b' : ''}>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.primaryImage1 || 'https://via.placeholder.com/48'}
                            alt={item.product.name}
                            className="w-12 h-12 rounded object-cover border"
                          />
                          <span className="font-medium text-sm">{item.product.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-3 px-4 text-sm">{formatCurrency(item.price)}</td>
                      <td className="text-center py-3 px-4 text-sm font-medium">{item.quantity}</td>
                      <td className="text-right py-3 px-4 font-semibold text-sm">
                        {formatCurrency(item.price * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-gray-50 rounded-lg p-3 sm:p-4 border">
            <h3 className="font-semibold text-sm mb-3">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>{formatCurrency(order.shippingCharge || 0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>{formatCurrency(order.taxAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-blue-600">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Information */}
          {order.deliveryDate && (
            <div className="bg-green-50 rounded-lg p-3 sm:p-4 border border-green-200">
              <h3 className="font-semibold text-sm mb-2 text-green-800">Delivery Information</h3>
              <p className="text-sm text-green-700">Delivered on: {formatDate(order.deliveryDate)}</p>
            </div>
          )}

          {/* Update Status */}
          <div className="border rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-sm mb-3">Update Order Status</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-white border-1'>
                    <SelectItem value="CREATED">Created</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {newStatus === 'DELIVERED' && (
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Delivery Date (Optional)</label>
                  <Input 
                    type="datetime-local" 
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to use current date/time</p>
                </div>
              )}

              <Button
                onClick={handleUpdate}
                disabled={updating || newStatus === order.orderStatus}
                className='bg-blue-600 text-white w-full'
              >
                {updating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Updating
                  </>
                ) : (
                  'Update Status'
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    );
  };

  if (loading && isChecking) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-2 text-lg font-medium px-4">
        <Link href={'/'}>
          <div className="flex items-center gap-2">
            <div className="w-auto h-14">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 270 54" className="h-full w-auto">
                <defs>
                  <style>
                    {`.st0 { font-family: MuktaMahee-Regular, 'Mukta Mahee'; font-size: 49.69px; }`}
                  </style>
                </defs>
                <g>
                  <path d="M62.85,33.21c.11,0,.17.04.19.21.2,1.7-.04,4.05-.01,5.84,0,.44.01.95-.3,1.15-.34.21-1.72-.06-2.18-.12-14.77-1.86-19.13-21.03-6.37-28.96,3.44-2.14,5.73-2.15,9.65-2.25.57-.01,1.26,0,1.76.06-2.15,2.88-1.5,7.52,2.16,8.77,1.53.52,2.98.08,4.52.4v21.62c0,.2-.1.41-.29.49h-6.67c-.08,0-.16-.03-.22-.09-.06-.06-.09-.14-.09-.22v-20.52c0-.35-.19-.72-.24-.86-1.18-3.54-5.67-2.47-7.9-.6-4.54,3.81-3.78,11.34,1.53,14.02.34.17,1.24.75,2.41.87l2.06.2Z" />
                  <path d="M68.98,16.48c-.15,0-.29-.02-.44-.05-1.63-.42-2.77-2.4-2.6-4.02.15-1.44,1.7-3.34,3.22-3.34h20.4c.15,0,.17.11.18.44v6.66c0,.08-.03.16-.09.22-.06.06-.14.09-.22.09h-20.45Z" />
                  <path d="M73.96,40.29v-21.62c0-.2.1-.41.29-.49h6.67c.08,0,.16.03.22.09.06.06.09.14.09.22v18.21c.03.76-.62,1.51-.8,1.75-1.53,2.1-4.13,2.17-6.49,1.83Z" />
                </g>
                <text className="st0" transform="translate(84.95 40.38)">
                  <tspan x="0" y="0">Arttag</tspan>
                </text>
              </svg>
            </div>
          </div>
        </Link>
        <Spinner className='text-blue-700 text-5xl'></Spinner>
        <p className="text-gray-600 text-sm text-center">Verifying request</p>
      </div>
    );
  }

  if (isChecking) {
    return (
      <div className="flex items-center justify-center h-screen text-lg font-semibold px-4 text-center">
        Checking access...
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Management</h1>
              <p className="text-gray-600 text-sm mt-1">Manage and track all your orders</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button className="flex items-center justify-center gap-2 bg-blue-600 text-white" onClick={handleViewproduct}>
                View Products
              </Button>
              <Button className="flex items-center justify-center gap-2 bg-blue-600 text-white" onClick={handleviewCategory}>
                View Categories
              </Button>
            </div>
          </div>

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by order number, customer name, email, or order ID..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-3">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className='bg-yellow-50'>
                      <SelectItem value="ALL">All Orders</SelectItem>
                      <SelectItem value="CREATED">Created</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="SHIPPED">Shipped</SelectItem>
                      <SelectItem value="DELIVERED">Delivered</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Refresh Button */}
                <Button onClick={fetchOrders} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Refresh
                </Button>
              </div>

              {/* Results Count */}
              <div className="mt-3 text-sm text-gray-600">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            </CardContent>
          </Card>

          {/* Alert */}
          {alert.show && (
            <Alert className={`mb-6 ${alert.type === 'success' ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
              <AlertCircle className={`h-4 w-4 ${alert.type === 'success' ? 'text-green-600' : 'text-red-600'}`} />
              <AlertDescription className={alert.type === 'success' ? 'text-green-800' : 'text-red-800'}>
                {alert.message}
              </AlertDescription>
            </Alert>
          )}

          {/* Orders Card */}
          <Card className="border-2">
            <CardHeader className="border-b bg-white">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                <div>
                  <CardTitle className="text-lg sm:text-xl">Orders</CardTitle>
                  <CardDescription className="mt-1 text-sm">View and manage order status</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                  <Spinner className='text-blue-700 text-5xl mb-4' />
                  <p className="text-gray-600 text-sm">Loading orders...</p>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 sm:py-16 px-4">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">No orders found</p>
                  <p className="text-gray-400 text-sm mt-1">
                    {searchQuery
                      ? 'Try adjusting your search query'
                      : statusFilter === 'ALL'
                      ? 'Orders will appear here once customers place them'
                      : `No ${statusFilter.toLowerCase()} orders found`}
                  </p>
                </div>
              ) : (
                <>
                  {/* Mobile Card View */}
                  <div className="block lg:hidden">
                    {filteredOrders.map((order : any, idx : any) => (
                      <div key={order.id} className={`p-4 ${idx !== filteredOrders.length - 1 ? 'border-b' : ''}`}>
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-mono text-sm font-semibold break-all">{order.orderNumber}</p>
                            <p className="font-medium text-sm mt-1 break-words">{order.user?.name}</p>
                            <p className="text-xs text-gray-500 break-all">{order.user?.email}</p>
                          </div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="gap-2 flex-shrink-0 ml-2">
                                <Eye className="w-4 h-4" />
                                View
                              </Button>
                            </DialogTrigger>
                            <OrderDetailsDialog order={order} onClose={() => {}} />
                          </Dialog>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Items</p>
                            <p className="font-medium">{order.items.length}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Total</p>
                            <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Status</p>
                            <div className="flex items-center gap-2 mt-1">
                              <div className={`w-2 h-2 rounded-full ${getStatusColor(order.orderStatus)}`} />
                              <span className="text-xs font-medium">{order.orderStatus}</span>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Date</p>
                            <p className="text-xs mt-1">{formatDate(order.createdAt)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop Table View */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-white border-b">
                        <tr>
                          <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700">Order Number</th>
                          <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700">Customer</th>
                          <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700">Items</th>
                          <th className="text-right py-4 px-6 text-xs font-semibold text-gray-700">Total</th>
                          <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700">Status</th>
                          <th className="text-left py-4 px-6 text-xs font-semibold text-gray-700">Date</th>
                          <th className="text-center py-4 px-6 text-xs font-semibold text-gray-700">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredOrders.map((order : any, idx : any) => (
                          <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${idx !== filteredOrders.length - 1 ? 'border-b' : ''}`}>
                            <td className="py-4 px-6">
                              <span className="font-mono text-sm font-semibold">{order.orderNumber || order.id.substring(0, 8)}</span>
                            </td>
                            <td className="py-4 px-6">
                              <div>
                                <p className="font-medium text-sm">{order.user?.name || 'Unknown'}</p>
                                <p className="text-xs text-gray-500">{order.user?.email || 'No email'}</p>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full border-2 border-gray-300 bg-white">
                                <span className="text-sm font-semibold">{order.items.length}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6 text-right">
                              <span className="font-bold text-sm">{formatCurrency(order.totalAmount)}</span>
                            </td>
                            <td className="py-4 px-6">
                              <div className="flex items-center justify-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${getStatusColor(order.orderStatus)}`} />
                                <span className="text-sm font-medium">{order.orderStatus}</span>
                              </div>
                            </td>
                            <td className="py-4 px-6">
                              <span className="text-sm text-gray-600">{formatDate(order.createdAt)}</span>
                            </td>
                            <td className="py-4 px-6 text-center">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-2">
                                    <Eye className="w-4 h-4" />
                                    View Details
                                  </Button>
                                </DialogTrigger>
                                <OrderDetailsDialog order={order} onClose={() => {}} />
                              </Dialog>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="border-t border-gray-300 my-0"></div>
      <FooterPart />
    </div>

)
}


export default OrderManagement;