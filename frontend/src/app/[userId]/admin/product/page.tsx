'use client'
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, Upload, X, Eye, Package } from 'lucide-react';
import axios from 'axios';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import Navbar from '@/components/Navbar';
import FooterPart from '@/components/FooterPart';


export default function ProductAdminPortal() {
    const router = useRouter() ; 
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [viewProduct, setViewProduct] = useState(null);
  const [isChecking, setIsChecking] = useState(true);

  const API_BASE_URL = 'https://ecommerce-v628.onrender.com/api/v1';
  const { userId } = useParams();
 


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

  

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDescription: '',
    originalPrice: '',
    discountPrice: '',
    type: '',
    tags: '',
    material: '',
    dimensions: '',
    weight: '',
    packageContent: '',
    care: '',
    countryOfOrigin: '',
    manufacturerName: '',
    packerName: '',
    importerName: '',
    delivery: '',
    caseOnDeliveryAvailability: 'false',
    returnDetails: '',
    categoryId: '',
    subcategoryId: ''
  });

  const [colors, setColors] = useState([{ name: '', hex: '#000000', images: [] }]);
  const [modelImages, setModelImages] = useState([]);
  const [modelImageDescriptions, setModelImageDescriptions] = useState([]);
  const [primaryImage1, setPrimaryImage1] = useState(null);
  const [primaryImage2, setPrimaryImage2] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/product/get/all/product`);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (error) {
      showAlert('Failed to fetch products', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/category/${userId}/get/all/category`);
      if (response.data.success) {
        setCategories(response.data.category);
      }
    } catch (error) {
      showAlert('Failed to fetch categories', 'error');
    }
  };

  const fetchSubcategories = async (categoryId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/category/get/${categoryId}/all/subcategory`);
      if (response.data.success) {
        setSubcategories(response.data.subcategories);
      }
    } catch (error) {
      setSubcategories([]);
    }
  };

  const showAlert = (message, type = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: 'success' }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (categoryId) => {
    setFormData(prev => ({ ...prev, categoryId, subcategoryId: '' }));
    fetchSubcategories(categoryId);
  };

  const handleColorChange = (index, field, value) => {
    const newColors = [...colors];
    newColors[index][field] = value;
    setColors(newColors);
  };

  const addColor = () => {
    setColors([...colors, { name: '', hex: '#000000', images: [] }]);
  };

  const removeColor = (index) => {
    setColors(colors.filter((_, i) => i !== index));
  };

  const handleColorImageUpload = (index, files) => {
    const newColors = [...colors];
    newColors[index].images = [...newColors[index].images, ...Array.from(files)];
    setColors(newColors);
  };

  const removeColorImage = (colorIndex, imageIndex) => {
    const newColors = [...colors];
    newColors[colorIndex].images = newColors[colorIndex].images.filter((_, i) => i !== imageIndex);
    setColors(newColors);
  };

  const handleModelImageUpload = (files) => {
    const newImages = Array.from(files);
    setModelImages([...modelImages, ...newImages]);
    setModelImageDescriptions([...modelImageDescriptions, ...newImages.map(() => 'Model Image')]);
  };

  const removeModelImage = (index) => {
    setModelImages(modelImages.filter((_, i) => i !== index));
    setModelImageDescriptions(modelImageDescriptions.filter((_, i) => i !== index));
  };

  const updateModelImageDescription = (index, description) => {
    const newDescriptions = [...modelImageDescriptions];
    newDescriptions[index] = description;
    setModelImageDescriptions(newDescriptions);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.categoryId) {
      showAlert('Please select a category', 'error');
      return;
    }

    const categoryId = formData.subcategoryId || formData.categoryId;

    try {
      setLoading(true);
      const formDataToSend = new FormData();

      // Add all text fields
      Object.keys(formData).forEach(key => {
        if (key !== 'categoryId' && key !== 'subcategoryId') {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Add primary images
      if (primaryImage1) formDataToSend.append('primaryImage1', primaryImage1);
      if (primaryImage2) formDataToSend.append('primaryImage2', primaryImage2);

      // Add model images
      modelImages.forEach(image => {
        formDataToSend.append('modelImages', image);
      });
      formDataToSend.append('modelImageDescriptions', JSON.stringify(modelImageDescriptions));

      // Add colors
      const colorData = colors.map(({ images, ...color }) => color);
      formDataToSend.append('colors', JSON.stringify(colorData));

      // Add color images
      colors.forEach((color, index) => {
        color.images.forEach((image, imgIndex) => {
          formDataToSend.append(`color_${color.name}_image${imgIndex}`, image);
        });
      });

      const response = await axios.post(
        `${API_BASE_URL}/product/admin/${userId}/add/product/${categoryId}`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        showAlert('Product added successfully!', 'success');
        resetForm();
        setIsAddDialogOpen(false);
        fetchProducts();
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to add product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      setLoading(true);
      const response = await axios.delete(`${API_BASE_URL}/product/${userId}/delete/product`, {
        data: { productId }
      });

      if (response.data.success) {
        showAlert('Product deleted successfully!', 'success');
        fetchProducts();
      }
    } catch (error) {
      showAlert(error.response?.data?.message || 'Failed to delete product', 'error');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', description: '', shortDescription: '', originalPrice: '',
      discountPrice: '', type: '', tags: '', material: '', dimensions: '',
      weight: '', packageContent: '', care: '', countryOfOrigin: '',
      manufacturerName: '', packerName: '', importerName: '', delivery: '',
      caseOnDeliveryAvailability: 'false', returnDetails: '', categoryId: '', subcategoryId: ''
    });
    setColors([{ name: '', hex: '#000000', images: [] }]);
    setModelImages([]);
    setModelImageDescriptions([]);
    setPrimaryImage1(null);
    setPrimaryImage2(null);
  };

  const handleViewCategory = () => {
    router.push(`/${userId}/admin/category`);
  };
  const handleOrderCategory = () => {
    router.push(`/${userId}/admin/orders`);
  };

  return (
    <div>
        {
            isChecking ? (
                <div className="flex flex-col items-center justify-center h-screen gap-2 text-lg font-medium px-4">
                <Spinner className='text-blue-700 text-5xl'></Spinner>
                <p className="text-gray-600 text-sm">Verifying request</p>
              </div>  ) : (
                <div>
      <div>
                    <Navbar></Navbar>
                    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6">

<div className="max-w-7xl mx-auto">
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
    <div>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Product Management</h1>
      <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage your e-commerce products</p>
    </div>
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
      <Button className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm sm:text-base px-3 py-2" 
       onClick={handleViewCategory}
      >
          View category
        </Button>
      
        <Button className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm sm:text-base px-3 py-2"
         onClick={handleOrderCategory}
        >
          View orders
        </Button>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center justify-center gap-2 bg-blue-800 text-white text-sm sm:text-base px-3 py-2">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
        
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-4xl max-h-[90vh] overflow-y-auto bg-amber-100">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Add New Product</DialogTitle>
          <DialogDescription className="text-sm">Fill in the product details below</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1">
              <TabsTrigger value="basic" className="text-xs sm:text-sm">Basic Info</TabsTrigger>
              <TabsTrigger value="details" className="text-xs sm:text-sm">Details</TabsTrigger>
              <TabsTrigger value="images" className="text-xs sm:text-sm">Images</TabsTrigger>
              <TabsTrigger value="colors" className="text-xs sm:text-sm">Colors</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm">Product Name *</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type" className="text-sm">Type</Label>
                  <Input id="type" name="type" value={formData.type} onChange={handleInputChange} className="text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription" className="text-sm">Short Description</Label>
                <Input id="shortDescription" name="shortDescription" value={formData.shortDescription} onChange={handleInputChange} className="text-sm" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm">Full Description *</Label>
                <Textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} required className="text-sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="originalPrice" className="text-sm">Original Price *</Label>
                  <Input id="originalPrice" name="originalPrice" type="number" step="0.01" value={formData.originalPrice} onChange={handleInputChange} required className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="discountPrice" className="text-sm">Discount Price *</Label>
                  <Input id="discountPrice" name="discountPrice" type="number" step="0.01" value={formData.discountPrice} onChange={handleInputChange} required className="text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryId" className="text-sm">Category *</Label>
                  <Select value={formData.categoryId} onValueChange={handleCategoryChange}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent className='bg-white'>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id} className="text-sm">{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subcategoryId" className="text-sm">Subcategory</Label>
                  <Select value={formData.subcategoryId} onValueChange={(value) => setFormData(prev => ({ ...prev, subcategoryId: value }))} disabled={!formData.categoryId}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
{subcategories?.length === 0 ? (
<p className="text-xs sm:text-sm text-gray-500 px-2 py-1">No subcategories available</p>
) : (
subcategories?.map((sub : any) => (
<SelectItem key={sub.id} value={sub.id} className="text-sm">
  {sub.name}
</SelectItem>
))
)}
</SelectContent>

                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details" className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="material" className="text-sm">Material *</Label>
                  <Input id="material" name="material" value={formData.material} onChange={handleInputChange} required className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dimensions" className="text-sm">Dimensions *</Label>
                  <Input id="dimensions" name="dimensions" value={formData.dimensions} onChange={handleInputChange} required className="text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight" className="text-sm">Weight (kg) *</Label>
                  <Input id="weight" name="weight" type="number" step="0.01" value={formData.weight} onChange={handleInputChange} required className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="countryOfOrigin" className="text-sm">Country of Origin *</Label>
                  <Input id="countryOfOrigin" name="countryOfOrigin" value={formData.countryOfOrigin} onChange={handleInputChange} required className="text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="packageContent" className="text-sm">Package Content *</Label>
                <Textarea id="packageContent" name="packageContent" value={formData.packageContent} onChange={handleInputChange} rows={2} required className="text-sm" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="care" className="text-sm">Care Instructions *</Label>
                <Textarea id="care" name="care" value={formData.care} onChange={handleInputChange} rows={2} required className="text-sm" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manufacturerName" className="text-sm">Manufacturer *</Label>
                  <Input id="manufacturerName" name="manufacturerName" value={formData.manufacturerName} onChange={handleInputChange} required className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="packerName" className="text-sm">Packer *</Label>
                  <Input id="packerName" name="packerName" value={formData.packerName} onChange={handleInputChange} required className="text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="importerName" className="text-sm">Importer *</Label>
                  <Input id="importerName" name="importerName" value={formData.importerName} onChange={handleInputChange} required className="text-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery" className="text-sm">Delivery Information *</Label>
                <Textarea id="delivery" name="delivery" value={formData.delivery} onChange={handleInputChange} rows={2} required className="text-sm" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnDetails" className="text-sm">Return Details *</Label>
                <Textarea id="returnDetails" name="returnDetails" value={formData.returnDetails} onChange={handleInputChange} rows={2} required className="text-sm" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="caseOnDeliveryAvailability" className="text-sm">Cash on Delivery *</Label>
                <Select value={formData.caseOnDeliveryAvailability} onValueChange={(value) => setFormData(prev => ({ ...prev, caseOnDeliveryAvailability: value }))}>
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className='bg-white'>
                    <SelectItem value="true" className="text-sm">Available</SelectItem>
                    <SelectItem value="false" className="text-sm">Not Available</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="images" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm">Primary Image 1</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setPrimaryImage1(e.target.files[0])} className="text-sm" />
                  {primaryImage1 && <p className="text-xs sm:text-sm text-gray-600">{primaryImage1.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Primary Image 2</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setPrimaryImage2(e.target.files[0])} className="text-sm" />
                  {primaryImage2 && <p className="text-xs sm:text-sm text-gray-600">{primaryImage2.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Model Images</Label>
                  <Input type="file" accept="image/*" multiple onChange={(e) => handleModelImageUpload(e.target.files)} className="text-sm" />
                  {modelImages.length > 0 && (
                    <div className="space-y-2 mt-2">
                      {modelImages.map((img, idx) => (
                        <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 p-2 bg-gray-100 rounded">
                          <span className="text-xs sm:text-sm flex-1 break-all">{img.name}</span>
                          <Input
                            placeholder="Description"
                            value={modelImageDescriptions[idx]}
                            onChange={(e) => updateModelImageDescription(idx, e.target.value)}
                            className="w-full sm:max-w-xs text-sm"
                          />
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeModelImage(idx)}>
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="colors" className="space-y-4">
              {colors.map((color, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base sm:text-lg">Color {index + 1}</CardTitle>
                      {colors.length > 1 && (
                        <Button type="button" variant="destructive" size="sm" onClick={() => removeColor(index)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm">Color Name</Label>
                        <Input
                          value={color.name}
                          onChange={(e) => handleColorChange(index, 'name', e.target.value)}
                          placeholder="e.g., Red, Blue"
                          className="text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">Hex Code</Label>
                        <div className="flex gap-2">
                          <Input
                            type="color"
                            value={color.hex}
                            onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                            className="w-16 sm:w-20"
                          />
                          <Input
                            value={color.hex}
                            onChange={(e) => handleColorChange(index, 'hex', e.target.value)}
                            placeholder="#000000"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm">Color Images (Max 5)</Label>
                      <Input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={color.images.length >= 5}
                        onChange={(e) => handleColorImageUpload(index, e.target.files)}
                        className="text-sm"
                      />
                      {color.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                          {color.images.map((img, imgIdx) => (
                            <div key={imgIdx} className="relative p-2 bg-gray-100 rounded text-xs sm:text-sm">
                              <span className="truncate block">{img.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="absolute top-0 right-0"
                                onClick={() => removeColorImage(index, imgIdx)}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button type="button" variant="outline" onClick={addColor} className="w-full bg-blue-800 text-white text-sm sm:text-base">
                <Plus className="w-4 h-4 mr-2" />
                Add Another Color
              </Button>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" className='border-red-700 text-red-900 text-sm sm:text-base' onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className='bg-blue-700 text-white text-sm sm:text-base'>
              {loading ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
      </div>

    
  </div>

  {alert.show && (
    <Alert className={`mb-6 ${alert.type === 'error' ? 'border-red-500 bg-red-50' : 'border-green-500 bg-green-50'}`}>
      <AlertDescription className="text-sm">{alert.message}</AlertDescription>
    </Alert>
  )}

  <Card>
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
        <Package className="w-5 h-5" />
        All Products
      </CardTitle>
      <CardDescription className="text-sm">View and manage all your products</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto -mx-4 sm:mx-0">
        <div className="inline-block min-w-full align-middle">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs sm:text-sm">Name</TableHead>
                <TableHead className="text-xs sm:text-sm hidden md:table-cell">Category</TableHead>
                <TableHead className="text-xs sm:text-sm">Price</TableHead>
                <TableHead className="text-xs sm:text-sm hidden sm:table-cell">Discount</TableHead>
                <TableHead className="text-xs sm:text-sm hidden lg:table-cell">Colors</TableHead>
                <TableHead className="text-xs sm:text-sm hidden xl:table-cell">Orders</TableHead>
                <TableHead className="text-xs sm:text-sm hidden xl:table-cell">Reviews</TableHead>
                <TableHead className="text-xs sm:text-sm">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                  <div className="flex flex-col items-center justify-center gap-2 bg-gray-50">
 <Spinner className='text-blue-700 text-5xl'></Spinner>
  <p className="text-gray-600 text-xs sm:text-sm">Loading Products</p>
</div>
                  </TableCell>
                </TableRow>
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500 text-sm">
                    No products found. Add your first product!
                  </TableCell>
                </TableRow>
              ) : (
                products.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2 sm:gap-3">
                        {product.primaryImage1 && (
                          <img src={product.primaryImage1} alt={product.name} className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0" />
                        )}
                        <div className="min-w-0">
                          <div className="text-xs sm:text-sm truncate">{product.name}</div>
                          {product.type && <Badge variant="secondary" className="mt-1 text-xs">{product.type}</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm hidden md:table-cell">{product.categoryId}</TableCell>
                    <TableCell className="text-xs sm:text-sm">${parseFloat(product.originalPrice).toFixed(2)}</TableCell>
                    <TableCell className="text-green-600 font-semibold text-xs sm:text-sm hidden sm:table-cell">
                      ${parseFloat(product.discountPrice).toFixed(2)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="flex gap-1">
                        {product.colors?.slice(0, 3).map((color, idx) => (
                          <div
                            key={idx}
                            className="w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-gray-300 flex-shrink-0"
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                        {product.colors?.length > 3 && (
                          <span className="text-xs text-gray-500">+{product.colors.length - 3}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <Badge variant="outline" className="text-xs">{product.orderCount || 0}</Badge>
                    </TableCell>
                    <TableCell className="hidden xl:table-cell">
                      <Badge variant="outline" className="text-xs">{product.reviews?.length || 0}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1 sm:gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" onClick={() => setViewProduct(product)} className="p-1 sm:p-2">
                              <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-[95vw] sm:max-w-[90vw] md:max-w-3xl max-h-[90vh] overflow-y-auto bg-yellow-50">
                            <DialogHeader>
                              <DialogTitle className="text-base sm:text-lg">{viewProduct?.name}</DialogTitle>
                            </DialogHeader>
                            {viewProduct && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                  {viewProduct.primaryImage1 && (
                                    <img src={viewProduct.primaryImage1} alt="Primary 1" className="w-full h-40 sm:h-48 object-cover rounded" />
                                  )}
                                  {viewProduct.primaryImage2 && (
                                    <img src={viewProduct.primaryImage2} alt="Primary 2" className="w-full h-40 sm:h-48 object-cover rounded" />
                                  )}
                                </div>
                                <div>
                                  <h3 className="font-semibold mb-2 text-sm sm:text-base">Description</h3>
                                  <p className="text-gray-600 text-xs sm:text-sm">{viewProduct.description}</p>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-xs sm:text-sm">
                                  <div>
                                    <span className="font-semibold">Material:</span> {viewProduct.material}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Dimensions:</span> {viewProduct.dimensions}
                                  </div>
                                  <div>
                                    <span className="font-semibold">Weight:</span> {viewProduct.weight}kg
                                  </div>
                                  <div>
                                    <span className="font-semibold">Origin:</span> {viewProduct.countryOfOrigin}
                                  </div>
                                </div>
                              </div>
                            )}
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => deleteProduct(product.id)}
                          className="p-1 sm:p-2"
                        >
                          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
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
}