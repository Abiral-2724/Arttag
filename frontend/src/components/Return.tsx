'use client'
import React, { useState, useMemo } from 'react';
import { Package, Clock, CheckCircle, XCircle, RefreshCw, ChevronDown, ChevronUp, Truck, PackageCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface ReturnItem {
  id: string;
  orderId: string;
  status: string;
  reason: string;
  amount: number;
  createdAt: string;
  order: {
    id: string;
    orderStatus: string;
    createdAt: string;
    updatedAt: string;
    items: Array<{
      id: string;
      quantity: number;
      price: number;
      product: {
        id: string;
        name: string;
        primaryImage1: string;
      };
    }>;
  };
  product: {
    id: string;
    name: string;
    primaryImage1: string;
  };
}

interface ReturnSectionProps {
  returns: ReturnItem[];
  userId: string;
  onUpdate: () => void;
  showAlert: (message: string, type?: string) => void;
}

const ReturnSection: React.FC<ReturnSectionProps> = ({ returns, showAlert }) => {
  const [expandedReturns, setExpandedReturns] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState('all');

  const toggleReturn = (returnId: string) => {
    setExpandedReturns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(returnId)) {
        newSet.delete(returnId);
      } else {
        newSet.add(returnId);
      }
      return newSet;
    });
  };

  // Filter returns by status
  const filteredReturns = useMemo(() => {
    if (activeTab === 'all') return returns;
    return returns.filter(r => r.status === activeTab.toUpperCase());
  }, [returns, activeTab]);

  // Count returns by status
  const statusCounts = useMemo(() => {
    return {
      all: returns.length,
      requested: returns.filter(r => r.status === 'REQUESTED').length,
      approved: returns.filter(r => r.status === 'APPROVED').length,
      picked: returns.filter(r => r.status === 'PICKED').length,
      refunded: returns.filter(r => r.status === 'REFUNDED').length,
      rejected: returns.filter(r => r.status === 'REJECTED').length,
    };
  }, [returns]);

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      REQUESTED: { label: 'Requested', className: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
      APPROVED: { label: 'Approved', className: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
      REJECTED: { label: 'Rejected', className: 'bg-red-100 text-red-800 border-red-200', icon: XCircle },
      PICKED: { label: 'Picked Up', className: 'bg-purple-100 text-purple-800 border-purple-200', icon: PackageCheck },
      REFUNDED: { label: 'Refunded', className: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: CheckCircle },
    };

    const config = statusConfig[status] || statusConfig.REQUESTED;
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} flex items-center gap-1 px-2 py-1`}>
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    );
  };

  const getOrderStatusBadge = (orderStatus: string) => {
    const orderStatusConfig: Record<string, { label: string; className: string }> = {
      CREATED: { label: 'Created', className: 'bg-gray-100 text-gray-800 border-gray-200' },
      CONFIRMED: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      SHIPPED: { label: 'Shipped', className: 'bg-purple-100 text-purple-800 border-purple-200' },
      DELIVERED: { label: 'Delivered', className: 'bg-green-100 text-green-800 border-green-200' },
      CANCELLED: { label: 'Cancelled', className: 'bg-red-100 text-red-800 border-red-200' },
    };

    const config = orderStatusConfig[orderStatus] || orderStatusConfig.CREATED;

    return (
      <Badge className={`${config.className} px-2 py-1 text-xs`}>
        <Truck className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  if (!returns || returns.length === 0) {
    return (
      <div className="p-8">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-gray-100 p-6 mb-4">
            <RefreshCw className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Returns Yet</h3>
          <p className="text-gray-600 max-w-md">
            You haven't requested any returns. If you need to return an item, you can initiate a return from your orders page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Returns</h2>
        <p className="text-gray-600 mt-1">Track and manage your return requests</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="all" className="relative">
            All
            {statusCounts.all > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-gray-200 rounded-full">
                {statusCounts.all}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="requested" className="relative">
            Requested
            {statusCounts.requested > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-blue-200 rounded-full">
                {statusCounts.requested}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="approved" className="relative">
            Approved
            {statusCounts.approved > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-green-200 rounded-full">
                {statusCounts.approved}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="picked" className="relative">
            Picked Up
            {statusCounts.picked > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-purple-200 rounded-full">
                {statusCounts.picked}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="refunded" className="relative">
            Refunded
            {statusCounts.refunded > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-emerald-200 rounded-full">
                {statusCounts.refunded}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="rejected" className="relative">
            Rejected
            {statusCounts.rejected > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs bg-red-200 rounded-full">
                {statusCounts.rejected}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-0">
          {filteredReturns.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-gray-100 p-6 mb-4">
                <RefreshCw className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No {activeTab !== 'all' ? activeTab : ''} returns found
              </h3>
              <p className="text-gray-600">
                You don't have any returns in this category.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReturns.map((returnItem) => {
                // Find the specific order item for this return
                const returnedItem = returnItem.order.items.find(
                  item => item.product.id === returnItem.product.id
                );

                return (
                  <Collapsible
                    key={returnItem.id}
                    open={expandedReturns.has(returnItem.id)}
                    onOpenChange={() => toggleReturn(returnItem.id)}
                  >
                    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                      <CollapsibleTrigger asChild>
                        <button className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                          <div className="flex items-start gap-4 flex-1">
                            <div className="rounded-lg bg-gray-100 p-3">
                              <Package className="w-6 h-6 text-gray-600" />
                            </div>
                            
                            <div className="flex-1 text-left">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <h3 className="font-semibold text-gray-900">
                                  Order #{returnItem.orderId.slice(0, 8)}...
                                </h3>
                                {getStatusBadge(returnItem.status)}
                                {getOrderStatusBadge(returnItem.order.orderStatus)}
                              </div>
                              
                              <p className="text-sm text-gray-600 mb-1">
                                Return ID: {returnItem.id.slice(0, 8)}...
                              </p>
                              
                              <p className="text-sm text-gray-600 mb-1">
                                Product: {returnItem.product.name}
                              </p>
                              
                              <p className="text-sm text-gray-600">
                                Requested on {formatDate(returnItem.createdAt)}
                              </p>
                              
                              {returnItem.amount > 0 && (
                                <p className="text-sm font-medium text-green-600 mt-1">
                                  Refund Amount: {formatCurrency(returnItem.amount)}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="ml-4">
                            {expandedReturns.has(returnItem.id) ? (
                              <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                          </div>
                        </button>
                      </CollapsibleTrigger>

                      <CollapsibleContent>
                        <div className="border-t border-gray-200 bg-gray-50 p-4">
                          <div className="space-y-4">
                            {/* Return Reason */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-1">Return Reason</h4>
                              <p className="text-sm text-gray-600">{returnItem.reason}</p>
                            </div>

                            {/* Returned Product */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Returned Item</h4>
                              <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-gray-200">
                                <img
                                  src={returnItem.product.primaryImage1}
                                  alt={returnItem.product.name}
                                  className="w-16 h-16 object-cover rounded-md"
                                />
                                <div className="flex-1">
                                  <p className="font-medium text-gray-900 text-sm">{returnItem.product.name}</p>
                                  {returnedItem && (
                                    <>
                                      <p className="text-sm text-gray-600">Quantity: {returnedItem.quantity}</p>
                                      <p className="text-sm font-medium text-gray-900">
                                        {formatCurrency(returnedItem.price)}
                                      </p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Timeline */}
                            <div>
                              <h4 className="text-sm font-semibold text-gray-700 mb-2">Return Timeline</h4>
                              <div className="space-y-2">
                                <div className="flex items-start gap-3">
                                  <div className="rounded-full bg-blue-100 p-1 mt-0.5">
                                    <Clock className="w-3 h-3 text-blue-600" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">Return Requested</p>
                                    <p className="text-xs text-gray-600">{formatDate(returnItem.createdAt)}</p>
                                  </div>
                                </div>
                                
                                {returnItem.order.updatedAt !== returnItem.order.createdAt && (
                                  <div className="flex items-start gap-3">
                                    <div className="rounded-full bg-green-100 p-1 mt-0.5">
                                      <CheckCircle className="w-3 h-3 text-green-600" />
                                    </div>
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">Order Last Updated</p>
                                      <p className="text-xs text-gray-600">{formatDate(returnItem.order.updatedAt)}</p>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Status Message */}
                            {returnItem.status === 'REQUESTED' && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <p className="text-sm text-blue-800">
                                  Your return request is being reviewed. We'll update you shortly.
                                </p>
                              </div>
                            )}
                            
                            {returnItem.status === 'APPROVED' && (
                              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                <p className="text-sm text-green-800">
                                  Your return has been approved. We'll arrange for pickup soon.
                                </p>
                              </div>
                            )}
                            
                            {returnItem.status === 'PICKED' && (
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                <p className="text-sm text-purple-800">
                                  Your item has been picked up and is being processed. The refund will be initiated once we receive and verify the item.
                                </p>
                              </div>
                            )}
                            
                            {returnItem.status === 'REFUNDED' && (
                              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                <p className="text-sm text-emerald-800">
                                  Your refund of {formatCurrency(returnItem.amount)} has been completed and credited to your account.
                                </p>
                              </div>
                            )}
                            
                            {returnItem.status === 'REJECTED' && (
                              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                <p className="text-sm text-red-800">
                                  Unfortunately, your return request has been rejected. Please contact support for more information.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ReturnSection;