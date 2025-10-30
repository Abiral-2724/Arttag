import React, { useState } from 'react';
import { Package, Eye } from 'lucide-react';
import { CardContent, Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import OrderDetailsDialog from './OrderDetailsDialog';

const ORDER_STATUS_TABS = [
  { id: 'ALL', label: 'All Orders' },
  { id: 'DELIVERED', label: 'Delivered' },
];

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

export default function OrderSection({ orders, showAlert } : any) {
  const [activeTab, setActiveTab] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const filteredOrders = activeTab === 'ALL' 
    ? orders 
    : orders.filter(order  => order.status === activeTab);

  const openOrderDetails = (order : any) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  return (
    <CardContent className="p-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-6">My Orders</h2>
        
        <div className="mb-6 border-b border-gray-200 overflow-x-auto">
          <div className="flex gap-1 min-w-max">
            {ORDER_STATUS_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.label}
                {tab.id !== 'ALL' && (
                  <span className="ml-2 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                    {orders.filter(o => o.status === tab.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No orders found</p>
            <p className="text-sm text-gray-400 mt-2">
              {activeTab === 'ALL' 
                ? 'Start shopping to see your orders here' 
                : `No ${activeTab.toLowerCase()} orders`}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order : any) => (
              <Card key={order.id} className="border border-gray-200 hover:border-gray-300 transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold text-gray-900">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getOrderStatusColor(order.status)} px-3 py-1`}>
                        {order.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openOrderDetails(order)}
                        className="ml-2"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Button>
                    </div>
                  </div>
                  <Separator className="my-4" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {order.items?.length} item{order.items?.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Total Amount</span>
                      <span className="text-lg font-bold text-gray-900">₹{order.totalAmount || '0.00'}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <OrderDetailsDialog
          order={selectedOrder}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
        />
      </div>
    </CardContent>
  );
}