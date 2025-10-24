'use client'
import React, { useEffect, useState } from 'react'
import axios from 'axios';
import { Plus, Package, ShoppingCart, FolderTree, Trash2, X, Check, ChevronsUpDown, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
type Props = {}

const ProductContent = ({fetchSubcategories ,countProduct} : any) => {
    const API_BASE_URL = 'https://ecommerce-v628.onrender.com/api/v1';
const USER_ID = '615be6a6-3e3f-42bc-aef7-568c064f34ce';

const [productsLoading, setProductsLoading] = useState(false);
const [showAddProductDialog, setShowAddProductDialog] = useState(false);
const [error, setError] = useState('');

const [productForm, setProductForm] = useState({
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
    caseOnDeliveryAvailability: false,
    returnDetails: '',
    categoryId: '',
    primaryImage1: null,
    primaryImage2: null,
    modelImages: [],
    modelImageDescriptions: [],
    colors: []
  });
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/product/get/all/product`);
      if (response.data.success) {
        setProducts(response.data.data);
        countProduct(products.length)
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    
    fetchProducts();
   
  }, []);

  useEffect(() => {
    countProduct(products.length)
  })

  useEffect(() => {
    if (productForm.categoryId) {
      fetchSubcategories(productForm.categoryId);
    }
  }, [productForm.categoryId]);

  const handleAddProduct = async () => {
    setError('');
    
    if (!productForm.name || !productForm.description || !productForm.originalPrice || 
        !productForm.discountPrice || !productForm.material || !productForm.dimensions || 
        !productForm.weight || !productForm.packageContent || !productForm.care || 
        !productForm.countryOfOrigin || !productForm.manufacturerName || 
        !productForm.packerName || !productForm.importerName || !productForm.delivery || 
        !productForm.returnDetails || !productForm.categoryId) {
      setError('Please fill all required fields');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      
      formData.append('name', productForm.name);
      formData.append('description', productForm.description);
      formData.append('shortDescription', productForm.shortDescription || '');
      formData.append('originalPrice', productForm.originalPrice);
      formData.append('discountPrice', productForm.discountPrice);
      formData.append('type', productForm.type || '');
      formData.append('material', productForm.material);
      formData.append('dimensions', productForm.dimensions);
      formData.append('weight', productForm.weight);
      formData.append('packageContent', productForm.packageContent);
      formData.append('care', productForm.care);
      formData.append('countryOfOrigin', productForm.countryOfOrigin);
      formData.append('manufacturerName', productForm.manufacturerName);
      formData.append('packerName', productForm.packerName);
      formData.append('importerName', productForm.importerName);
      formData.append('delivery', productForm.delivery);
      formData.append('caseOnDeliveryAvailability', productForm.caseOnDeliveryAvailability.toString());
      formData.append('returnDetails', productForm.returnDetails);
      
      const tagsArray = productForm.tags ? productForm.tags.split(',').map(t => t.trim()).filter(t => t) : [];
      formData.append('tags', JSON.stringify(tagsArray));
      
      if (productForm.primaryImage1) {
        formData.append('primaryImage1', productForm.primaryImage1);
      }
      if (productForm.primaryImage2) {
        formData.append('primaryImage2', productForm.primaryImage2);
      }
      
      if (productForm.modelImages && productForm.modelImages.length > 0) {
        productForm.modelImages.forEach(file => {
          formData.append('modelImages', file);
        });
      }
      
      if (productForm.modelImageDescriptions && productForm.modelImageDescriptions.length > 0) {
        formData.append('modelImageDescriptions', JSON.stringify(productForm.modelImageDescriptions));
      }
      
      const colorsData = productForm.colors.map(color => ({
        name: color.name ,
        hex: color.hex
      }));
      formData.append('colors', JSON.stringify(colorsData));
      
      productForm.colors.forEach((color) => {
        if (color.images && color.images.length > 0) {
          color.images.forEach(img => {
            formData.append(`color_${color.name}_image`, img);
          });
        }
      });
     
      const response = await axios.post(
        `${API_BASE_URL}/product/admin/${USER_ID}/add/product/${productForm.categoryId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      if (response.data.success) {
        alert('Product added successfully!');
        setShowAddProductDialog(false);
        setProductForm({
          name: '', description: '', shortDescription: '', originalPrice: '', discountPrice: '',
          type: '', tags: '', material: '', dimensions: '', weight: '', packageContent: '',
          care: '', countryOfOrigin: '', manufacturerName: '', packerName: '', importerName: '',
          delivery: '', caseOnDeliveryAvailability: false, returnDetails: '',
          categoryId: '', primaryImage1: null, primaryImage2: null,
          modelImages: [], modelImageDescriptions: [], colors: []
        });
        fetchProducts();
      }
    } catch (error : any) {
      console.error('Error adding product:', error);
      setError(error.response?.data?.message || 'Failed to add product');
      alert('Error: ' + (error.response?.data?.message || 'Failed to add product'));
    } finally {
      setLoading(false);
    }
  };


  const handleDeleteProduct = async (productId : any) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    setLoading(true);
    try {
      const response = await axios.delete(
        `${API_BASE_URL}/product/${USER_ID}/delete/product`,
        {
          data: { productId }
        }
      );

      if (response.data.success) {
        alert('Product deleted successfully!');
        fetchProducts();
      }
    } catch (error : any) {
      console.error('Error deleting product:', error);
      alert('Error: ' + (error.response?.data?.message || 'Failed to delete product'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddColor = () => {
    setProductForm({
      ...productForm,
      colors: [...productForm.colors, { name: '', hex: '#000000', images: [] }]
    });
  };

  return (
    <div>
        <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">Products Management</h2>
              <Dialog open={showAddProductDialog} onOpenChange={setShowAddProductDialog}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Product
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add New Product</DialogTitle>
                    <DialogDescription>Fill in the product details below</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                        {error}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Product Name *</Label>
                        <Input
                          id="name"
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          placeholder="Enter product name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="type">Type</Label>
                        <Input
                          id="type"
                          value={productForm.type}
                          onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                          placeholder="Product type"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="shortDesc">Short Description</Label>
                      <Input
                        id="shortDesc"
                        value={productForm.shortDescription}
                        onChange={(e) => setProductForm({ ...productForm, shortDescription: e.target.value })}
                        placeholder="Brief description"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Full Description *</Label>
                      <Textarea
                        id="description"
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        placeholder="Detailed product description"
                        rows={4}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Category *</Label>
                        <Popover open={openCategory} onOpenChange={setOpenCategory}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openCategory}
                              className="w-full justify-between"
                            >
                              {productForm.categoryId
                                ? categories.find((c) => c.id === productForm.categoryId)?.name
                                : "Select category..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search category..." />
                              <CommandEmpty>
                                <div className="p-2">
                                  <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => {
                                      setShowAddCategoryDialog(true);
                                      setOpenCategory(false);
                                    }}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Category
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {categories.map((category) => (
                                  <CommandItem
                                    key={category.id}
                                    value={category.name}
                                    onSelect={() => {
                                      setProductForm({ ...productForm, categoryId: category.id });
                                      setOpenCategory(false);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        productForm.categoryId === category.id ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {category.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>

                      <div className="space-y-2">
                        <Label>Subcategory (Optional)</Label>
                        <Popover open={openSubcategory} onOpenChange={setOpenSubcategory}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={openSubcategory}
                              className="w-full justify-between"
                              disabled={!productForm.categoryId}
                            >
                              {subcategories.find((s) => s.id === productForm.categoryId)?.name || "Select subcategory..."}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Search subcategory..." />
                              <CommandEmpty>
                                <div className="p-2">
                                  <Button
                                    variant="ghost"
                                    className="w-full"
                                    onClick={() => {
                                      setCategoryForm({ ...categoryForm, parentId: productForm.categoryId });
                                      setShowAddCategoryDialog(true);
                                      setOpenSubcategory(false);
                                    }}
                                  >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add New Subcategory
                                  </Button>
                                </div>
                              </CommandEmpty>
                              <CommandGroup>
                                {subcategories.map((subcategory) => (
                                  <CommandItem
                                    key={subcategory.id}
                                    value={subcategory.name}
                                    onSelect={() => {
                                      setProductForm({ ...productForm, categoryId: subcategory.id });
                                      setOpenSubcategory(false);
                                    }}
                                  >
                                    <Check
                                      className={`mr-2 h-4 w-4 ${
                                        productForm.categoryId === subcategory.id ? "opacity-100" : "opacity-0"
                                      }`}
                                    />
                                    {subcategory.name}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="originalPrice">Original Price *</Label>
                        <Input
                          id="originalPrice"
                          type="number"
                          value={productForm.originalPrice}
                          onChange={(e) => setProductForm({ ...productForm, originalPrice: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="discountPrice">Discount Price *</Label>
                        <Input
                          id="discountPrice"
                          type="number"
                          value={productForm.discountPrice}
                          onChange={(e) => setProductForm({ ...productForm, discountPrice: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="material">Material *</Label>
                        <Input
                          id="material"
                          value={productForm.material}
                          onChange={(e) => setProductForm({ ...productForm, material: e.target.value })}
                          placeholder="e.g., Cotton, Plastic"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dimensions">Dimensions *</Label>
                        <Input
                          id="dimensions"
                          value={productForm.dimensions}
                          onChange={(e) => setProductForm({ ...productForm, dimensions: e.target.value })}
                          placeholder="L x W x H"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="weight">Weight (kg) *</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.01"
                          value={productForm.weight}
                          onChange={(e) => setProductForm({ ...productForm, weight: e.target.value })}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="packageContent">Package Content *</Label>
                        <Input
                          id="packageContent"
                          value={productForm.packageContent}
                          onChange={(e) => setProductForm({ ...productForm, packageContent: e.target.value })}
                          placeholder="What's included"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="care">Care Instructions *</Label>
                        <Input
                          id="care"
                          value={productForm.care}
                          onChange={(e) => setProductForm({ ...productForm, care: e.target.value })}
                          placeholder="How to care"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="countryOfOrigin">Country of Origin *</Label>
                        <Input
                          id="countryOfOrigin"
                          value={productForm.countryOfOrigin}
                          onChange={(e) => setProductForm({ ...productForm, countryOfOrigin: e.target.value })}
                          placeholder="e.g., India"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="manufacturerName">Manufacturer Name *</Label>
                        <Input
                          id="manufacturerName"
                          value={productForm.manufacturerName}
                          onChange={(e) => setProductForm({ ...productForm, manufacturerName: e.target.value })}
                          placeholder="Manufacturer"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="packerName">Packer Name *</Label>
                        <Input
                          id="packerName"
                          value={productForm.packerName}
                          onChange={(e) => setProductForm({ ...productForm, packerName: e.target.value })}
                          placeholder="Packer"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="importerName">Importer Name *</Label>
                        <Input
                          id="importerName"
                          value={productForm.importerName}
                          onChange={(e) => setProductForm({ ...productForm, importerName: e.target.value })}
                          placeholder="Importer"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="delivery">Delivery Info *</Label>
                      <Input
                        id="delivery"
                        value={productForm.delivery}
                        onChange={(e) => setProductForm({ ...productForm, delivery: e.target.value })}
                        placeholder="Delivery details"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="returnDetails">Return Details *</Label>
                      <Textarea
                        id="returnDetails"
                        value={productForm.returnDetails}
                        onChange={(e) => setProductForm({ ...productForm, returnDetails: e.target.value })}
                        placeholder="Return policy"
                        rows={2}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        value={productForm.tags}
                        onChange={(e) => setProductForm({ ...productForm, tags: e.target.value })}
                        placeholder="tag1, tag2, tag3"
                      />
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="cod"
                        checked={productForm.caseOnDeliveryAvailability}
                        onChange={(e) => setProductForm({ ...productForm, caseOnDeliveryAvailability: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="cod">Cash on Delivery Available</Label>
                    </div>

                    <div className="space-y-2">
                      <Label>Primary Images</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="primaryImage1" className="text-sm text-slate-600">Primary Image 1</Label>
                          <Input
                            id="primaryImage1"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProductForm({ ...productForm, primaryImage1: e.target.files[0] })}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="primaryImage2" className="text-sm text-slate-600">Primary Image 2</Label>
                          <Input
                            id="primaryImage2"
                            type="file"
                            accept="image/*"
                            onChange={(e) => setProductForm({ ...productForm, primaryImage2: e.target.files[0] })}
                            className="mt-1"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="modelImages">Model Images (Multiple)</Label>
                      <Input
                        id="modelImages"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files);
                          setProductForm({ 
                            ...productForm, 
                            modelImages: files,
                            modelImageDescriptions: files.map((_, idx) => productForm.modelImageDescriptions[idx] || '')
                          });
                        }}
                      />
                      <p className="text-xs text-slate-500">
                        Selected: {productForm.modelImages.length} image(s)
                      </p>
                    </div>

                    {productForm.modelImages.length > 0 && (
                      <div className="space-y-2">
                        <Label>Model Image Descriptions (Optional)</Label>
                        {productForm.modelImages.map((file, idx) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="text-sm text-slate-600 min-w-[100px] truncate">{file.name}</span>
                            <Input
                              placeholder={`Description for image ${idx + 1}`}
                              value={productForm.modelImageDescriptions[idx] || ''}
                              onChange={(e) => {
                                const newDescriptions = [...productForm.modelImageDescriptions];
                                newDescriptions[idx] = e.target.value;
                                setProductForm({ ...productForm, modelImageDescriptions: newDescriptions });
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Colors & Images</Label>
                        <Button type="button" variant="outline" size="sm" onClick={handleAddColor}>
                          <Plus className="w-4 h-4 mr-1" />
                          Add Color
                        </Button>
                      </div>
                      {productForm.colors.map((color, idx) => (
                        <div key={idx} className="p-4 border rounded-lg space-y-3 bg-slate-50">
                          <div className="flex items-center gap-2 justify-between">
                            <span className="font-medium text-sm">Color {idx + 1}</span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newColors = productForm.colors.filter((_, i) => i !== idx);
                                setProductForm({ ...productForm, colors: newColors });
                              }}
                            >
                              <X className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              placeholder="Color name (e.g., Blue)"
                              value={color.name}
                              onChange={(e) => {
                                const newColors = [...productForm.colors];
                                newColors[idx].name = e.target.value;
                                setProductForm({ ...productForm, colors: newColors });
                              }}
                            />
                            <div className="flex gap-2">
                              <Input
                                type="color"
                                value={color.hex}
                                onChange={(e) => {
                                  const newColors = [...productForm.colors];
                                  newColors[idx].hex = e.target.value;
                                  setProductForm({ ...productForm, colors: newColors });
                                }}
                                className="w-20"
                              />
                              <Input
                                type="text"
                                placeholder="#000000"
                                value={color.hex}
                                onChange={(e) => {
                                  const newColors = [...productForm.colors];
                                  newColors[idx].hex = e.target.value;
                                  setProductForm({ ...productForm, colors: newColors });
                                }}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label className="text-xs">Color Images (up to 5)</Label>
                            <Input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                const files = Array.from(e.target.files).slice(0, 5);
                                const newColors = [...productForm.colors];
                                newColors[idx].images = files;
                                setProductForm({ ...productForm, colors: newColors });
                              }}
                            />
                            <p className="text-xs text-slate-500">
                              {color.images?.length || 0} image(s) selected
                            </p>
                          </div>
                        </div>
                      ))}
                      {productForm.colors.length === 0 && (
                        <p className="text-sm text-slate-500 italic">No colors added yet</p>
                      )}
                    </div>
                  </div>
                  <div className="flex justify-end gap-3">
                    <Button variant="outline" onClick={() => setShowAddProductDialog(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddProduct} className="bg-gradient-to-r from-blue-600 to-purple-600" disabled={loading}>
                      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Add Product
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input placeholder="Search products..." className="pl-10" />
                </div>
                {productsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                  </div>
                ) : products.length === 0 ? (
                  <div className="text-center py-12 text-slate-500">
                    No products found. Add your first product!
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3 font-semibold">Product</th>
                          <th className="text-left p-3 font-semibold">Category</th>
                          <th className="text-left p-3 font-semibold">Price</th>
                          <th className="text-left p-3 font-semibold">Orders</th>
                          <th className="text-left p-3 font-semibold">Status</th>
                          <th className="text-right p-3 font-semibold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products.map((product) => (
                          <tr key={product.id} className="border-b hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={product.primaryImage1 || product.images?.[0]?.url || 'https://via.placeholder.com/50'} 
                                  alt={product.name} 
                                  className="w-12 h-12 rounded-lg object-cover" 
                                />
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                  <div className="text-sm text-slate-500">ID: {product.id.slice(0, 8)}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge variant="secondary">{product.category?.name || 'N/A'}</Badge>
                            </td>
                            <td className="p-3">
                              <div className="font-semibold">${product.discountPrice}</div>
                              <div className="text-xs text-slate-500 line-through">${product.originalPrice}</div>
                            </td>
                            <td className="p-3">
                              <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                                {product.orderCount || 0} orders
                              </Badge>
                            </td>
                            <td className="p-3">
                              <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                                Active
                              </Badge>
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
    </div>
  )
}

export default ProductContent