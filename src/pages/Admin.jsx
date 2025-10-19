import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, RefreshCw, Trash2, Package, TrendingUp, DollarSign, ShoppingBag, AlertCircle } from 'lucide-react';
import { ORDER_STATUSES } from '../data/products';
import { ordersAPI } from '../services/api';
import { formatPrice, formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Admin() {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    revenue: 0,
    pending: 0,
    delivered: 0
  });

  // Check if user is admin
  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    if (!isAdmin) {
      alert('Access denied. Admin only.');
      navigate('/');
      return;
    }
  }, [user, isAdmin, navigate]);

  const loadOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await ordersAPI.getOrders();
      const allOrders = response.orders || [];
      setOrders(allOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      
      // Calculate stats
      const total = allOrders.length;
      const revenue = allOrders.reduce((sum, order) => sum + order.totalPrice, 0);
      const pending = allOrders.filter(o => o.status !== 'delivered').length;
      const delivered = allOrders.filter(o => o.status === 'delivered').length;
      
      setStats({ total, revenue, pending, delivered });
    } catch (err) {
      console.error('Error loading orders:', err);
      setError(err.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      loadOrders();
    }
  }, [user, isAdmin]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (err) {
      alert('Failed to update order status: ' + err.message);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await ordersAPI.deleteOrder(orderId);
        loadOrders();
      } catch (err) {
        alert('Failed to delete order: ' + err.message);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to delete ALL orders? This cannot be undone!')) {
      try {
        // Delete all orders one by one (or implement a bulk delete endpoint)
        for (const order of orders) {
          await ordersAPI.deleteOrder(order.orderId);
        }
        loadOrders();
      } catch (err) {
        alert('Failed to clear orders: ' + err.message);
      }
    }
  };

  // Show loading state
  if (loading && orders.length === 0) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      received: 'bg-blue-100 text-blue-700',
      preparing: 'bg-yellow-100 text-yellow-700',
      out_for_delivery: 'bg-purple-100 text-purple-700',
      delivered: 'bg-green-100 text-green-700'
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const statCards = [
    {
      title: 'Total Orders',
      value: stats.total,
      icon: ShoppingBag,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Revenue',
      value: formatPrice(stats.revenue),
      icon: DollarSign,
      color: 'from-green-500 to-green-600',
      textColor: 'text-green-600'
    },
    {
      title: 'Pending Orders',
      value: stats.pending,
      icon: Package,
      color: 'from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-600'
    },
    {
      title: 'Delivered',
      value: stats.delivered,
      icon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600'
    }
  ];

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-12 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">Manage orders and track business metrics</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={loadOrders}
                disabled={loading}
                className="btn-secondary flex items-center space-x-2 disabled:opacity-50"
              >
                <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                <span>Refresh</span>
              </button>
              {orders.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center space-x-2"
                >
                  <Trash2 size={18} />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center`}>
                  <stat.icon className="text-white" size={24} />
                </div>
              </div>
              <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
              <p className={`text-3xl font-bold ${stat.textColor}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900">All Orders</h2>
            <p className="text-gray-600 mt-1">Manage and update order statuses</p>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 text-center">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
              <p className="text-gray-500">Orders will appear here once customers place them</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-mono font-semibold text-primary-600">{order.id}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-semibold text-gray-900">{order.name}</div>
                          <div className="text-sm text-gray-500">{order.phone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-gray-900">{order.productName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-semibold">{order.quantity}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-primary-600">{formatPrice(order.totalPrice)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)} border-0 cursor-pointer`}
                        >
                          {Object.entries(ORDER_STATUSES).map(([key, status]) => (
                            <option key={key} value={key}>
                              {status.icon} {status.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete order"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Demo Mode</h3>
          <p className="text-blue-700 text-sm">
            This is a demo admin panel. In production, this would be protected with authentication 
            and would have additional features like analytics, customer management, and reporting.
          </p>
        </div>
      </div>
    </div>
  );
}
