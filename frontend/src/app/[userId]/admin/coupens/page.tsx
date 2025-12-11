'use client'
import React, { useState, useEffect } from 'react';
import { Plus, Tag, Calendar, Percent, DollarSign, X, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';

export default function CouponManagement() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        discountPercentage: '',
        minOrderAmount: '',
        validFrom: '',
        validUntil: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Replace with your actual API endpoint and userId
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
    const { userId } = useParams();

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/coupen/all/coupens`);
            const data = await response.json();
            if (data.success) {
                setCoupons(data.coupens);
            }
        } catch (err) {
            console.error('Error fetching coupons:', err);
            setError('Failed to fetch coupons');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/coupen/add/coupen/code`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    code: formData.code,
                    discountPercentage: parseInt(formData.discountPercentage),
                    minOrderAmount: parseInt(formData.minOrderAmount),
                    validFrom: formData.validFrom,
                    validUntil: formData.validUntil
                })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Coupon created successfully!');
                setFormData({
                    code: '',
                    discountPercentage: '',
                    minOrderAmount: '',
                    validFrom: '',
                    validUntil: ''
                });
                fetchCoupons();
                setTimeout(() => {
                    setIsDialogOpen(false);
                    setSuccess('');
                }, 2000);
            } else {
                setError(data.message || 'Failed to create coupon');
            }
        } catch (err) {
            setError('Failed to create coupon');
        }
    };

    const getCouponStatus = (validFrom, validUntil, isActive) => {
        if (!isActive) return { label: 'Inactive', color: 'bg-gray-500' };

        const now = new Date();
        const startDate = new Date(validFrom);
        const endDate = new Date(validUntil);

        if (now < startDate) return { label: 'Upcoming', color: 'bg-blue-500' };
        if (now > endDate) return { label: 'Expired', color: 'bg-red-500' };
        return { label: 'Active', color: 'bg-green-500' };
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div>
            <Navbar></Navbar>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
                                    <Tag className="w-8 h-8 text-purple-600" />
                                    Coupon Management
                                </h1>
                                <p className="text-gray-600 mt-1">Manage your promotional coupons</p>
                            </div>
                            <Button
                                onClick={() => setIsDialogOpen(true)}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Add Coupon
                            </Button>
                        </div>
                    </div>

                    {/* Coupons Table */}
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                                <p className="mt-4 text-gray-600">Loading coupons...</p>
                            </div>
                        ) : coupons.length === 0 ? (
                            <div className="p-12 text-center">
                                <Tag className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                                <p className="text-gray-600 text-lg">No coupons available</p>
                                <p className="text-gray-400 text-sm mt-2">Create your first coupon to get started</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Code</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Discount</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Min Order</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Valid From</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Valid Until</th>
                                            <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {coupons.map((coupon: any) => {
                                            const status = getCouponStatus(coupon.validFrom, coupon.validUntil, coupon.isActive);
                                            return (
                                                <tr key={coupon.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap font-mono font-semibold text-purple-600">
                                                        {coupon.code}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="flex items-center gap-1">

                                                            {coupon.discountPercentage}%
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="flex items-center gap-1">
                                                            <IndianRupee className="w-4 h-4 text-blue-600" />
                                                            {coupon.minOrderAmount}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(coupon.validFrom)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                                        {formatDate(coupon.validUntil)}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <Badge className={`${status.color} text-white`}>
                                                            {status.label}
                                                        </Badge>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

                {/* Add Coupon Dialog */}
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-md bg-white">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <Tag className="w-5 h-5 text-purple-600" />
                                Add New Coupon
                            </DialogTitle>
                            <DialogDescription>
                                Create a new promotional coupon code for your customers
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="code">Coupon Code *</Label>
                                <Input
                                    id="code"
                                    name="code"
                                    placeholder="SUMMER2024"
                                    value={formData.code}
                                    onChange={handleInputChange}
                                    className="uppercase"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="discountPercentage">Discount Percentage *</Label>
                                <Input
                                    id="discountPercentage"
                                    name="discountPercentage"
                                    type="number"
                                    placeholder="10"
                                    value={formData.discountPercentage}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="minOrderAmount">Minimum Order Amount *</Label>
                                <Input
                                    id="minOrderAmount"
                                    name="minOrderAmount"
                                    type="number"
                                    placeholder="500"
                                    value={formData.minOrderAmount}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="validFrom">Valid From *</Label>
                                <Input
                                    id="validFrom"
                                    name="validFrom"
                                    type="datetime-local"
                                    value={formData.validFrom}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="validUntil">Valid Until *</Label>
                                <Input
                                    id="validUntil"
                                    name="validUntil"
                                    type="datetime-local"
                                    value={formData.validUntil}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                                    {error}
                                </div>
                            )}

                            {success && (
                                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
                                    {success}
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsDialogOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                className="bg-purple-600 hover:bg-purple-700"
                            >
                                Create Coupon
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
        </div>

    );
}