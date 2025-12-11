'use client'
import React, { useState, useEffect } from 'react';
import { Plus, MapPin, Loader2 } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Navbar from '@/components/Navbar';

const PincodeManager = () => {
    const [pincodes, setPincodes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [newPincode, setNewPincode] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

    // Replace with your actual API base URL
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

    useEffect(() => {
        fetchPincodes();
    }, []);

    const fetchPincodes = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/coupen/all/pincode`);
            const data = await response.json();

            if (data.success) {
                setPincodes(data.pincodes);
            }
        } catch (error) {
            showAlert('Failed to fetch pincodes', 'error');
            console.error('Error fetching pincodes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPincode = async () => {
        if (!newPincode || newPincode.length !== 6) {
            showAlert('Please enter a valid 6-digit pincode', 'error');
            return;
        }

        try {
            setSubmitting(true);
            const response = await fetch(`${API_BASE_URL}/coupen/add/pincode`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    pincode: parseInt(newPincode)
                })
            });

            const data = await response.json();

            if (data.success) {
                showAlert(data.message, 'success');
                setNewPincode('');
                setDialogOpen(false);
                fetchPincodes();
            } else {
                showAlert(data.message || 'Failed to add pincode', 'error');
            }
        } catch (error) {
            showAlert('Failed to add pincode', 'error');
            console.error('Error adding pincode:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const showAlert = (message, type) => {
        setAlert({ show: true, message, type });
        setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 4000);
    };

    return (
        <div>
            <Navbar></Navbar>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                                    <MapPin className="text-indigo-600" />
                                    Pincode Management
                                </h1>
                                <p className="text-gray-600 mt-2">Manage all available pincodes for delivery</p>
                            </div>

                            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-colors shadow-md hover:shadow-lg">
                                        <Plus size={20} />
                                        Add Pincode
                                    </button>
                                </DialogTrigger>
                                <DialogContent className="bg-white p-6 rounded-lg shadow-xl max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold text-gray-800">Add New Pincode</DialogTitle>
                                        <DialogDescription className="text-gray-600 mt-2">
                                            Enter a 6-digit pincode to add to the delivery zone
                                        </DialogDescription>
                                    </DialogHeader>

                                    <div className="my-6">
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Pincode
                                        </label>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={newPincode}
                                            onChange={(e) => setNewPincode(e.target.value.replace(/\D/g, ''))}
                                            placeholder="Enter 6-digit pincode"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        />
                                        {newPincode && newPincode.length !== 6 && (
                                            <p className="text-sm text-red-500 mt-1">Pincode must be 6 digits</p>
                                        )}
                                    </div>

                                    <DialogFooter className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setDialogOpen(false);
                                                setNewPincode('');
                                            }}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleAddPincode}
                                            disabled={submitting || newPincode.length !== 6}
                                            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <Loader2 size={16} className="animate-spin" />
                                                    Adding...
                                                </>
                                            ) : (
                                                'Add Pincode'
                                            )}
                                        </button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Alert */}
                    {alert.show && (
                        <Alert className={`mb-6 ${alert.type === 'error' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                            <AlertDescription className={alert.type === 'error' ? 'text-red-800' : 'text-green-800'}>
                                {alert.message}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Pincode List */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h2 className="text-xl font-semibold text-gray-800 mb-4">
                            Available Pincodes ({pincodes.length})
                        </h2>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="animate-spin text-indigo-600" size={40} />
                            </div>
                        ) : pincodes.length === 0 ? (
                            <div className="text-center py-12">
                                <MapPin className="mx-auto text-gray-400 mb-4" size={48} />
                                <p className="text-gray-500 text-lg">No pincodes available</p>
                                <p className="text-gray-400 text-sm mt-2">Add your first pincode to get started</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {pincodes.map((item: any) => (
                                    <div
                                        key={item.id}
                                        className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center gap-2">
                                            <MapPin size={18} className="text-indigo-600" />
                                            <span className="text-lg font-semibold text-gray-800">
                                                {item.pincode}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>

    );
};

export default PincodeManager;