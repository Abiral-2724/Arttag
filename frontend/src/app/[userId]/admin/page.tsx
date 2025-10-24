'use client'
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Package, Grid3x3, ShoppingCart, BarChart3, Users, Settings, Menu, X, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, LabelList, Line, LineChart, Pie, PieChart, XAxis, YAxis } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import axios from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import Navbar from '@/components/Navbar';
import FooterPart from '@/components/FooterPart';

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isChecking, setIsChecking] = useState(true);

  const API_BASE_URL = 'https://ecommerce-v628.onrender.com/api/v1';
  const { userId } = useParams();
 
const router = useRouter() ; 

const handleViewproduct = () => {
  router.push(`/${userId}/admin/product`);
};
const handleviewCategory = () => {
  router.push(`/${userId}/admin/category`);
};
const handleviewOrder = () => {
  router.push(`/${userId}/admin/orders`);
};

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


  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      // Replace with your actual API endpoint
      const response = await fetch('https://ecommerce-v628.onrender.com/api/v1/product/all/website/details');
      const data = await response.json();
      
      if (data.success) {
        setDashboardData(data.data);
      } else {
        setError(data.message || 'Failed to fetch dashboard data');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculatePercentageChange = (current, lastMonth) => {
    if (lastMonth === 0) return { value: '+100%', positive: true };
    const change = ((current - lastMonth) / lastMonth) * 100;
    return { 
      value: `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`,
      positive: change >= 0
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const ordersChartConfig = {
    orders: {
      label: "Orders",
      color: "blue",
    },
  };

  const revenueChartConfig = {
    revenue: {
      label: "Revenue",
      color: "red",
    },
  };

  const orderStatusChartConfig = {
    visitors: { label: "Orders" },
    pending: { label: "Pending", color: "orange" },
    processing: { label: "Processing", color: "blue" },
    completed: { label: "Completed", color: "green" },
    cancelled: { label: "Cancelled", color: "red" },
  };

  const orderStatusData = [
    { status: "pending", count: 45, fill: "orange" },
    { status: "processing", count: 89, fill: "blue" },
    { status: "completed", count: 320, fill: "green" },
    { status: "cancelled", count: 12, fill: "red" },
  ];

  const totalOrders = orderStatusData.reduce((sum, item) => sum + item.count, 0);

  if (loading) {
    return (
      <>
         {
        isChecking ? (
          <div className="flex flex-col items-center justify-center h-screen gap-2 text-lg font-medium">
          <Spinner className='text-blue-700 text-5xl'></Spinner>
          <p className="text-gray-600 text-sm">Verifying request</p>
        </div>  ) : (<div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-medium">Loading dashboard data...</p>
          </div>
        </div>)
      }
      </>
   
      
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            {error}
            <Button onClick={fetchDashboardData} className="mt-4 w-full">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total Products',
      value: dashboardData?.totalProducts || 0,
      change: calculatePercentageChange(
        dashboardData?.totalProducts || 0,
        dashboardData?.productsLastMonth || 0
      ),
      icon: Package,
      bgColor: 'bg-blue-500',
    },
    {
      label: 'Categories',
      value: dashboardData?.totalCategories || 0,
      change: { value: `+${dashboardData?.categoriesLastMonth || 0}`, positive: true },
      icon: Grid3x3,
      bgColor: 'bg-purple-500',
    },
    {
      label: 'Total Orders',
      value: dashboardData?.totalOrders || 0,
      change: { value: `+${dashboardData?.ordersLastMonth || 0} last month`, positive: true },
      icon: ShoppingCart,
      bgColor: 'bg-orange-500',
    },
    {
      label: 'Total Revenue',
      value: formatCurrency(dashboardData?.totalRevenue || 0),
      change: calculatePercentageChange(
        dashboardData?.totalRevenue || 0,
        dashboardData?.monthlyTrends?.[dashboardData.monthlyTrends.length - 2]?.revenue || 0
      ),
      icon: DollarSign,
      bgColor: 'bg-green-500',
    },
  ];

  const navigationItems = [
    { id: 'products', label: 'View Products', icon: Package, description: 'Manage your product catalog', color: 'blue' ,function : handleViewproduct },
    { id: 'categories', label: 'View Categories', icon: Grid3x3, description: 'Organize product categories', color: 'purple' ,function: handleviewCategory },
    { id: 'orders', label: 'View Orders', icon: ShoppingCart, description: 'Track and manage orders', color: 'orange' , function : handleviewOrder},
  ];

  const handleclickhome = () => {
    router.push('/')
  }

  return (
    <div>
<div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Navbar></Navbar>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardDescription className="text-sm font-medium">
                    {stat.label}
                  </CardDescription>
                  <div className={`h-10 w-10 rounded-full ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className={`text-xs font-medium mt-1 flex items-center gap-1 ${stat.change.positive ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.change.value}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Monthly Orders Bar Chart */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Monthly Orders</CardTitle>
              <CardDescription>Total orders placed each month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={ordersChartConfig}>
                <BarChart
                  accessibilityLayer
                  data={dashboardData?.monthlyTrends || []}
                  layout="vertical"
                  margin={{ right: 16 }}
                >
                  <CartesianGrid horizontal={false} />
                  <YAxis
                    dataKey="month"
                    type="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value.slice(0, 3)}
                    hide
                  />
                  <XAxis dataKey="orders" type="number" hide />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Bar dataKey="orders" layout="vertical" fill="blue" radius={4}>
                    <LabelList dataKey="month" position="insideLeft" offset={8} fontSize={12} fill="white" />
                    <LabelList dataKey="orders" position="right" offset={8} fontSize={12} />
                  </Bar>
                </BarChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 leading-none font-medium">
                {dashboardData?.ordersLastMonth > 0 ? 'Orders trend is stable' : 'Growing steadily'} <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-gray-500 leading-none">
                Showing orders for the last 12 months
              </div>
            </CardFooter>
          </Card>

          {/* Order Status Pie Chart */}
          <Card className="flex flex-col">
            <CardHeader className="items-center pb-0">
              <CardTitle>Order Status</CardTitle>
              <CardDescription>Current order distribution</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
              <ChartContainer config={orderStatusChartConfig} className="mx-auto aspect-square max-h-[250px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent nameKey="count" hideLabel />} />
                  <Pie data={orderStatusData} dataKey="count">
                    <LabelList dataKey="status" className="fill-white" stroke="none" fontSize={12} />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col gap-2 text-sm">
              <div className="flex items-center gap-2 leading-none font-medium">
                {totalOrders} total orders tracked
              </div>
              <div className="text-gray-500 leading-none">
                Real-time order status breakdown
              </div>
            </CardFooter>
          </Card>

          {/* Revenue Trend Line Chart */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Revenue Trend</CardTitle>
              <CardDescription>Monthly revenue over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent >
              <ChartContainer config={revenueChartConfig} className='mb-[-10px]'>
                <LineChart
                  accessibilityLayer
                  data={dashboardData?.monthlyTrends || []}
                  margin={{ top: 20, left: 12, right: 12 }}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    tickFormatter={(value) => value.slice(0, 3)}
                  />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="line" />} />
                  <Line
                    dataKey="revenue"
                    type="natural"
                    stroke="green"
                    strokeWidth={2}
                    dot={{ fill: "green" }}
                    activeDot={{ r: 6 }}
                  >
                    <LabelList
                      position="top"
                      offset={12}
                      fontSize={12}
                      formatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                    />
                  </Line>
                </LineChart>
              </ChartContainer>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm mt-3">
              <div className="flex gap-2 leading-none font-medium">
                Revenue trending upward <TrendingUp className="h-4 w-4" />
              </div>
              <div className="text-gray-500 leading-none">
                Total revenue: {formatCurrency(dashboardData?.totalRevenue || 0)}
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Main Navigation Cards */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const bgColorClass = `bg-${item.color}-500`;
              const hoverBgClass = `hover:bg-${item.color}-600`;
              return (
                <Card
                  key={item.id}
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-gray-200 hover:border-blue-400 overflow-hidden"
                  onClick={() => setActiveSection(item.id)}
                >
                  <CardHeader className="relative">
                    <div className={`h-14 w-14 rounded-xl ${bgColorClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-xl">{item.label}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="relative">
                    <Button className={`w-full ${bgColorClass} ${hoverBgClass} text-white transition-all duration-300`} 
                    onClick={item.function}
                    >
                      {item.label}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>

    <div className="border-t border-gray-300 my-0"></div>
    <FooterPart></FooterPart>
      
    </div>
    
  );
}