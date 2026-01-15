'use client'
import React, { useState, useEffect } from 'react';
import { Search, Check, X, Clock, AlertCircle, Copy, CheckCircle, Menu } from 'lucide-react';
import Navbar from '@/components/Navbar';

const AdminRefundPage = () => {
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [processingId, setProcessingId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch refunds based on status
  const fetchRefunds : any = async (status) => {
    setLoading(true);
    try {
      const queryParam = status ? `?status=${status}` : '';
      const response = await fetch(`${API_BASE_URL}/payment/get/all/refund/request${queryParam}`);
      const data = await response.json();
      console.log(data)
      if (data.success) {
        setRefunds(data.refunds);
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'pending') {
      fetchRefunds('INITIATED');
    } else {
      fetchRefunds();
    }
  }, [activeTab]);

  // Copy to clipboard
  const handleCopy = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Process refund (Approve = REFUNDED / Reject = FAILED)
  const handleProcessRefund = async (refundId, action) => {
    setProcessingId(refundId);
    try {
      const response = await fetch(`${API_BASE_URL}/payment/process/refund/${refundId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      const data = await response.json();
      
      if (data.success) {
        if (activeTab === 'pending') {
          fetchRefunds('INITIATED');
        } else {
          fetchRefunds();
        }
        alert(data.message);
      } else {
        alert(data.message || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Error processing refund:', error);
      alert('Error processing refund');
    } finally {
      setProcessingId(null);
    }
  };

  // Filter refunds based on search and tab
  const filteredRefunds = refunds.filter((refund : any) => {
    const matchesSearch = 
      refund.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.paymentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      refund.reason.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === 'pending') {
      return matchesSearch && refund.status === 'INITIATED';
    } else {
      return matchesSearch && ['REFUNDED', 'FAILED'].includes(refund.status);
    }
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'INITIATED': return 'bg-yellow-100 text-yellow-800';
      case 'REFUNDED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  return (
    <div>
        <Navbar></Navbar>
        <div className="min-h-screen bg-gray-50">
      {/* Navbar placeholder - replace with actual Navbar component */}
     

      <div className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 sm:mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Refund Management</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">
              Manage and process customer refund requests manually
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'pending'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Pending Refunds</span>
                    <span className="sm:hidden">Pending</span>
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab('completed')}
                  className={`flex-1 sm:flex-none px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium border-b-2 transition-colors ${
                    activeTab === 'completed'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Completed Refunds</span>
                    <span className="sm:hidden">Completed</span>
                  </div>
                </button>
              </nav>
            </div>

            {/* Search Bar */}
            <div className="p-3 sm:p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
                <input
                  type="text"
                  placeholder="Search by ID or Reason..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 sm:pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Refunds Content */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48 sm:h-64">
                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-500"></div>
              </div>
            ) : filteredRefunds.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 sm:h-64 text-gray-500 px-4">
                <AlertCircle className="w-10 h-10 sm:w-12 sm:h-12 mb-4" />
                <p className="text-base sm:text-lg font-medium text-center">No refund requests found</p>
                <p className="text-xs sm:text-sm text-center">
                  There are no {activeTab === 'pending' ? 'pending' : 'completed'} refunds at the moment
                </p>
              </div>
            ) : (
              <>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Refund ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Order ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Payment ID
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Reason
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRefunds.map((refund : any) => (
                        <tr key={refund.id} className="hover:bg-gray-50">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono text-gray-900 truncate max-w-[100px]" title={refund.id}>
                                {refund.id}
                              </span>
                              <button
                                onClick={() => handleCopy(refund.id, `refund-${refund.id}`)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy Refund ID"
                              >
                                {copiedId === `refund-${refund.id}` ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono text-gray-900 truncate max-w-[100px]" title={refund.orderId}>
                                {refund.orderId}
                              </span>
                              <button
                                onClick={() => handleCopy(refund.orderId, `order-${refund.orderId}`)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy Order ID"
                              >
                                {copiedId === `order-${refund.orderId}` ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-mono text-gray-900 truncate max-w-[100px]" title={refund.paymentId}>
                                {refund.paymentId}
                              </span>
                              <button
                                onClick={() => handleCopy(refund.paymentId, `payment-${refund.paymentId}`)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                title="Copy Payment ID"
                              >
                                {copiedId === `payment-${refund.paymentId}` ? (
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm font-semibold text-gray-900">
                              {formatCurrency(refund.amount)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-900 max-w-xs">
                              {refund.reason}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <div className="text-sm text-gray-500">
                              {formatDate(refund.createdAt)}
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>
                              {refund.status}
                            </span>
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-2">
                              {refund.status === 'INITIATED' && (
                                <>
                                  <button
                                    onClick={() => handleProcessRefund(refund.id, 'APPROVE')}
                                    disabled={processingId === refund.id}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <Check className="w-3 h-3 mr-1" />
                                    Refund
                                  </button>
                                  <button
                                    onClick={() => handleProcessRefund(refund.id, 'REJECT')}
                                    disabled={processingId === refund.id}
                                    className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                  >
                                    <X className="w-3 h-3 mr-1" />
                                    Reject
                                  </button>
                                </>
                              )}
                              {refund.status === 'REFUNDED' && (
                                <span className="text-xs text-green-600 font-medium">
                                  ✓ Refunded
                                </span>
                              )}
                              {refund.status === 'FAILED' && (
                                <span className="text-xs text-red-600 font-medium">
                                  ✗ Rejected
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile/Tablet Card View */}
                <div className="lg:hidden divide-y divide-gray-200">
                  {filteredRefunds.map((refund : any) => (
                    <div key={refund.id} className="p-4 hover:bg-gray-50">
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(refund.status)}`}>
                          {refund.status}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(refund.createdAt)}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="text-xl font-bold text-gray-900 mb-3">
                        {formatCurrency(refund.amount)}
                      </div>

                      {/* IDs */}
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Refund ID:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-gray-900 truncate max-w-[150px]" title={refund.id}>
                              {refund.id}
                            </span>
                            <button
                              onClick={() => handleCopy(refund.id, `refund-${refund.id}`)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {copiedId === `refund-${refund.id}` ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Order ID:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-gray-900 truncate max-w-[150px]" title={refund.orderId}>
                              {refund.orderId}
                            </span>
                            <button
                              onClick={() => handleCopy(refund.orderId, `order-${refund.orderId}`)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {copiedId === `order-${refund.orderId}` ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Payment ID:</span>
                          <div className="flex items-center gap-1">
                            <span className="font-mono text-gray-900 truncate max-w-[150px]" title={refund.paymentId}>
                              {refund.paymentId}
                            </span>
                            <button
                              onClick={() => handleCopy(refund.paymentId, `payment-${refund.paymentId}`)}
                              className="text-gray-400 hover:text-gray-600"
                            >
                              {copiedId === `payment-${refund.paymentId}` ? (
                                <CheckCircle className="w-3 h-3 text-green-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mb-3">
                        <div className="text-xs text-gray-500 mb-1">Reason:</div>
                        <div className="text-sm text-gray-900">{refund.reason}</div>
                      </div>

                      {/* Actions */}
                      {refund.status === 'INITIATED' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleProcessRefund(refund.id, 'APPROVE')}
                            disabled={processingId === refund.id}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Refund
                          </button>
                          <button
                            onClick={() => handleProcessRefund(refund.id, 'REJECT')}
                            disabled={processingId === refund.id}
                            className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      )}
                      {refund.status === 'REFUNDED' && (
                        <div className="text-center text-sm text-green-600 font-medium">
                          ✓ Refunded
                        </div>
                      )}
                      {refund.status === 'FAILED' && (
                        <div className="text-center text-sm text-red-600 font-medium">
                          ✗ Rejected
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Summary Stats */}
          <div className="mt-4 sm:mt-6 grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Pending</div>
              <div className="text-xl sm:text-2xl font-bold text-yellow-600">
                {refunds.filter((r : any) => r.status === 'INITIATED').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Refunded</div>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {refunds.filter((r : any) => r.status === 'REFUNDED').length}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-3 sm:p-4">
              <div className="text-xs sm:text-sm text-gray-600 mb-1">Rejected</div>
              <div className="text-xl sm:text-2xl font-bold text-red-600">
                {refunds.filter((r : any) => r.status === 'FAILED').length}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
   
  );
};

export default AdminRefundPage;