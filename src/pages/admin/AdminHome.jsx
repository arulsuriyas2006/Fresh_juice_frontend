import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, DollarSign, Package, TrendingUp, Eye, Calendar } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { ordersAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../lib/utils';
import { ORDER_STATUSES } from '../../data/products';

export default function AdminHome() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    pendingOrders: 0,
    deliveredOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [productStats, setProductStats] = useState([]);
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'week', 'month', 'year'
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getOrders();
      const allOrders = response.orders || [];

      // Filter orders based on time
      const filteredOrders = filterOrdersByTime(allOrders, timeFilter);

      // Calculate stats
      const uniqueOrders = {};
      let totalAmount = 0;
      const productCount = {};

      filteredOrders.forEach(order => {
        if (!uniqueOrders[order.orderId]) {
          uniqueOrders[order.orderId] = order;
        }
        totalAmount += order.totalPrice || 0;

        // Count products
        if (productCount[order.productName]) {
          productCount[order.productName] += order.quantity;
        } else {
          productCount[order.productName] = order.quantity;
        }
      });

      const ordersList = Object.values(uniqueOrders);
      const pendingCount = ordersList.filter(o => o.status === 'received' || o.status === 'preparing').length;
      const deliveredCount = ordersList.filter(o => o.status === 'delivered').length;

      setStats({
        totalOrders: ordersList.length,
        totalSales: totalAmount,
        pendingOrders: pendingCount,
        deliveredOrders: deliveredCount
      });

      // Product stats for chart
      const productStatsArray = Object.entries(productCount).map(([name, count]) => ({
        name,
        count
      })).sort((a, b) => b.count - a.count);

      setProductStats(productStatsArray);

      // Recent orders (last 10)
      setRecentOrders(ordersList.slice(0, 10));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByTime = (orders, filter) => {
    if (filter === 'all') return orders;

    const now = new Date();
    const filtered = orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
      switch (filter) {
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          return orderDate >= monthAgo;
        case 'year':
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
          return orderDate >= yearAgo;
        default:
          return true;
      }
    });

    return filtered;
  };

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
  };

  return (
    <AdminLayout>
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome to your admin dashboard</p>
        </div>

        {/* Time Filter */}
        <div className="mb-6 flex items-center space-x-2">
          <Calendar className="text-gray-600" size={20} />
          <span className="text-sm font-medium text-gray-700">Filter by:</span>
          <div className="flex space-x-2">
            {['all', 'week', 'month', 'year'].map((filter) => (
              <button
                key={filter}
                onClick={() => setTimeFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeFilter === filter
                    ? 'bg-primary-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {filter === 'all' ? 'All Time' : filter === 'week' ? 'This Week' : filter === 'month' ? 'This Month' : 'This Year'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading dashboard...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="text-blue-600" size={24} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalOrders}</h3>
                <p className="text-sm text-gray-600">Total Orders</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="text-green-600" size={24} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{formatPrice(stats.totalSales)}</h3>
                <p className="text-sm text-gray-600">Total Sales</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Package className="text-yellow-600" size={24} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.pendingOrders}</h3>
                <p className="text-sm text-gray-600">Pending Orders</p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-purple-600" size={24} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.deliveredOrders}</h3>
                <p className="text-sm text-gray-600">Delivered Orders</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bar Chart - Product-wise Sales */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Product-wise Sales (Bar Chart)</h2>
                <div className="h-80">
                  {productStats.length > 0 ? (
                    <div className="flex items-end justify-around h-full space-x-4 pb-8">
                      {productStats.map((product, index) => {
                        const maxCount = Math.max(...productStats.map(p => p.count));
                        const heightPercentage = (product.count / maxCount) * 100;
                        const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500'];
                        
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center">
                            <div className="w-full flex flex-col items-center justify-end h-full">
                              <span className="text-sm font-bold text-gray-900 mb-2">{product.count}</span>
                              <div
                                className={`w-full ${colors[index % colors.length]} rounded-t-lg transition-all duration-500 hover:opacity-80 cursor-pointer relative group`}
                                style={{ height: `${heightPercentage}%`, minHeight: '20px' }}
                              >
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                  {product.count} sold
                                </div>
                              </div>
                            </div>
                            <p className="text-xs text-gray-600 mt-2 text-center line-clamp-2">{product.name}</p>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                      No data available
                    </div>
                  )}
                </div>
              </div>

              {/* Pie Chart - Product Distribution */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Sales Distribution (Pie Chart)</h2>
                <div className="h-80 flex items-center justify-center">
                  {productStats.length > 0 ? (
                    <div className="relative">
                      <svg width="280" height="280" viewBox="0 0 280 280" className="transform -rotate-90">
                        {(() => {
                          const total = productStats.reduce((sum, p) => sum + p.count, 0);
                          let currentAngle = 0;
                          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
                          
                          return productStats.map((product, index) => {
                            const percentage = (product.count / total) * 100;
                            const angle = (percentage / 100) * 360;
                            const startAngle = currentAngle;
                            const endAngle = currentAngle + angle;
                            
                            currentAngle = endAngle;
                            
                            // Calculate path for pie slice
                            const startRad = (startAngle * Math.PI) / 180;
                            const endRad = (endAngle * Math.PI) / 180;
                            const x1 = 140 + 120 * Math.cos(startRad);
                            const y1 = 140 + 120 * Math.sin(startRad);
                            const x2 = 140 + 120 * Math.cos(endRad);
                            const y2 = 140 + 120 * Math.sin(endRad);
                            const largeArc = angle > 180 ? 1 : 0;
                            
                            return (
                              <g key={index}>
                                <path
                                  d={`M 140 140 L ${x1} ${y1} A 120 120 0 ${largeArc} 1 ${x2} ${y2} Z`}
                                  fill={colors[index % colors.length]}
                                  className="hover:opacity-80 transition-opacity cursor-pointer"
                                  stroke="white"
                                  strokeWidth="2"
                                >
                                  <title>{product.name}: {product.count} ({percentage.toFixed(1)}%)</title>
                                </path>
                              </g>
                            );
                          });
                        })()}
                      </svg>
                      
                      {/* Legend */}
                      <div className="absolute -right-40 top-0 space-y-2">
                        {productStats.map((product, index) => {
                          const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];
                          const total = productStats.reduce((sum, p) => sum + p.count, 0);
                          const percentage = ((product.count / total) * 100).toFixed(1);
                          
                          return (
                            <div key={index} className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded"
                                style={{ backgroundColor: colors[index % colors.length] }}
                              ></div>
                              <div className="text-xs">
                                <p className="font-medium text-gray-900">{product.name}</p>
                                <p className="text-gray-600">{product.count} ({percentage}%)</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-400">No data available</div>
                  )}
                </div>
              </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Orders</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Customer</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.orderId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">{order.orderId}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{order.name}</td>
                        <td className="py-3 px-4 text-sm text-gray-700">{order.productName}</td>
                        <td className="py-3 px-4 text-sm font-semibold text-gray-900">{formatPrice(order.totalPrice)}</td>
                        <td className="py-3 px-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-700' :
                            order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {ORDER_STATUSES[order.status]?.label || order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
                          >
                            <Eye size={16} />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedOrder.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      selectedOrder.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {ORDER_STATUSES[selectedOrder.status]?.label || selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Product</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.productName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Quantity</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Mode</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{selectedOrder.paymentMode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-semibold text-primary-600">{formatPrice(selectedOrder.totalPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="text-sm text-gray-700">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm text-gray-700">{formatDate(selectedOrder.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
