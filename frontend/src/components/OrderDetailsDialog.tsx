import React from 'react';
import { Package } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

const getOrderStatusColor = (status : any) => {
  const colors : any = {
    'PENDING': 'bg-yellow-100 text-yellow-800',
    'CONFIRMED': 'bg-blue-100 text-blue-800',
    'PROCESSING': 'bg-purple-100 text-purple-800',
    'SHIPPED': 'bg-indigo-100 text-indigo-800',
    'DELIVERED': 'bg-green-100 text-green-800',
    'CANCELLED': 'bg-red-100 text-red-800',
    'RETURNED': 'bg-orange-100 text-orange-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export default function OrderDetailsDialog({ order, isOpen, onClose } : any) {
  if (!order) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-300 w-[95vw] sm:w-full">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl font-semibold">Order Details</DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            Order #{order.orderNumber}
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-4 space-y-4 sm:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 pb-4 border-b">
            <div>
              <p className="text-xs sm:text-sm text-gray-600">Order Date</p>
              <p className="text-sm sm:text-base font-medium">
                {new Date(order.createdAt).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <Badge className={`${getOrderStatusColor(order.status)} px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm self-start sm:self-auto`}>
              {order.status}
            </Badge>
          </div>

          <div>
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Order Items</h3>
            <div className="space-y-3 sm:space-y-4">
              {order.items?.map((item : any) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <div className="w-full sm:w-24 h-32 sm:h-24 bg-white rounded-lg overflow-hidden flex-shrink-0">
                    {item.product?.primaryImage1 ? (
                      <img 
                        src={item.product.primaryImage1} 
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm sm:text-base font-semibold text-gray-900 mb-1">
                      {item.product?.name || 'Product'}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.product?.shortDescription}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm">
                      <span className="text-gray-600">Qty: {item.quantity}</span>
                      <span className="text-gray-600">Price: ₹{item.price}</span>
                      {item.discount > 0 && (
                        <span className="text-green-600">Discount: -₹{item.discount}</span>
                      )}
                      <span className="font-semibold text-gray-900">Total: ₹{item.finalPrice}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Price Breakdown</h3>
            <div className="space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900">₹{order.subtotal}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-₹{order.discountAmount}</span>
                </div>
              )}
              {order.shippingCharge > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="text-gray-900">₹{order.shippingCharge}</span>
                </div>
              )}
              {order.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="text-gray-900">₹{order.taxAmount}</span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex justify-between text-base sm:text-lg font-bold">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-gray-900">₹{order.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
              <span className="text-xs sm:text-sm text-gray-600">Payment Status</span>
              <Badge className={order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}>
                {order.paymentStatus}
              </Badge>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}