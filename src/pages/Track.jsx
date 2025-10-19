import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Package, CheckCircle, Clock, Truck, MapPin, Eye, Navigation, ShoppingBag, Calendar, Filter, XCircle } from 'lucide-react';
import { ORDER_STATUSES } from '../data/products';
import { ordersAPI } from '../services/api';
import { formatPrice, formatDate } from '../lib/utils';
import { useAuth } from '../context/AuthContext';

export default function Track() {
  const location = useLocation();
  const { user } = useAuth();
  const preFilledOrderId = location.state?.orderId || '';

  const [view, setView] = useState('list'); // 'list' or 'track'
  const [orderId, setOrderId] = useState(preFilledOrderId);
  const [searchId, setSearchId] = useState('');
  const [order, setOrder] = useState(null);
  const [userOrders, setUserOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'week', 'month', 'custom'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState({});
  const [feedbackData, setFeedbackData] = useState({
    rating: 5,
    comment: ''
  });

  useEffect(() => {
    if (preFilledOrderId) {
      handleSearch(preFilledOrderId);
      setView('track');
    } else if (user?.email) {
      fetchUserOrders();
    }
  }, [preFilledOrderId, user]);

  const fetchUserOrders = async () => {
    if (!user?.email) return;
    
    setLoading(true);
    try {
      const response = await ordersAPI.getOrders();
      // Group orders by orderId
      const groupedOrders = {};
      response.orders.forEach(order => {
        if (!groupedOrders[order.orderId]) {
          groupedOrders[order.orderId] = {
            orderId: order.orderId,
            name: order.name,
            phone: order.phone,
            address: order.address,
            paymentMode: order.paymentMode,
            status: order.status,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            products: [],
            totalAmount: 0
          };
        }
        groupedOrders[order.orderId].products.push({
          productName: order.productName,
          quantity: order.quantity,
          price: order.totalPrice
        });
        groupedOrders[order.orderId].totalAmount += order.totalPrice;
      });
      
      const sortedOrders = Object.values(groupedOrders).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      );
      setUserOrders(sortedOrders);
      setFilteredOrders(sortedOrders);
    } catch (err) {
      console.error('Fetch orders error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter orders based on search query and date filters
  useEffect(() => {
    let filtered = [...userOrders];

    // Apply search filter
    if (orderSearchQuery.trim()) {
      const query = orderSearchQuery.toLowerCase();
      filtered = filtered.filter(order => {
        return (
          order.orderId.toLowerCase().includes(query) ||
          order.name.toLowerCase().includes(query) ||
          order.phone.includes(query) ||
          order.products.some(p => p.productName.toLowerCase().includes(query)) ||
          ORDER_STATUSES[order.status]?.label.toLowerCase().includes(query)
        );
      });
    }

    // Apply date filter
    filtered = filtered.filter(order => {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (dateFilter) {
        case 'today':
          const orderDay = new Date(orderDate);
          orderDay.setHours(0, 0, 0, 0);
          return orderDay.getTime() === today.getTime();

        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;

        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return orderDate >= monthAgo;

        case 'custom':
          if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            return orderDate >= start && orderDate <= end;
          }
          return true;

        case 'byMonth':
          if (selectedMonth && selectedYear) {
            return (
              orderDate.getMonth() === parseInt(selectedMonth) &&
              orderDate.getFullYear() === parseInt(selectedYear)
            );
          }
          return true;

        case 'byYear':
          if (selectedYear) {
            return orderDate.getFullYear() === parseInt(selectedYear);
          }
          return true;

        default:
          return true;
      }
    });

    setFilteredOrders(filtered);
  }, [orderSearchQuery, userOrders, dateFilter, startDate, endDate, selectedMonth, selectedYear]);

  const handleSearch = async (id = searchId) => {
    setError('');
    setOrder(null);

    if (!id.trim()) {
      setError('Please enter an order ID');
      return;
    }

    setLoading(true);
    try {
      const response = await ordersAPI.getOrderById(id.trim());
      setOrder(response.order);
      setOrderId(id.trim());
    } catch (err) {
      console.error('Track order error:', err);
      setError('Order not found. Please check your order ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndex = (status) => {
    // Map status ID to ORDER_STATUSES key
    const statusMap = {
      'received': 'RECEIVED',
      'preparing': 'PREPARING',
      'out_for_delivery': 'OUT_FOR_DELIVERY',
      'delivered': 'DELIVERED'
    };
    
    const statusKey = statusMap[status] || status;
    const statuses = Object.keys(ORDER_STATUSES);
    return statuses.indexOf(statusKey);
  };

  const isStatusCompleted = (statusKey) => {
    if (!order) return false;
    const currentIndex = getStatusIndex(order.status);
    const checkIndex = Object.keys(ORDER_STATUSES).indexOf(statusKey);
    
    // If order is delivered, all steps should be completed (green)
    if (order.status === 'delivered') {
      return true;
    }
    return checkIndex <= currentIndex;
  };

  const isStatusActive = (statusKey) => {
    if (!order) return false;
    const statusMap = {
      'received': 'RECEIVED',
      'preparing': 'PREPARING',
      'out_for_delivery': 'OUT_FOR_DELIVERY',
      'delivered': 'DELIVERED'
    };
    return statusMap[order.status] === statusKey;
  };

  const handleViewOrder = (orderData) => {
    setSelectedOrder(orderData);
  };

  const handleTrackOrder = async (orderIdToTrack) => {
    setView('track');
    setSearchId(orderIdToTrack);
    await handleSearch(orderIdToTrack);
  };

  const handleBackToList = () => {
    setView('list');
    setOrder(null);
    setSelectedOrder(null);
    setError('');
    fetchUserOrders();
  };

  const handleCancelOrder = async (orderIdToCancel) => {
    if (!confirm('Are you sure you want to cancel this order?')) {
      return;
    }

    try {
      setLoading(true);
      await ordersAPI.deleteOrder(orderIdToCancel);
      alert('Order cancelled successfully!');
      fetchUserOrders(); // Refresh the order list
    } catch (error) {
      console.error('Cancel order error:', error);
      alert('Failed to cancel order: ' + (error.message || 'Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  const handleFeedbackSubmit = (e) => {
    e.preventDefault();
    
    // Get existing feedbacks from localStorage
    const existingFeedbacks = JSON.parse(localStorage.getItem('feedbacks') || '[]');
    
    // Create new feedback
    const newFeedback = {
      id: Date.now().toString(),
      orderId: feedbackOrder.orderId,
      customerName: feedbackOrder.name,
      customerEmail: user?.email || 'N/A',
      rating: feedbackData.rating,
      comment: feedbackData.comment,
      createdAt: new Date().toISOString()
    };
    
    // Save to localStorage
    existingFeedbacks.push(newFeedback);
    localStorage.setItem('feedbacks', JSON.stringify(existingFeedbacks));
    
    // Mark as submitted
    setFeedbackSubmitted(prev => ({ ...prev, [feedbackOrder.orderId]: true }));
    
    // Reset and close
    alert('Thank you for your feedback!');
    setShowFeedbackForm(false);
    setFeedbackData({ rating: 5, comment: '' });
    setFeedbackOrder(null);
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            {view === 'list' ? 'My Orders' : 'Track Your Order'}
          </h1>
          <p className="text-xl text-gray-600">
            {view === 'list' ? 'View and track all your orders' : 'See real-time delivery status'}
          </p>
        </div>

        {/* View Toggle */}
        {view === 'track' && (
          <button
            onClick={handleBackToList}
            className="mb-6 text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-2"
          >
            <span>←</span>
            <span>Back to My Orders</span>
          </button>
        )}

        {/* Order List View */}
        {view === 'list' && (
          <div className="space-y-6">
            {/* Search Bar and Filters */}
            {userOrders.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6 animate-slide-up space-y-4">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={orderSearchQuery}
                    onChange={(e) => setOrderSearchQuery(e.target.value)}
                    placeholder="Search by Order ID, Product, Customer Name, or Status..."
                    className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-all duration-200 text-gray-700 placeholder-gray-400"
                  />
                  {orderSearchQuery && (
                    <button
                      onClick={() => setOrderSearchQuery('')}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <span className="text-xl">×</span>
                    </button>
                  )}
                </div>

                {/* Filter Toggle Button */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
                >
                  <Filter size={18} />
                  <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
                </button>

                {/* Filter Options */}
                {showFilters && (
                  <div className="border-t border-gray-200 pt-4 space-y-4">
                    {/* Quick Filters */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quick Filters</label>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setDateFilter('all')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            dateFilter === 'all'
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          All Orders
                        </button>
                        <button
                          onClick={() => setDateFilter('today')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            dateFilter === 'today'
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Today
                        </button>
                        <button
                          onClick={() => setDateFilter('week')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            dateFilter === 'week'
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Last 7 Days
                        </button>
                        <button
                          onClick={() => setDateFilter('month')}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            dateFilter === 'month'
                              ? 'bg-primary-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Last 30 Days
                        </button>
                      </div>
                    </div>

                    {/* Date Range Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Custom Date Range</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Start Date</label>
                          <input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                              setStartDate(e.target.value);
                              if (e.target.value && endDate) setDateFilter('custom');
                            }}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">End Date</label>
                          <input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                              setEndDate(e.target.value);
                              if (startDate && e.target.value) setDateFilter('custom');
                            }}
                            className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Month Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Month</label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <select
                          value={selectedMonth}
                          onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            if (e.target.value && selectedYear) setDateFilter('byMonth');
                          }}
                          className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                        >
                          <option value="">Select Month</option>
                          <option value="0">January</option>
                          <option value="1">February</option>
                          <option value="2">March</option>
                          <option value="3">April</option>
                          <option value="4">May</option>
                          <option value="5">June</option>
                          <option value="6">July</option>
                          <option value="7">August</option>
                          <option value="8">September</option>
                          <option value="9">October</option>
                          <option value="10">November</option>
                          <option value="11">December</option>
                        </select>
                        <select
                          value={selectedYear}
                          onChange={(e) => {
                            setSelectedYear(e.target.value);
                            if (selectedMonth && e.target.value) setDateFilter('byMonth');
                            else if (e.target.value) setDateFilter('byYear');
                          }}
                          className="px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                        >
                          <option value="">Select Year</option>
                          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                            <option key={year} value={year}>{year}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Clear Filters */}
                    <button
                      onClick={() => {
                        setDateFilter('all');
                        setStartDate('');
                        setEndDate('');
                        setSelectedMonth('');
                        setSelectedYear('');
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800 underline"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}

                {/* Results Count */}
                {(orderSearchQuery || dateFilter !== 'all') && (
                  <p className="text-sm text-gray-600">
                    Found <span className="font-semibold text-primary-600">{filteredOrders.length}</span> order(s)
                  </p>
                )}
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading your orders...</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((orderGroup) => (
                <div key={orderGroup.orderId} className="bg-white rounded-xl shadow-md p-6 animate-slide-up hover:shadow-lg transition-shadow border border-gray-100">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Order #{orderGroup.orderId}</h3>
                      <p className="text-sm text-gray-600">{formatDate(orderGroup.createdAt)}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      orderGroup.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      orderGroup.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-700' :
                      orderGroup.status === 'preparing' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {ORDER_STATUSES[orderGroup.status]?.label || orderGroup.status}
                    </span>
                  </div>

                  {/* Products */}
                  <div className="mb-3">
                    {orderGroup.products.map((product, idx) => (
                      <div key={idx} className="flex justify-between items-center py-1">
                        <span className="text-gray-700">{product.productName} × {product.quantity}</span>
                        <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Payment and Total */}
                  <div className="border-t border-gray-200 pt-3 mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Payment:</span>
                      <span className="text-sm font-semibold text-gray-900 capitalize">{orderGroup.paymentMode}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-gray-900">Total:</span>
                      <span className="text-xl font-bold text-primary-600">{formatPrice(orderGroup.totalAmount)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewOrder(orderGroup)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 border-2 border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium"
                    >
                      <Eye size={16} />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => handleTrackOrder(orderGroup.orderId)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium"
                    >
                      <Navigation size={16} />
                      <span>Track</span>
                    </button>
                    {orderGroup.status === 'received' && (
                      <button
                        onClick={() => handleCancelOrder(orderGroup.orderId)}
                        className="flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium"
                      >
                        <XCircle size={16} />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : userOrders.length > 0 ? (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Search size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No orders found
                </h3>
                <p className="text-gray-500 mb-6">
                  No orders match your search "{orderSearchQuery}"
                </p>
                <button
                  onClick={() => setOrderSearchQuery('')}
                  className="btn-secondary inline-block"
                >
                  Clear Search
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
                <Package size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  No orders yet
                </h3>
                <p className="text-gray-500 mb-6">
                  Start ordering fresh juices to see your order history
                </p>
                <a href="/menu" className="btn-primary inline-block">
                  Browse Menu
                </a>
              </div>
            )}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedOrder(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slide-up" onClick={(e) => e.stopPropagation()}>
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
                <div className="bg-primary-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="text-xl font-bold text-primary-600">{selectedOrder.orderId}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Customer Name</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phone Number</p>
                    <p className="font-semibold text-gray-900">{selectedOrder.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Mode</p>
                    <p className="font-semibold text-gray-900 capitalize">{selectedOrder.paymentMode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="font-semibold text-gray-900">{ORDER_STATUSES[selectedOrder.status]?.label}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">Delivery Address</p>
                  <div className="flex items-start space-x-2 bg-gray-50 p-4 rounded-lg">
                    <MapPin size={20} className="text-primary-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-900">{selectedOrder.address}</p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-3">Products</p>
                  <div className="space-y-3">
                    {selectedOrder.products.map((product, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-semibold text-gray-900">{product.productName}</p>
                          <p className="text-sm text-gray-600">Quantity: {product.quantity}</p>
                        </div>
                        <p className="text-lg font-bold text-primary-600">{formatPrice(product.price)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-primary-600">{formatPrice(selectedOrder.totalAmount)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600 mb-1">Order Placed</p>
                    <p className="text-gray-900">{formatDate(selectedOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Last Updated</p>
                    <p className="text-gray-900">{formatDate(selectedOrder.updatedAt)}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedOrder(null);
                    handleTrackOrder(selectedOrder.orderId);
                  }}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Navigation size={18} />
                  <span>Track This Order</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Track View */}
        {view === 'track' && (
          <>
            {/* Search Box */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 animate-slide-up">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value.toUpperCase())}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    placeholder="Enter Order ID (e.g., OJ-123456)"
                    className="input-field pl-12 text-lg"
                  />
                </div>
                <button
                  onClick={() => handleSearch()}
                  className="btn-primary whitespace-nowrap"
                >
                  Track Order
                </button>
              </div>
              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  {error}
                </div>
              )}
            </div>

        {/* Order Details */}
        {order && (
          <div className="space-y-8 animate-slide-up">
            {/* Order Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <span className="px-4 py-2 bg-primary-100 text-primary-700 rounded-full font-semibold">
                  {orderId}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Customer Name</h3>
                  <p className="text-lg font-semibold text-gray-900">{order.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Phone Number</h3>
                  <p className="text-lg font-semibold text-gray-900">{order.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Product</h3>
                  <p className="text-lg font-semibold text-gray-900">{order.productName}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Quantity</h3>
                  <p className="text-lg font-semibold text-gray-900">{order.quantity} bottle(s)</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total Amount</h3>
                  <p className="text-lg font-semibold text-primary-600">{formatPrice(order.totalPrice)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Payment Mode</h3>
                  <p className="text-lg font-semibold text-gray-900 capitalize">{order.paymentMode}</p>
                </div>
                <div className="md:col-span-2">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Delivery Address</h3>
                  <p className="text-lg font-semibold text-gray-900 flex items-start space-x-2">
                    <MapPin size={20} className="text-primary-500 mt-1 flex-shrink-0" />
                    <span>{order.address}</span>
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Order Placed</h3>
                  <p className="text-sm text-gray-700">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Last Updated</h3>
                  <p className="text-sm text-gray-700">{formatDate(order.updatedAt)}</p>
                </div>
                
                {/* Delivery Staff Details - Show only for out_for_delivery or delivered */}
                {(order.status === 'out_for_delivery' || order.status === 'delivered') && (() => {
                  const staffAssignments = JSON.parse(localStorage.getItem('orderStaffAssignments') || '{}');
                  const assignedStaff = staffAssignments[order.orderId];
                  
                  console.log('Order Status:', order.status);
                  console.log('Order ID:', order.orderId);
                  console.log('Staff Assignments:', staffAssignments);
                  console.log('Assigned Staff:', assignedStaff);
                  
                  if (assignedStaff) {
                    return (
                      <>
                        <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
                          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                            <Truck className="text-blue-600" size={20} />
                            <span>Delivery Staff Details</span>
                          </h3>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Staff Name</h3>
                          <p className="text-lg font-semibold text-gray-900">{assignedStaff.staffName}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-500 mb-1">Contact Number</h3>
                          <p className="text-lg font-semibold text-gray-900">{assignedStaff.staffPhone}</p>
                        </div>
                      </>
                    );
                  } else {
                    // Show message that staff will be assigned soon
                    return (
                      <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-200">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <Truck className="text-gray-400" size={20} />
                          <p className="text-sm italic">Delivery staff will be assigned shortly</p>
                        </div>
                      </div>
                    );
                  }
                })()}
              </div>
            </div>

            {/* Order Status Timeline */}
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Delivery Status</h2>

              <div className="relative">
                {/* Progress Line */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200">
                  <div
                    className={`transition-all duration-500 ${
                      order.status === 'delivered' 
                        ? 'bg-gradient-to-b from-green-500 to-green-600' 
                        : 'bg-gradient-to-b from-primary-500 to-primary-600'
                    }`}
                    style={{
                      height: `${(getStatusIndex(order.status) / (Object.keys(ORDER_STATUSES).length - 1)) * 100}%`
                    }}
                  />
                </div>

                {/* Status Steps */}
                <div className="space-y-8 relative">
                  {Object.entries(ORDER_STATUSES).map(([key, status], index) => {
                    const completed = isStatusCompleted(key);
                    const active = isStatusActive(key);

                    return (
                      <div key={key} className="flex items-start space-x-6">
                        {/* Icon */}
                        <div
                          className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                            completed
                              ? 'bg-gradient-to-br from-green-500 to-green-600 shadow-lg scale-110'
                              : 'bg-gray-200'
                          } ${active ? 'ring-4 ring-green-200' : ''}`}
                        >
                          {completed ? (
                            <CheckCircle className="text-white" size={32} />
                          ) : (
                            <Clock className="text-gray-400" size={32} />
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-2">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-3xl">{status.icon}</span>
                            <h3
                              className={`text-xl font-bold ${
                                completed ? 'text-gray-900' : 'text-gray-400'
                              }`}
                            >
                              {status.label}
                            </h3>
                          </div>
                          <p
                            className={`text-sm ${
                              completed ? 'text-gray-600' : 'text-gray-400'
                            }`}
                          >
                            {status.description}
                          </p>
                          {active && (
                            <div className="mt-3 inline-block px-4 py-2 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                              Current Status
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Delivery */}
              {order.status !== 'delivered' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-orange-50 rounded-xl border-2 border-primary-200">
                  <div className="flex items-center space-x-3">
                    <Truck className="text-primary-600" size={24} />
                    <div>
                      <h4 className="font-semibold text-gray-900">Estimated Delivery</h4>
                      <p className="text-sm text-gray-600">Your order will arrive in 15-20 minutes</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Delivered Message with Feedback Button */}
              {order.status === 'delivered' && (
                <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Package className="text-green-600" size={24} />
                      <div>
                        <h4 className="font-semibold text-gray-900">Order Delivered!</h4>
                        <p className="text-sm text-gray-600">Thank you for choosing FreshJuice. Enjoy your fresh juice! 🍊</p>
                      </div>
                    </div>
                    {feedbackSubmitted[order.orderId] ? (
                      <div className="text-center px-6 py-3">
                        <p className="text-green-700 font-semibold text-lg">✓ Thank you for your feedback!</p>
                        <p className="text-sm text-gray-600 mt-1">We appreciate your review</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setFeedbackOrder(order);
                          setShowFeedbackForm(true);
                        }}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-md"
                      >
                        Give Feedback
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!order && !error && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Enter your order ID to track
            </h3>
            <p className="text-gray-500">
              You can find your order ID in the confirmation message
            </p>
          </div>
        )}
          </>
        )}

        {/* Feedback Form Modal */}
        {showFeedbackForm && feedbackOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowFeedbackForm(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Share Your Feedback</h2>
                <p className="text-sm text-gray-600 mt-1">Order #{feedbackOrder.orderId}</p>
              </div>

              <form onSubmit={handleFeedbackSubmit} className="p-6 space-y-6">
                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    How would you rate your experience?
                  </label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFeedbackData({ ...feedbackData, rating: star })}
                        className="text-4xl transition-transform hover:scale-110"
                      >
                        {star <= feedbackData.rating ? '⭐' : '☆'}
                      </button>
                    ))}
                    <span className="ml-3 text-lg font-semibold text-gray-700">
                      {feedbackData.rating}/5
                    </span>
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tell us more about your experience
                  </label>
                  <textarea
                    value={feedbackData.comment}
                    onChange={(e) => setFeedbackData({ ...feedbackData, comment: e.target.value })}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
                    placeholder="Share your thoughts about the product, delivery, or service..."
                  />
                </div>

                {/* Buttons */}
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowFeedbackForm(false)}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium shadow-md"
                  >
                    Submit Feedback
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
