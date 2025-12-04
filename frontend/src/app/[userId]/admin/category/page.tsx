"use client"
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Alert,
  AlertDescription,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FolderTree, 
  Loader2, 
  ChevronRight,
  Image,
  AlertCircle,
  Package
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import Navbar from '@/components/Navbar';
import FooterPart from '@/components/FooterPart';
import Link from 'next/link';

const CategoryManagement = () => {
    const { userId } = useParams();
 
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [categoryLoading, setCategoryLoading] = useState(false);
  
  const [subcategoryDialogOpen, setSubcategoryDialogOpen] = useState(false);
  const [subcategoryName, setSubcategoryName] = useState('');
  const [subcategoryImage, setSubcategoryImage] : any = useState(null);
  const [selectedParentId, setSelectedParentId] = useState('');
  const [subcategoryLoading, setSubcategoryLoading] = useState(false);
  
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [subcategoriesData, setSubcategoriesData] = useState({});
  const [loadingSubcategories, setLoadingSubcategories] = useState({});
  const [isChecking, setIsChecking] = useState(true);
 
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const router = useRouter();
  
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
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/category/get/all/category`);
      if (response.data.success) {
        setCategories(response.data.category);
      }
    } catch (err : any) {
      setError(err.response?.data?.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubcategories = async (categoryId) => {
    setLoadingSubcategories(prev => ({ ...prev, [categoryId]: true }));
    try {
      const response = await axios.get(`${API_BASE_URL}/category/get/${categoryId}/all/subcategory`);
      if (response.data.success) {
        const sortedSubcategories = (response.data.subcategories || []).sort((a, b)  => {
          if (a.createdAt && b.createdAt) {
            return new Date(b.createdAt) - new Date(a.createdAt);
          }
          return 0;
        });
        
        setSubcategoriesData(prev => ({
          ...prev,
          [categoryId]: sortedSubcategories
        }));
      }
    } catch (err : any) {
      if (err.response?.status === 404 || err.response?.data?.message?.includes('No subcategory')) {
        setSubcategoriesData(prev => ({
          ...prev,
          [categoryId]: []
        }));
      } else {
        console.error('Failed to fetch subcategories:', err);
        setError('Failed to load subcategories');
        setTimeout(() => setError(''), 3000);
      }
    } finally {
      setLoadingSubcategories(prev => ({ ...prev, [categoryId]: false }));
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setCategoryLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/category/${userId}/add/category/or/subcategory`,
        { name: categoryName }
      );

      if (response.data.success) {
        setSuccess('Category created successfully!');
        setCategoryName('');
        setCategoryDialogOpen(false);
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err : any) {
      setError(err.response?.data?.message || 'Failed to create category');
    } finally {
      setCategoryLoading(false);
    }
  };

  const handleSubcategorySubmit = async (e) => {
    e.preventDefault();
    if (!subcategoryImage) {
      setError('Please select an image for subcategory');
      return;
    }

    setSubcategoryLoading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('name', subcategoryName);
      formData.append('parentId', selectedParentId);
      formData.append('image', subcategoryImage);

      const response = await axios.post(
        `${API_BASE_URL}/category/${userId}/add/category/or/subcategory`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data.success) {
        setSuccess('Subcategory created successfully!');
        setSubcategoryName('');
        setSubcategoryImage(null);
        
        await fetchSubcategories(selectedParentId);
        
        setExpandedCategories(prev => new Set([...prev, selectedParentId]));
        
        setSelectedParentId('');
        setSubcategoryDialogOpen(false);
        fetchCategories();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err : any) {
      setError(err.response?.data?.message || 'Failed to create subcategory');
    } finally {
      setSubcategoryLoading(false);
    }
  };

  const toggleCategory = async (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
      await fetchSubcategories(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const openSubcategoryDialog = (categoryId) => {
    setSelectedParentId(categoryId);
    setSubcategoryDialogOpen(true);
  };

  const handleViewProduct = () => {
    router.push(`/${userId}/admin/product`);
  };
  const handlevieworder = () => {
    router.push(`/${userId}/admin/orders`);
  };

  return (
  <div>
    {
        isChecking ? (
            <div className="flex flex-col items-center justify-center h-screen gap-2 text-lg font-medium">
             <Link href={'/'}>
        <div className="flex items-center gap-2">
          <div className="w-auto h-14">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 270 54"
              className="h-full w-auto"
            >
              <defs>
                <style>
                  {`
                  .st0 {
                    font-family: MuktaMahee-Regular, 'Mukta Mahee';
                    font-size: 49.69px;
                  }
                  `}
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
            <p className="text-gray-600 text-sm">Verifying request</p>
          </div>
        ) : (
            <div>
                 <div>
                <Navbar></Navbar>
                <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-3 sm:p-4 md:p-6">
            
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
              {/* Header Section - Responsive */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-semibold flex items-center gap-2 sm:gap-3">
                    <FolderTree className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
                    <span className="leading-tight">Category Management</span>
                  </h1>
                  <p className="text-slate-600 mt-1 sm:mt-2 text-sm sm:text-base">Organize your e-commerce catalog with ease</p>
                </div>
      
                {/* Action Buttons - Responsive Stack */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                  <Button className="flex items-center justify-center gap-2 bg-blue-600 text-white w-full sm:w-auto text-sm sm:text-base" 
                   onClick={handleViewProduct}
                  >
                    <Package className="w-4 h-4" />
                    View product
                  </Button>
                  
                  <Button className="flex items-center justify-center gap-2 bg-blue-600 text-white w-full sm:w-auto text-sm sm:text-base"
                     onClick={handlevieworder}
                  >
                    <Package className="w-4 h-4" />
                    View orders
                  </Button>
                  
                  <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
                    <DialogTrigger asChild>
                      <Button className="bg-blue-900 shadow-lg gap-2 text-white w-full sm:w-auto text-sm sm:text-base">
                        <Plus className="w-4 h-4" />
                        Add Category
                      </Button>
                    </DialogTrigger>
                    <DialogContent className='bg-white border-0 max-w-[95vw] sm:max-w-md'>
                      <DialogHeader>
                        <DialogTitle className="text-xl sm:text-2xl">Create New Category</DialogTitle>
                        <DialogDescription className="text-sm">
                          Add a new top-level category to your store
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-3 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="categoryName" className="text-sm sm:text-base font-medium">Category Name</Label>
                          <Input
                            id="categoryName"
                            placeholder="e.g., Electronics, Clothing"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="h-10 sm:h-11 text-sm sm:text-base"
                          />
                        </div>
                      </div>
                      <DialogFooter className="flex-col sm:flex-row gap-2">
                        <Button
                          variant="outline"
                          onClick={() => setCategoryDialogOpen(false)}
                          className="w-full sm:w-auto"
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCategorySubmit} 
                          disabled={categoryLoading || !categoryName.trim()} 
                          className='bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto'
                        >
                          {categoryLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Create Category
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
      
              {/* Alerts - Responsive */}
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}
      
              {success && (
                <Alert className="border-green-200 bg-green-50 text-green-800">
                  <AlertDescription className="font-medium text-sm">{success}</AlertDescription>
                </Alert>
              )}
      
              {/* Main Content Card - Responsive */}
              <Card className="shadow-xl border-0">
                <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b p-4 sm:p-6">
                  <CardTitle className="text-xl sm:text-2xl font-light">All Categories</CardTitle>
                  <CardDescription className="text-sm sm:text-base">
                    Click on any category to view and manage subcategories
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="flex items-center justify-center py-12 sm:py-16">
                      <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin text-blue-600" />
                    </div>
                  ) : categories.length === 0 ? (
                    <div className="text-center py-12 sm:py-16 px-4">
                      <div className="bg-slate-100 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <FolderTree className="w-8 h-8 sm:w-10 sm:h-10 text-slate-400" />
                      </div>
                      <p className="text-lg sm:text-xl font-medium text-slate-700 mb-2">No categories found</p>
                      <p className="text-sm sm:text-base text-slate-500">Create your first category to get started</p>
                    </div>
                  ) : (
                    /* Mobile: Card View, Desktop: Table View */
                    <>
                      {/* Mobile View */}
                      <div className="block lg:hidden">
                        {categories.map((category : any) => (
                          <div key={category.id} className="border-b last:border-b-0">
                            <div 
                              className="p-4 hover:bg-blue-50 cursor-pointer transition-colors"
                              onClick={() => toggleCategory(category.id)}
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                  <ChevronRight
                                    className={`w-5 h-5 text-slate-600 transition-transform duration-200 flex-shrink-0 ${
                                      expandedCategories.has(category.id) ? 'rotate-90' : ''
                                    }`}
                                  />
                                  <Package className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                  <span className="font-semibold text-slate-900 text-base truncate">{category.name}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center justify-between gap-2">
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-medium text-xs">
                                  {subcategoriesData[category.id]?.length || category.children?.length || 0} subcategories
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openSubcategoryDialog(category.id);
                                  }}
                                  className="gap-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 text-white shadow-md text-xs px-2 py-1 h-auto"
                                >
                                  <Plus className="w-3 h-3" />
                                  Add Sub
                                </Button>
                              </div>
                            </div>
                            
                            {expandedCategories.has(category.id) && (
                              <div className="bg-gradient-to-r from-slate-50 to-blue-50 p-4">
                                {loadingSubcategories[category.id] ? (
                                  <div className="flex items-center justify-center py-6">
                                    <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                                    <span className="ml-2 text-slate-600 text-sm">Loading...</span>
                                  </div>
                                ) : subcategoriesData[category.id]?.length > 0 ? (
                                  <div className="space-y-3">
                                    {subcategoriesData[category.id].map((sub) => (
                                      <div
                                        key={sub.id}
                                        className="flex items-center gap-3 p-3 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                                      >
                                        {sub.imageUrl ? (
                                          <img
                                            src={sub.imageUrl}
                                            alt=""
                                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg object-cover shadow-md flex-shrink-0"
                                          />
                                        ) : (
                                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                                            <Image className="w-6 h-6 sm:w-7 sm:h-7 text-slate-500" />
                                          </div>
                                        )}
                                        <div className="flex-1 min-w-0">
                                          <p className="font-semibold text-slate-800 text-sm truncate">{sub.name}</p>
                                          <p className="text-xs text-slate-500 mt-0.5 truncate">
                                            ID: {sub.id.slice(0, 8)}...
                                          </p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <div className="text-center py-6 bg-white rounded-xl border-2 border-dashed border-slate-300">
                                    <div className="bg-slate-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2">
                                      <Package className="w-6 h-6 text-slate-400" />
                                    </div>
                                    <p className="text-slate-600 font-medium text-sm">No subcategories yet</p>
                                    <p className="text-xs text-slate-500 mt-1">Click "Add Sub" to create one</p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Desktop View */}
                      <div className="hidden lg:block overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-slate-50 hover:bg-slate-50">
                              <TableHead className="w-12"></TableHead>
                              <TableHead className="font-semibold">Category Name</TableHead>
                              <TableHead className="font-semibold">Subcategories</TableHead>
                              <TableHead className="text-right font-semibold">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {categories.map((category : any) => (
                              <React.Fragment key={category.id}>
                                <TableRow 
                                  className="hover:bg-blue-50 cursor-pointer transition-colors"
                                  onClick={() => toggleCategory(category.id)}
                                >
                                  <TableCell>
                                    <div className="flex items-center justify-center">
                                      <ChevronRight
                                        className={`w-5 h-5 text-slate-600 transition-transform duration-200 ${
                                          expandedCategories.has(category.id) ? 'rotate-90' : ''
                                        }`}
                                      />
                                    </div>
                                  </TableCell>
                                  <TableCell className="font-semibold text-slate-900 text-base">
                                    <div className="flex items-center gap-2">
                                      <Package className="w-5 h-5 text-blue-600" />
                                      {category.name}
                                    </div>
                                  </TableCell>
                                  <TableCell>
                                    <Badge variant="secondary" className="bg-blue-100 text-blue-700 font-medium">
                                      {subcategoriesData[category.id]?.length || category.children?.length || 0} subcategories
                                    </Badge>
                                  </TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openSubcategoryDialog(category.id);
                                      }}
                                      className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 border-0 text-white shadow-md"
                                    >
                                      <Plus className="w-3 h-3" />
                                      Add Subcategory
                                    </Button>
                                  </TableCell>
                                </TableRow>
                                
                                {expandedCategories.has(category.id) && (
                                  <TableRow>
                                    <TableCell colSpan={4} className="bg-gradient-to-r from-slate-50 to-blue-50 p-0">
                                      <div className="px-12 py-6">
                                        {loadingSubcategories[category.id] ? (
                                          <div className="flex items-center justify-center py-8">
                                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                                            <span className="ml-2 text-slate-600">Loading subcategories...</span>
                                          </div>
                                        ) : subcategoriesData[category.id]?.length > 0 ? (
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {subcategoriesData[category.id].map((sub) => (
                                              <div
                                                key={sub.id}
                                                className="flex items-center gap-4 p-4 bg-white rounded-xl border-2 border-slate-200 hover:border-blue-300 hover:shadow-lg transition-all duration-200"
                                              >
                                                {sub.imageUrl ? (
                                                  <img
                                                    src={sub.imageUrl}
                                                    alt=""
                                                    className="w-16 h-16 rounded-lg object-cover shadow-md"
                                                  />
                                                ) : (
                                                  <div className="w-16 h-16 bg-gradient-to-br from-slate-200 to-slate-300 rounded-lg flex items-center justify-center shadow-md">
                                                    <Image className="w-8 h-8 text-slate-500" />
                                                  </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                  <p className="font-semibold text-slate-800 truncate">{sub.name}</p>
                                                  <p className="text-xs text-slate-500 mt-1">
                                                    ID: {sub.id.slice(0, 8)}...
                                                  </p>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        ) : (
                                          <div className="text-center py-8 bg-white rounded-xl border-2 border-dashed border-slate-300">
                                            <div className="bg-slate-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                              <Package className="w-8 h-8 text-slate-400" />
                                            </div>
                                            <p className="text-slate-600 font-medium">No subcategories yet</p>
                                            <p className="text-sm text-slate-500 mt-1">Click "Add Subcategory" to create one</p>
                                          </div>
                                        )}
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                )}
                              </React.Fragment>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
      
              {/* Subcategory Dialog - Responsive */}
              <Dialog open={subcategoryDialogOpen} onOpenChange={setSubcategoryDialogOpen}>
                <DialogContent className='bg-white max-w-[95vw] sm:max-w-md'>
                  <DialogHeader>
                    <DialogTitle className="text-xl sm:text-2xl">Create New Subcategory</DialogTitle>
                    <DialogDescription className="text-sm">
                      Add a new subcategory with an image
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="subcategoryName" className="text-sm sm:text-base font-medium">Subcategory Name</Label>
                      <Input
                        id="subcategoryName"
                        placeholder="e.g., Smartphones, T-Shirts"
                        value={subcategoryName}
                        onChange={(e) => setSubcategoryName(e.target.value)}
                        className="h-10 sm:h-11 text-sm sm:text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subcategoryImage" className="text-sm sm:text-base font-medium">Image</Label>
                      <Input
                        id="subcategoryImage"
                        type="file"
                        accept="image/*"
                        onChange={(e:any) => setSubcategoryImage(e.target.files[0])}
                        className="h-10 sm:h-11 cursor-pointer text-sm"
                      />
                      {subcategoryImage && (
                        <p className="text-sm text-green-600 font-medium">✓ {subcategoryImage.name}</p>
                      )}
                      <p className="text-xs text-slate-500">Upload an image (PNG, JPG, or WebP)</p>
                    </div>
                  </div>
                  <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSubcategoryDialogOpen(false);
                        setSubcategoryName('');
                        setSubcategoryImage(null);
                      }}
                      className="w-full sm:w-auto"
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleSubcategorySubmit} 
                      disabled={subcategoryLoading || !subcategoryName.trim() || !subcategoryImage} 
                      className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white w-full sm:w-auto'
                    >
                      {subcategoryLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                      Create Subcategory
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
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

export default CategoryManagement;