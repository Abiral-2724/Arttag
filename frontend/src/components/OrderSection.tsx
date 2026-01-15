'use client'
import React, { useState } from 'react';
import { Package, Eye, X, CheckCircle, Clock, Truck, MapPin, XCircle, Calendar, CreditCard, ShoppingBag, AlertCircle, RotateCcw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ORDER_STATUS_TABS = [
  { id: 'ALL', label: 'All Orders', icon: ShoppingBag },
  { id: 'DELIVERED', label: 'Delivered', icon: CheckCircle },
];

const getOrderStatusConfig = (status) => {
  const configs = {
    'CREATED': { 
      color: 'bg-blue-500/10 text-blue-700 border-blue-200',
      icon: Clock,
      gradient: 'from-blue-500/20 to-blue-500/5'
    },
    'CONFIRMED': { 
      color: 'bg-emerald-500/10 text-emerald-700 border-emerald-200',
      icon: CheckCircle,
      gradient: 'from-emerald-500/20 to-emerald-500/5'
    },
    'SHIPPED': { 
      color: 'bg-purple-500/10 text-purple-700 border-purple-200',
      icon: Truck,
      gradient: 'from-purple-500/20 to-purple-500/5'
    },
    'DELIVERED': { 
      color: 'bg-green-500/10 text-green-700 border-green-200',
      icon: CheckCircle,
      gradient: 'from-green-500/20 to-green-500/5'
    },
    'CANCELLED': { 
      color: 'bg-red-500/10 text-red-700 border-red-200',
      icon: XCircle,
      gradient: 'from-red-500/20 to-red-500/5'
    },
  };
  return configs[status] || { 
    color: 'bg-gray-500/10 text-gray-700 border-gray-200',
    icon: Package,
    gradient: 'from-gray-500/20 to-gray-500/5'
  };
};

const getReturnStatusBadge = (returnStatus) => {
  const configs = {
    'REQUESTED': { color: 'bg-yellow-500/10 text-yellow-700 border-yellow-200', label: 'Return Requested' },
    'REJECTED': { color: 'bg-red-500/10 text-red-700 border-red-200', label: 'Return Rejected' },
    'APPROVED': { color: 'bg-blue-500/10 text-blue-700 border-blue-200', label: 'Return Approved' },
    'PICKED': { color: 'bg-purple-500/10 text-purple-700 border-purple-200', label: 'Item Picked Up' },
    'REFUNDED': { color: 'bg-green-500/10 text-green-700 border-green-200', label: 'Refunded' },
  };
  return configs[returnStatus] || null;
};

const ReturnRequestDialog = ({ isOpen, onClose, product, orderId, userId, onSuccess, API_BASE_URL }) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      alert('Please provide a reason for return');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/return/request/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          productId: product.product.id,
          reason: reason.trim(),
          userId
        })
      });

      const data = await response.json();

      if (response.ok) {
        onSuccess('Return request submitted successfully');
        onClose();
        setReason('');
      } else {
        alert(data.error || 'Failed to submit return request');
      }
    } catch (error) {
      console.error('Return request error:', error);
      alert('Error submitting return request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[95vw] sm:w-full bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Request Return</DialogTitle>
        </DialogHeader>
        
        {product && (
          <div className="space-y-4">
            <div className="flex gap-3 p-3 bg-gray-50 rounded-lg border">
              <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border flex-shrink-0">
                {product.product?.primaryImage1 ? (
                  <img 
                    src={product.product.primaryImage1} 
                    alt={product.product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-8 h-8 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">
                  {product.product?.name}
                </h4>
                <p className="text-xs text-gray-600">Qty: {product.quantity} × ₹{product.price}</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Reason for Return *
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe why you want to return this product..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={4}
                disabled={isSubmitting}
              />
            </div>

            <Alert className="border-blue-200 bg-blue-50">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="ml-2 text-sm text-gray-700">
                Your return request will be reviewed by our team. You'll be notified once it's approved.
              </AlertDescription>
            </Alert>
          </div>
        )}

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 font-semibold"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Submitting...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-2" />
                Submit Request
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const OrderProductsDialog = ({ order, isOpen, onClose, userId, onSuccess, API_BASE_URL }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showReturnDialog, setShowReturnDialog] = useState(false);

  if (!order) return null;

  const handleReturnClick = (product) => {
    setSelectedProduct(product);
    setShowReturnDialog(true);
  };

  const handleReturnSuccess = (message) => {
    setShowReturnDialog(false);
    setSelectedProduct(null);
    onClose();
    onSuccess(message);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full bg-white">
          <DialogHeader className="bg-white sticky top-0 z-10 pb-4">
            <DialogTitle className="text-xl sm:text-2xl font-bold">Order Products</DialogTitle>
            <p className="text-sm text-gray-500 mt-1">Order #{order.id.slice(0, 12)}...</p>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {order.items?.map((item) => {
              const returnStatusConfig = getReturnStatusBadge(item.returnStatus);
              const canReturn = item.isReturnable && !item.returnStatus;
              
              return (
                <div key={item.id} className="group p-5 bg-white rounded-xl border hover:border-gray-300 transition-all hover:shadow-md">
                  <div className="flex gap-4 mb-4">
                    <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border group-hover:border-gray-200 transition-all">
                      {item.product?.primaryImage1 ? (
                        <img 
                          src={item.product.primaryImage1} 
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <Package className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 mb-2 text-base">
                        {item.product?.name || 'Product'}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 text-sm mb-3">
                        <div className="px-3 py-1 bg-gray-50 rounded-full border">
                          <span className="text-gray-700 font-medium">Qty: {item.quantity}</span>
                        </div>
                        <div className="px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                          <span className="text-blue-700 font-medium">₹{item.price}</span>
                        </div>
                        <div className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                          <span className="text-emerald-700 font-bold">Total: ₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                      
                      {returnStatusConfig && (
                        <Badge className={`${returnStatusConfig.color} px-3 py-1 text-xs font-semibold border mb-3`}>
                          {returnStatusConfig.label}
                        </Badge>
                      )}
                      
                      {!item.isReturnable && !returnStatusConfig && (
                        <p className="text-xs text-gray-500 mb-3">This product is not eligible for return</p>
                      )}
                    </div>
                  </div>
                  
                  {canReturn && (
                    <Button
                      onClick={() => handleReturnClick(item)}
                      variant="outline"
                      className="w-full border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 font-semibold"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Request Return
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      <ReturnRequestDialog
        isOpen={showReturnDialog}
        onClose={() => {
          setShowReturnDialog(false);
          setSelectedProduct(null);
        }}
        product={selectedProduct}
        orderId={order.id}
        userId={userId}
        onSuccess={handleReturnSuccess}
        API_BASE_URL={API_BASE_URL}
      />
    </>
  );
};

const OrderStatusTracker = ({ status, deliveryDate }) => {
  const statuses = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED'];
  const currentIndex = statuses.indexOf(status);
  const isCancelled = status === 'CANCELLED';

  const getStatusIcon = (statusName, index) => {
    if (isCancelled) {
      return <XCircle className="w-7 h-7 text-red-500" />;
    }
    if (index < currentIndex) {
      return <CheckCircle className="w-7 h-7 text-emerald-500" />;
    }
    if (index === currentIndex) {
      if (statusName === 'DELIVERED') {
        return <CheckCircle className="w-7 h-7 text-emerald-500" />;
      }
      return (
        <div className="relative">
          <Clock className="w-7 h-7 text-blue-600" />
          <div className="absolute inset-0 animate-ping">
            <Clock className="w-7 h-7 text-blue-400 opacity-75" />
          </div>
        </div>
      );
    }
    return <div className="w-7 h-7 rounded-full border-3 border-gray-300 bg-white shadow-sm" />;
  };

  if (isCancelled) {
    return (
      <div className="py-6">
        <div className="flex items-center justify-center gap-4 p-6 bg-red-50 rounded-xl border border-red-200">
          <div className="p-3 bg-white rounded-full shadow-sm">
            <XCircle className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <p className="font-bold text-red-900 text-lg">Order Cancelled</p>
            <p className="text-sm text-red-700">This order has been cancelled</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="relative px-4">
        <div className="absolute top-3.5 left-8 right-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out rounded-full shadow-sm"
            style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
          />
        </div>

        <div className="relative flex justify-between">
          {statuses.map((statusName, index) => (
            <div key={statusName} className="flex flex-col items-center">
              <div className={`bg-white p-2 rounded-full shadow-md transition-all duration-300 ${
                index <= currentIndex ? 'scale-110' : 'scale-100'
              }`}>
                {getStatusIcon(statusName, index)}
              </div>
              <p className={`mt-3 text-xs sm:text-sm font-semibold transition-colors ${
                index <= currentIndex ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {statusName}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 p-5 bg-blue-50 rounded-xl border border-blue-100 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-white rounded-lg shadow-sm">
            <Truck className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-gray-900">
              {status === 'DELIVERED' ? 'Delivered on' : 'Expected Delivery'}
            </p>
            <p className="text-base font-semibold text-blue-700 mt-0.5">
              {deliveryDate 
                ? new Date(deliveryDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })
                : 'Delivery date will be updated soon'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const CancelConfirmationDialog = ({ isOpen, onClose, onConfirm, isCOD, isProcessing }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[100vw] sm:w-full bg-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-900">Confirm Order Cancellation</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Alert className="border-yellow-200 bg-yellow-50">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <AlertDescription className="ml-2">
              <p className="font-semibold text-gray-900 mb-2">Are you sure you want to cancel this order?</p>
              {isCOD ? (
                <p className="text-sm text-gray-600">
                  This COD order will be cancelled and removed immediately from your order list.
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  A refund request will be created and processed by our admin team within 5-7 business days. The order will remain visible with CANCELLED status.
                </p>
              )}
            </AlertDescription>
          </Alert>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 font-semibold"
          >
            Keep Order
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isProcessing}
            className="flex-1 bg-red-600 hover:bg-red-700 font-semibold"
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                Processing...
              </>
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" />
                Yes, Cancel Order
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const OrderDetailsDialog = ({ order, isOpen, onClose, onCancelRequest }) => {
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  if (!order) return null;

  const canCancel = order.orderStatus === 'CREATED' || order.orderStatus === 'CONFIRMED';
  const statusConfig = getOrderStatusConfig(order.orderStatus);
  const isCOD = order.paymentMethod === 'COD';
  
  const handleCancelClick = () => {
    setShowCancelConfirm(true);
  };
  
  const handleConfirmCancel = async () => {
    setIsProcessing(true);
    await onCancelRequest(order.id, order.paymentMethod);
    setIsProcessing(false);
    setShowCancelConfirm(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto w-[95vw] sm:w-full bg-white">
          <DialogHeader className="bg-white sticky top-0 z-10 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold">Order Details</DialogTitle>
                <p className="text-sm text-gray-500 mt-1">Order #{order.id.slice(0, 12)}...</p>
              </div>
              <Badge className={`${statusConfig.color} px-4 py-1.5 text-sm font-semibold border`}>
                {order.orderStatus}
              </Badge>
            </div>
          </DialogHeader>
          
          <div className="mt-6 space-y-6">
            <div className="border rounded-2xl p-6 bg-white shadow-sm">
              <h3 className="text-lg font-bold mb-2 text-gray-900">Order Status</h3>
              <OrderStatusTracker status={order.orderStatus} deliveryDate={order.deliveryDate} />
            </div>

            <div className="flex items-center gap-4 p-5 bg-white rounded-xl border shadow-sm">
              <div className="p-3 bg-gray-50 rounded-lg">
                <Calendar className="w-6 h-6 text-gray-700" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Order Date</p>
                <p className="text-base font-bold text-gray-900 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Order Items
              </h3>
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div key={item.id} className="group flex gap-4 p-5 bg-white rounded-xl border hover:border-gray-300 transition-all hover:shadow-md">
                    <div className="w-24 h-24 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 shadow-sm border group-hover:border-gray-200 transition-all">
                      {item.product?.primaryImage1 ? (
                        <img 
                          src={item.product.primaryImage1} 
                          alt={item.product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50">
                          <Package className="w-10 h-10 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 mb-2 text-base">
                        {item.product?.name || 'Product'}
                      </h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm">
                        <div className="px-3 py-1 bg-gray-50 rounded-full border">
                          <span className="text-gray-700 font-medium">Qty: {item.quantity}</span>
                        </div>
                        <div className="px-3 py-1 bg-blue-50 rounded-full border border-blue-100">
                          <span className="text-blue-700 font-medium">₹{item.price}</span>
                        </div>
                        <div className="px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                          <span className="text-emerald-700 font-bold">Total: ₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 bg-white rounded-2xl border shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Price Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-base">
                  <span className="text-gray-600 font-medium">Subtotal</span>
                  <span className="text-gray-900 font-semibold">₹{order.totalAmount}</span>
                </div>
                <Separator className="my-3" />
                <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-lg font-bold text-gray-900">Grand Total</span>
                  <span className="text-2xl font-bold text-emerald-700">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-5 bg-white rounded-xl border shadow-sm">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="text-sm font-medium text-gray-600">Payment Method</span>
                </div>
                <p className="font-bold text-gray-900 text-lg ml-11">{order.paymentMethod}</p>
              </div>
              <div className="p-5 bg-white rounded-xl border shadow-sm">
                <span className="text-sm font-medium text-gray-600 block mb-3">Payment Status</span>
                <Badge className={`${
                  order.paymentStatus === 'PENDING' 
                    ? 'bg-yellow-500/10 text-yellow-700 border-yellow-200' 
                    : 'bg-green-500/10 text-green-700 border-green-200'
                } px-4 py-1.5 text-sm font-bold border-2`}>
                  {order.paymentStatus}
                </Badge>
              </div>
            </div>

            {canCancel && (
              <div className="pt-4">
                <Button
                  variant="destructive"
                  onClick={handleCancelClick}
                  className="w-full py-6 text-white bg-red-600 hover:bg-red-700 font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <XCircle className="w-5 h-5 mr-2" />
                  Request Order Cancellation
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <CancelConfirmationDialog
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleConfirmCancel}
        isCOD={isCOD}
        isProcessing={isProcessing}
      />
    </>
  );
};

export default function OrderSection({ showAlert }) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedOrder, setSelectedOrder] : any = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const userId = typeof window !== 'undefined' ? localStorage.getItem("arttagUserId") : null;

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  React.useEffect(() => {
    fetchOrders();
  }, [userId]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/payment/get/all/user/${userId}/orders`);
      const data = await response.json();

      if (data.success) {
        setOrders(data.orders || []);
      } else {
        setError(data.message || 'Failed to fetch orders');
      }
    } catch (err) {
      console.error('Fetch orders error:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : orders.filter((order : any) => order.orderStatus === activeTab);

  const openOrderDetails = (order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const openOrderStatus = (order) => {
    setSelectedOrder(order);
    setIsStatusOpen(true);
  };

  const openOrderProducts = (order) => {
    setSelectedOrder(order);
    setIsProductsOpen(true);
  };

  const handleCancelRequest = async (orderId, paymentMethod) => {
    try {
      const response = await fetch(`${API_BASE_URL}/payment/cancel/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: userId,
          reason: 'Customer requested cancellation' 
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (paymentMethod === 'COD') {
          showAlert?.('COD order cancelled successfully', 'success');
        } else {
          showAlert?.('Cancellation request submitted. Refund will be processed by admin within 5-7 business days.', 'success');
        }
        setIsDetailsOpen(false);
        await fetchOrders();
      } else {
        showAlert?.(data.message || 'Failed to cancel order', 'error');
      }
    } catch (error) {
      console.error('Cancel order error:', error);
      showAlert?.('Error cancelling order. Please try again.', 'error');
    }
  };

  const handleReturnSuccess = (message) => {
    showAlert?.(message, 'success');
    fetchOrders();
  };

  return (
    <CardContent className="p-4 sm:p-6 lg:p-8">
      <div>
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">My Orders</h2>
          <p className="text-gray-600">Track and manage your orders</p>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-gray-900"></div>
              <Package className="absolute inset-0 m-auto w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 mt-6 font-medium">Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <div className="inline-flex p-6 bg-red-50 rounded-full mb-4">
              <XCircle className="w-16 h-16 text-red-400" />
            </div>
            <p className="text-red-600 mb-4 font-semibold text-lg">{error}</p>
            <Button onClick={fetchOrders} variant="outline" size="lg" className="font-semibold">
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6 sm:mb-8 bg-gray-50 rounded-2xl p-2 border-2">
              <div className="flex gap-2 overflow-x-auto">
                {ORDER_STATUS_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const count = tab.id === 'ALL' 
                    ? orders.length 
                    : orders.filter((o : any) => o.orderStatus === tab.id).length;
                  
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 sm:px-6 py-3 text-sm font-bold rounded-xl transition-all whitespace-nowrap ${
                        activeTab === tab.id
                          ? 'bg-white text-gray-900 shadow-md scale-105'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      <span className={`ml-1 text-xs px-2.5 py-0.5 rounded-full font-bold ${
                        activeTab === tab.id
                          ? 'bg-gray-900 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-20">
                <div className="inline-flex p-8 bg-gray-50 rounded-full mb-6">
                  <Package className="w-20 h-20 text-gray-300" />
                </div>
                <p className="text-xl font-bold text-gray-900 mb-2">No orders found</p>
                <p className="text-gray-500">
                  {activeTab === 'ALL' 
                    ? 'Start shopping to see your orders here' 
                    : `No ${activeTab.toLowerCase()} orders`}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order : any) => {
                  const statusConfig = getOrderStatusConfig(order.orderStatus);
                  const StatusIcon = statusConfig.icon;
                  const isDelivered = order.orderStatus === 'DELIVERED';
                  
                  return (
                    <Card key={order.id} className="border-1 hover:border-gray-300 transition-all hover:shadow-xl group overflow-hidden">
                      <div className={`h-1.5 bg-gradient-to-r ${statusConfig.gradient}`} />
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-5">
                          <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-xl bg-gradient-to-br ${statusConfig.gradient} shadow-sm`}>
                              <StatusIcon className="w-6 h-6 text-gray-700" />
                            </div>
                            <div>
                              <p className="font-bold text-base text-gray-900">Order #{order.id.slice(0, 12)}...</p>
                              <div className="flex items-center gap-2 mt-2 text-sm text-gray-600">
                                <Calendar className="w-4 h-4" />
                                {new Date(order.createdAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </div>
                              {order.deliveryDate && (
                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                  <Truck className="w-3.5 h-3.5" />
                                  Delivery: {new Date(order.deliveryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge className={`${statusConfig.color} px-4 py-1.5 text-sm font-bold border-2 shadow-sm`}>
                            {order.orderStatus}
                          </Badge>
                        </div>

                        <Separator className="my-1" />

                        <div className="grid grid-cols-2 gap-4 mb-1">
                          <div className="p-4 bg-gray-50 rounded-xl">
                            <p className="text-xs text-gray-600 font-medium mb-1">Items</p>
                            <p className="text-lg font-bold text-gray-900">
                              {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-xl">
                            <p className="text-xs text-gray-600 font-medium mb-1">Payment</p>
                            <p className="text-base font-bold text-blue-700">{order.paymentMethod}</p>
                          </div>
                        </div>

                        <div className="p-5 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border-2 border-emerald-100 mb-5">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-bold text-gray-700">Total Amount</span>
                            <span className="text-2xl font-bold text-emerald-700">₹{order.totalAmount}</span>
                          </div>
                        </div>

                        <div className={`grid grid-cols-1 ${isDelivered ? 'sm:grid-cols-3' : 'sm:grid-cols-2'} gap-3`}>
                          <Button
                            variant="outline"
                            size="lg"
                            onClick={() => openOrderStatus(order)}
                            className="font-bold border-1 hover:border-gray-400 hover:shadow-md transition-all"
                          >
                            <MapPin className="w-4 h-4 mr-2" />
                            Track Order
                          </Button>
                          <Button
                            variant="default"
                            size="lg"
                            onClick={() => openOrderDetails(order)}
                            className="font-bold shadow-md hover:shadow-lg transition-all bg-gray-900 hover:bg-gray-800 text-white"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                          {isDelivered && (
                            <Button
                              variant="outline"
                              size="lg"
                              onClick={() => openOrderProducts(order)}
                              className="font-bold border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300"
                            >
                              <Package className="w-4 h-4 mr-2" />
                              View Products
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}

        <OrderDetailsDialog
          order={selectedOrder}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onCancelRequest={handleCancelRequest}
        />

        <OrderProductsDialog
          order={selectedOrder}
          isOpen={isProductsOpen}
          onClose={() => setIsProductsOpen(false)}
          userId={userId}
          onSuccess={handleReturnSuccess}
          API_BASE_URL={API_BASE_URL}
        />

        <Dialog open={isStatusOpen} onOpenChange={setIsStatusOpen}>
          <DialogContent className="max-w-2xl w-[95vw] sm:w-full bg-white">
            <DialogHeader className="bg-white">
              <DialogTitle className="text-2xl font-bold">Track Your Order</DialogTitle>
              <p className="text-sm text-gray-600 mt-1">Order #{selectedOrder?.id.slice(0, 12)}...</p>
            </DialogHeader>
            {selectedOrder && (
              <OrderStatusTracker 
                status={selectedOrder.orderStatus} 
                deliveryDate={selectedOrder.deliveryDate}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </CardContent>
  );
}