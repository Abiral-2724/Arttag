import React from 'react'
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

type Props = {}

const DashboarContent = ({pendingOrders ,ordersLoading ,monthlyOrdersData,orderStatusData,totalRevenue ,products ,orders} : any) => {
  return (
    <>
     <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
                  <p className="text-xs text-slate-500 mt-1">Total earnings</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{orders.length}</div>
                  <p className="text-xs text-slate-500 mt-1">All time orders</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-purple-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Total Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{products.length}</div>
                  <p className="text-xs text-slate-500 mt-1">Active listings</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-slate-600">Pending Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{pendingOrders}</div>
                  <p className="text-xs text-slate-500 mt-1">Requires attention</p>
                </CardContent>
              </Card>
            </div>

            {ordersLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Orders & Revenue</CardTitle>
                      <CardDescription>Orders and revenue trends</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={monthlyOrdersData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis yAxisId="left" />
                          <YAxis yAxisId="right" orientation="right" />
                          <Tooltip />
                          <Legend />
                          <Bar yAxisId="left" dataKey="orders" fill="#3B82F6" name="Orders" />
                          <Bar yAxisId="right" dataKey="revenue" fill="#10B981" name="Revenue ($)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Order Status Distribution</CardTitle>
                      <CardDescription>Current status of all orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={orderStatusData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {orderStatusData.map((entry : any, index : any) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                    <CardDescription>Monthly revenue performance</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={monthlyOrdersData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2} name="Revenue ($)" />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </>
            )}
    </>
  )
}

export default DashboarContent