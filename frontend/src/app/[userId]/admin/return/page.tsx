'use client'
import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, XCircle, AlertCircle, Clock, RefreshCw, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Navbar from '@/components/Navbar';

const ReturnManagementPage = () => {
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [expandedReturn, setExpandedReturn] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showApproveModal, setShowApproveModal] = useState(null);
  const [showRejectModal, setShowRejectModal] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  useEffect(() => {
    fetchReturns();
  }, [pagination.page, statusFilter]);

  const fetchReturns = async () => {
    try {
      setLoading(true);
      setError(null);
      const statusParam = statusFilter ? `&status=${statusFilter}` : '';
      const response = await fetch(
        `${API_BASE_URL}/return/get/all/return/?page=${pagination.page}&limit=${pagination.limit}${statusParam}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch returns');
      
      const data = await response.json();
      setReturns(data.returns);
      setPagination(data.pagination);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReturn = async (returnId) => {
    try {
      setActionLoading(returnId);
      const response = await fetch(`${API_BASE_URL}/return/update/return/request/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'APPROVED',
          adminNote: adminNote || undefined
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to approve return');
      }

      setSuccessMessage('Return request approved successfully!');
      setShowApproveModal(null);
      setAdminNote('');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchReturns();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectReturn = async (returnId) => {
    if (!adminNote.trim()) {
      setError('Please provide a reason for rejection');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setActionLoading(returnId);
      const response = await fetch(`${API_BASE_URL}/return/update/return/request/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: 'REJECTED',
          adminNote: adminNote
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to reject return');
      }

      setSuccessMessage('Return request rejected successfully!');
      setShowRejectModal(null);
      setAdminNote('');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchReturns();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleMarkPicked = async (returnId) => {
    try {
      setActionLoading(returnId);
      const response = await fetch(`${API_BASE_URL}/return/update/product/picked/${returnId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to mark as picked');
      }

      setSuccessMessage('Product marked as picked successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchReturns();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const handleInitiateRefund = async (returnId, paymentMethod) => {
    if (paymentMethod === 'COD') {
      setError('No refund needed for Cash on Delivery orders');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setActionLoading(returnId);
      const response = await fetch(`${API_BASE_URL}/return/initiate/refund/${returnId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to initiate refund');
      }

      setSuccessMessage('Refund initiated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
      fetchReturns();
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    } finally {
      setActionLoading(null);
    }
  };

  const toggleExpand = (returnId) => {
    setExpandedReturn(expandedReturn === returnId ? null : returnId);
  };

  const getStatusColor = (status) => {
    const colors = {
      REQUESTED: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      APPROVED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      PICKED: 'bg-blue-100 text-blue-800 border-blue-200',
      REFUNDED: 'bg-purple-100 text-purple-800 border-purple-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
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

  if (loading && returns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading return requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
        <Navbar></Navbar>
        <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Package className="w-8 h-8 text-blue-600" />
            Return Request Management
          </h1>
          <p className="text-gray-600 mt-2">Review and process all product return requests</p>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPagination({ ...pagination, page: 1 });
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="REQUESTED">Requested</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="PICKED">Picked</option>
              <option value="REFUNDED">Refunded</option>
            </select>
            <button
              onClick={fetchReturns}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
        </div>

        {successMessage && (
          <Alert className="mb-6 bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        {returns.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Return Requests</h3>
            <p className="text-gray-600">There are no return requests matching your filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {returns.map((returnRequest) => (
              <div key={returnRequest.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          Return #{returnRequest.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(returnRequest.status)}`}>
                          {returnRequest.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">Order ID: {returnRequest.orderId.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-gray-600">Created: {formatDate(returnRequest.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => toggleExpand(returnRequest.id)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {expandedReturn === returnRequest.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Customer</p>
                      <p className="font-medium text-gray-900">{returnRequest.order.user.name}</p>
                      <p className="text-sm text-gray-600">{returnRequest.order.user.email}</p>
                      <p className="text-sm text-gray-600">{returnRequest.order.user.phoneNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Return Amount</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(returnRequest.amount)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Payment Method</p>
                      <p className="font-medium text-gray-900">{returnRequest.order.paymentMethod}</p>
                    </div>
                  </div>

                  {expandedReturn === returnRequest.id && (
                    <div className="border-t border-gray-200 pt-4 mt-4">
                      <div className="mb-4">
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Return Reason</p>
                        <p className="text-gray-900">{returnRequest.reason}</p>
                      </div>
                      {returnRequest.description && (
                        <div className="mb-4">
                          <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Additional Details</p>
                          <p className="text-gray-900">{returnRequest.description}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons Based on Status */}
                  <div className="flex flex-wrap gap-3 mt-4">
                    {returnRequest.status === 'REQUESTED' && (
                      <>
                        <button
                          onClick={() => setShowApproveModal(returnRequest.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </button>
                        <button
                          onClick={() => setShowRejectModal(returnRequest.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </>
                    )}

                    {returnRequest.status === 'APPROVED' && (
                      <button
                        onClick={() => handleMarkPicked(returnRequest.id)}
                        disabled={actionLoading === returnRequest.id}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {actionLoading === returnRequest.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Package className="w-4 h-4" />
                            Mark as Picked
                          </>
                        )}
                      </button>
                    )}

                    {returnRequest.status === 'PICKED' && returnRequest.order.paymentMethod !== 'COD' && (
                      <button
                        onClick={() => handleInitiateRefund(returnRequest.id, returnRequest.order.paymentMethod)}
                        disabled={actionLoading === returnRequest.id}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 disabled:cursor-not-allowed transition-colors"
                      >
                        {actionLoading === returnRequest.id ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Initiate Refund
                          </>
                        )}
                      </button>
                    )}

                    {returnRequest.status === 'PICKED' && returnRequest.order.paymentMethod === 'COD' && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">
                        <Clock className="w-4 h-4" />
                        No refund needed (COD)
                      </div>
                    )}

                    {returnRequest.status === 'REJECTED' && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-800 rounded-lg">
                        <XCircle className="w-4 h-4" />
                        Request Rejected
                      </div>
                    )}

                    {returnRequest.status === 'REFUNDED' && (
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
                        <CheckCircle className="w-4 h-4" />
                        Refund Completed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-gray-700">
              Page {pagination.page} of {pagination.totalPages}
            </span>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Approve Return Request</h3>
            <p className="text-gray-600 mb-4">Are you sure you want to approve this return request?</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Note (Optional)
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Add any notes for this approval..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows="3"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleApproveReturn(showApproveModal)}
                disabled={actionLoading === showApproveModal}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === showApproveModal ? 'Processing...' : 'Approve'}
              </button>
              <button
                onClick={() => {
                  setShowApproveModal(null);
                  setAdminNote('');
                }}
                disabled={actionLoading === showApproveModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Reject Return Request</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for rejecting this return request.</p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                placeholder="Explain why this return is being rejected..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                rows="4"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleRejectReturn(showRejectModal)}
                disabled={actionLoading === showRejectModal || !adminNote.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors"
              >
                {actionLoading === showRejectModal ? 'Processing...' : 'Reject'}
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(null);
                  setAdminNote('');
                }}
                disabled={actionLoading === showRejectModal}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
   
  );
};

export default ReturnManagementPage;