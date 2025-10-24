'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Eye, RefreshCw, Loader2, CheckCircle, XCircle, Clock, Truck, PackageCheck, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import Navbar from '@/components/Navbar';
import FooterPart from '@/components/FooterPart';

const OrderManagement = () => {
    const { userId } = useParams();
 
    const router = useRouter() ; 
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [alert, setAlert] = useState({ show: false, type: '', message: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isChecking, setIsChecking] = useState(true);
 
  // Replace with your actual API base URL and user ID
  const API_BASE_URL = 'http://localhost:8000/api/v1';
  


  useEffect(() => {
    const checkAccess = async () => {
      try {
        const storedUserId = localStorage.getItem("arttagUserId");
        const storedToken = localStorage.getItem("arttagtoken");

        // 🔹 Instant redirect if no user or mismatch
        if (!storedUserId || !storedToken || storedUserId !== userId) {
          router.replace("/login");
          return;
        }

        // 🔹 Verify role via backend
        const response = await axios.get(`${API_BASE_URL}/user/${userId}/get/profile`);

        if (!response.data.success || response.data.user.role !== "ADMIN") {
          router.replace("/login");
          return;
        }

      } catch (error) {
        console.error("Error verifying user:", error);
        router.replace("/login");
      } finally {
        setIsChecking(false); // ✅ stop loading only when verification is done
      }
    };

    if (userId) checkAccess();
  }, [userId, router]);


  useEffect(() => {
    fetchOrders(statusFilter);
  }, [statusFilter]);

  const fetchOrders = async (status = 'ALL') => {
    try {
      setLoading(true);
      let url = `${API_BASE_URL}/order/get/all/order`;
      
      // Add status query parameter if not ALL
      if (status !== 'ALL') {
        url += `?status=${status}`;
      }
      
      const response = await axios.get(url);
      
      if (response.data.success) {
        setOrders(response.data.orders);
      }
    } catch (error) {
      showAlert('error', 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId : any, newStatus : any) => {
    try {
      setUpdating(true);
      const response = await axios.patch(`${API_BASE_URL}/order/update/order/status`, {
        orderId,
        newStatus,
        userId: userId
      });

      if (response.data.success) {
        showAlert('success', 'Order status updated successfully');
        fetchOrders(statusFilter);
        setSelectedOrder(null);
      }
    } catch (error) {
      showAlert('error', 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const showAlert = (type : any, message : any) => {
    setAlert({ show: true, type, message });
    setTimeout(() => setAlert({ show: false, type: '', message: '' }), 3000);
  };

  const getStatusColor = (status : any) => {
    const colors = {
      PENDING: 'bg-yellow-500',
      CONFIRMED: 'bg-blue-500',
      PROCESSING: 'bg-purple-500',
      SHIPPED: 'bg-indigo-500',
      DELIVERED: 'bg-green-500',
      CANCELLED: 'bg-red-500',
      RETURNED: 'bg-orange-500'
    };
    return colors[status]  || 'bg-gray-500';
  };

  const getStatusIcon = (status  : any) => {
    const icons = {
      PENDING: Clock,
      CONFIRMED: CheckCircle,
      PROCESSING: RefreshCw,
      SHIPPED: Truck,
      DELIVERED: PackageCheck,
      CANCELLED: XCircle,
      RETURNED: Package
    };
    const Icon = icons[status] || Clock;
    return <Icon className="w-4 h-4" />;
  };

  const formatCurrency = (amount  : any) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (date : any) => {
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

  const OrderDetailsDialog = ({ order, onClose }  : any) => {
    const [newStatus, setNewStatus] = useState(order.status);

    const handleUpdate = async () => {
      await updateOrderStatus(order.id, newStatus);
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
                <p className="font-medium text-sm break-words">{order.user.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-medium text-sm break-all">{order.user.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Order Date</p>
                <p className="font-medium text-sm">{formatDate(order.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Payment Status</p>
                <Badge className="mt-1 text-xs">{order.paymentStatus}</Badge>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="font-semibold text-sm mb-3">Order Items</h3>
            
            {/* Mobile Card View */}
            <div className="block lg:hidden space-y-3">
              {order.items.map((item  : any)  => (
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
                      <p className="text-xs text-gray-500">Discount</p>
                      <p className="font-medium text-green-600">{formatCurrency(item.discount * item.quantity)}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500">Total</p>
                      <p className="font-semibold">{formatCurrency(item.finalPrice * item.quantity)}</p>
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
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">Discount</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-gray-600">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item : any, idx : any) => (
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
                      <td className="text-right py-3 px-4 text-sm text-green-600">
                        {formatCurrency(item.discount * item.quantity)}
                      </td>
                      <td className="text-right py-3 px-4 font-semibold text-sm">
                        {formatCurrency(item.finalPrice * item.quantity)}
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
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600">-{formatCurrency(order.discountAmount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Shipping</span>
                <span>{formatCurrency(order.shippingCharge)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tax</span>
                <span>{formatCurrency(order.taxAmount)}</span>
              </div>
              <div className="flex justify-between text-base font-bold pt-2 border-t">
                <span>Total</span>
                <span className="text-blue-600">{formatCurrency(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Update Status */}
          <div className="border rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-sm mb-3">Update Order Status</h3>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
              <div className="flex-1">
                <label className="text-xs text-gray-600 mb-1 block">Status</label>
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-white border-1'>
                    <SelectItem value="PENDING">Pending</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                    <SelectItem value="PROCESSING">Processing</SelectItem>
                    <SelectItem value="SHIPPED">Shipped</SelectItem>
                    <SelectItem value="DELIVERED">Delivered</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    <SelectItem value="RETURNED">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                onClick={handleUpdate} 
                disabled={updating || newStatus === order.status} 
                className='bg-blue-600 text-white w-full sm:w-auto'
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

  if (loading) {
    return (
        <div>
 {
            isChecking ? (
                <div className="flex flex-col items-center justify-center h-screen gap-2 text-lg font-medium px-4">
            <Spinner className='text-blue-700 text-5xl'></Spinner>
            <p className="text-gray-600 text-sm text-center">Verifying request</p>
          </div> ) : (
             <div className="flex flex-col items-center justify-center gap-2 min-h-screen bg-gray-50 px-4">
            <Spinner className='text-blue-700 text-5xl'></Spinner>
             <p className="text-gray-600 text-sm text-center">Loading orders...</p>
           </div>
          )
        }
        </div>
       
     
    );
  }

  return (
    <div>
        {
             isChecking ? (
                <div className="flex items-center justify-center h-screen text-lg font-semibold px-4 text-center">
            Checking access...
          </div> ) : (
            <div>
                   <div>
                <Navbar></Navbar>
                <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order Management</h1>
                  <p className="text-gray-600 text-sm mt-1">Manage your e-commerce orders</p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <span className="text-sm font-medium text-gray-700">Filter by Status:</span>
                    <Select value={statusFilter} onValueChange={setStatusFilter} >
                      <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className='bg-yellow-50'>
                        <SelectItem value="ALL">All Orders</SelectItem>
                        <SelectItem value="PENDING">Pending</SelectItem>
                        <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                        <SelectItem value="PROCESSING">Processing</SelectItem>
                        <SelectItem value="SHIPPED">Shipped</SelectItem>
                        <SelectItem value="DELIVERED">Delivered</SelectItem>
                        <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        <SelectItem value="RETURNED">Returned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button className="flex items-center justify-center gap-2 bg-blue-600 text-white" 
                      onClick={handleViewproduct}
                    >
                        View product
                      </Button>
                    <Button className="flex items-center justify-center gap-2 bg-blue-600 text-white"
                     onClick={handleviewCategory}
                    >
                      View category
                    </Button>
                    <Button onClick={() => fetchOrders(statusFilter)} variant="outline" className="gap-2">
                      <RefreshCw className="w-4 h-4" />
                      Refresh
                    </Button>
                  </div>
                </div>
              </div>
      
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
                      <CardTitle className="text-lg sm:text-xl">All Orders</CardTitle>
                      <CardDescription className="mt-1 text-sm">View and manage all your orders</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {orders.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 px-4">
                      <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 font-medium">No orders found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        {statusFilter === 'ALL' 
                          ? 'Orders will appear here once customers place them'
                          : `No ${statusFilter.toLowerCase()} orders found`}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Mobile Card View */}
                      <div className="block lg:hidden">
                        {orders.map((order  : any, idx : any) => (
                          <div 
                            key={order.id} 
                            className={`p-4 ${idx !== orders.length - 1 ? 'border-b' : ''}`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1 min-w-0">
                                <p className="font-mono text-sm font-semibold break-all">{order.orderNumber}</p>
                                <p className="font-medium text-sm mt-1 break-words">{order.user.name}</p>
                                <p className="text-xs text-gray-500 break-all">{order.user.email}</p>
                              </div>
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button variant="outline" size="sm" className="gap-2 flex-shrink-0 ml-2">
                                    <Eye className="w-4 h-4" />
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
                                  <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                                  <span className="text-xs font-medium">{order.status}</span>
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
                            {orders.map((order  : any, idx  : any) => (
                              <tr 
                                key={order.id} 
                                className={`hover:bg-gray-50 transition-colors ${idx !== orders.length - 1 ? 'border-b' : ''}`}
                              >
                                <td className="py-4 px-6">
                                  <span className="font-mono text-sm font-semibold">{order.orderNumber}</span>
                                </td>
                                <td className="py-4 px-6">
                                  <div>
                                    <p className="font-medium text-sm">{order.user.name}</p>
                                    <p className="text-xs text-gray-500">{order.user.email}</p>
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
                                    <div className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`} />
                                    <span className="text-sm font-medium">{order.status}</span>
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
            </div>
                <div className="border-t border-gray-300 my-0"></div>
                <FooterPart></FooterPart>
            </div>
         
            
          )
        }
    </div>
    
  );
};

export default OrderManagement;