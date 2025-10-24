"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ChevronRight, Package, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FooterPart from "@/components/FooterPart";
import { Spinner } from "@/components/ui/spinner";

const AllCategoriesPage = () => {
  const router = useRouter();
  const API_BASE_URL = "http://localhost:8000/api/v1";

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const storedUserId = localStorage.getItem("arttagUserId");
    if (storedUserId) {
      setUserId(storedUserId);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (userId) {
      fetchCategories();
    }
  }, [userId]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/category/${userId}/get/all/category`
      );
      const data = await response.json();

      if (data.success) {
        setCategories(data.category);
      } else {
        setError(data.message || "Failed to fetch categories");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Error while getting all categories, please try again later!");
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryId) => {
    window.location.href = `/product/category/${categoryId}`;
  };

  // Loading UI
  if (loading) {
    return (
        <div>
        <Navbar></Navbar>
        <div className="min-h-screen bg-white flex items-center justify-center">
    
   <div className="flex flex-col items-center">
    <Spinner className='text-blue-700 text-5xl'></Spinner>
    <p className="text-gray-600 text-sm">Loading categories</p>
    </div>
  </div>
    </div>
  
    );
  }

  // Error UI
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-7xl mx-auto">
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <button
            onClick={fetchCategories}
            className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main Content
  return (
    <div>
         <Navbar></Navbar>
         <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
       
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            All Categories
          </h1>
          <p className="text-slate-600 text-lg">
            Explore our wide range of product categories
          </p>
        </div>

        {categories.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">No categories available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="group cursor-pointer hover:shadow-xl transition-all duration-300 border-slate-200 hover:border-slate-300 bg-white"
                onClick={() => handleCategoryClick(category.id)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {category.name}
                      </CardTitle>
                      {category.description && (
                        <CardDescription className="mt-2 text-slate-600">
                          {category.description}
                        </CardDescription>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardHeader>

                {category.children && category.children.length > 0 && (
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-700">
                        Subcategories:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {category.children.slice(0, 5).map((child) => (
                          <Badge
                            key={child.id}
                            variant="secondary"
                            className="bg-slate-100 text-slate-700 hover:bg-slate-200"
                          >
                            {child.name}
                          </Badge>
                        ))}
                        {category.children.length > 5 && (
                          <Badge
                            variant="secondary"
                            className="bg-slate-100 text-slate-700"
                          >
                            +{category.children.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        {categories.length > 0 && (
          <div className="mt-12 text-center">
            <p className="text-slate-600">
              Showing {categories.length}{" "}
              {categories.length === 1 ? "category" : "categories"}
            </p>
          </div>
        )}
      </div>
    </div>
    <FooterPart></FooterPart>
    </div>
    
  );
}

export default AllCategoriesPage ;