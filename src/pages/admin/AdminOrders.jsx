import { useState, useEffect } from 'react';
import { Search, Filter, Eye, Calendar, DollarSign, Package, Truck } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { ordersAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../lib/utils';
import { ORDER_STATUSES } from '../../data/products';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all'); // 'all', 'paid', 'unpaid'
  const [timeFilter, setTimeFilter] = useState('all'); // 'all', 'week', 'month', 'year'
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showAssignStaff, setShowAssignStaff] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState(null);
  const [deliveryStaff, setDeliveryStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [orders, searchQuery, paymentFilter, timeFilter, statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getOrders();
      const allOrders = response.orders || [];
      
      // Group by orderId
      const groupedOrders = {};
      allOrders.forEach(order => {
        if (!groupedOrders[order.orderId]) {
          groupedOrders[order.orderId] = {
            ...order,
            products: []
          };
        }
        groupedOrders[order.orderId].products.push({
          name: order.productName,
          quantity: order.quantity,
          price: order.totalPrice
        });
      });

      setOrders(Object.values(groupedOrders).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ));
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...orders];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(order =>
        order.orderId.toLowerCase().includes(query) ||
        order.name.toLowerCase().includes(query) ||
        order.products.some(p => p.name.toLowerCase().includes(query))
      );
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => {
        if (paymentFilter === 'paid') {
          return order.paymentMode === 'online';
        } else {
          return order.paymentMode === 'cash';
        }
      });
    }

    // Time filter
    if (timeFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        
        switch (timeFilter) {
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
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await ordersAPI.updateOrderStatus(orderId, newStatus);
      alert('Order status updated successfully!');
      fetchOrders();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update order status');
    }
  };

  const calculateTotal = (products) => {
    return products.reduce((sum, p) => sum + p.price, 0);
  };

  const handleAssignStaff = (order) => {
    // Load delivery staff from localStorage
    const savedStaff = localStorage.getItem('deliveryStaff');
    const staff = savedStaff ? JSON.parse(savedStaff) : [];
    
    // Filter only available staff
    const availableStaff = staff.filter(s => s.status === 'not_assigned');
    
    setDeliveryStaff(availableStaff);
    setOrderToAssign(order);
    setShowAssignStaff(true);
  };

  const confirmAssignStaff = async (staffMember) => {
    try {
      // Update order status to out_for_delivery
      await ordersAPI.updateOrderStatus(orderToAssign.orderId, 'out_for_delivery');
      
      // Update staff status to assigned
      const savedStaff = localStorage.getItem('deliveryStaff');
      const allStaff = savedStaff ? JSON.parse(savedStaff) : [];
      const updatedStaff = allStaff.map(s => 
        s.id === staffMember.id ? { ...s, status: 'assigned' } : s
      );
      localStorage.setItem('deliveryStaff', JSON.stringify(updatedStaff));
      
      // Save staff assignment to order
      const orderStaffAssignments = JSON.parse(localStorage.getItem('orderStaffAssignments') || '{}');
      orderStaffAssignments[orderToAssign.orderId] = {
        staffId: staffMember.id,
        staffName: staffMember.name,
        staffPhone: staffMember.phone,
        staffEmail: staffMember.email,
        assignedAt: new Date().toISOString()
      };
      localStorage.setItem('orderStaffAssignments', JSON.stringify(orderStaffAssignments));
      
      alert(`Order assigned to ${staffMember.name} successfully!`);
      setShowAssignStaff(false);
      setOrderToAssign(null);
      fetchOrders();
    } catch (error) {
      console.error('Error assigning staff:', error);
      alert('Failed to assign staff');
    }
  };

  return (
    <AdminLayout>
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Orders Management</h1>
          <p className="text-gray-600">Manage and track all orders</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID, Product Name, or Customer Name..."
              className="w-full pl-12 pr-4 py-3 rounded-lg border-2 border-gray-200 focus:border-primary-500 focus:outline-none"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 font-medium"
          >
            <Filter size={18} />
            <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
          </button>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              {/* Payment Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Status</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                >
                  <option value="all">All Payments</option>
                  <option value="paid">Paid (Online)</option>
                  <option value="unpaid">Unpaid (COD)</option>
                </select>
              </div>

              {/* Time Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                >
                  <option value="all">All Time</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="year">This Year</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Order Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="received">Received</option>
                  <option value="preparing">Preparing</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
            </div>
          )}

          {/* Results Count */}
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-primary-600">{filteredOrders.length}</span> order(s)
          </p>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading orders...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Order ID</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Products</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Total</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Payment</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <tr key={order.orderId} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6 text-sm font-medium text-gray-900">{order.orderId}</td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{order.name}</p>
                          <p className="text-xs text-gray-600">{order.phone}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm text-gray-700">
                          {order.products.map((p, i) => (
                            <div key={i}>{p.name} × {p.quantity}</div>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-gray-900">
                        {formatPrice(calculateTotal(order.products))}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          order.paymentMode === 'online' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {order.paymentMode === 'online' ? 'Paid' : 'COD'}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.orderId, e.target.value)}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold border-2 focus:outline-none ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700 border-green-200' :
                            order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                            order.status === 'preparing' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                            'bg-gray-100 text-gray-700 border-gray-200'
                          }`}
                        >
                          <option value="received">Received</option>
                          <option value="preparing">Preparing</option>
                          <option value="out_for_delivery">Out for Delivery</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">{formatDate(order.createdAt)}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
                          >
                            <Eye size={16} />
                            <span>View</span>
                          </button>
                          {(order.status === 'received' || order.status === 'preparing') && (
                            <button
                              onClick={() => handleAssignStaff(order)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                            >
                              <Truck size={14} />
                              <span>Assign Staff</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-2">Products</p>
                    {selectedOrder.products.map((product, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-900">{product.name} × {product.quantity}</span>
                        <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Mode</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{selectedOrder.paymentMode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-semibold text-primary-600">{formatPrice(calculateTotal(selectedOrder.products))}</p>
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

        {/* Assign Staff Modal */}
        {showAssignStaff && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setShowAssignStaff(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">Assign Delivery Staff</h2>
                <p className="text-sm text-gray-600 mt-1">Order #{orderToAssign?.orderId}</p>
              </div>

              <div className="p-6">
                {deliveryStaff.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-sm text-gray-600 mb-4">Select an available delivery staff:</p>
                    {deliveryStaff.map((staff) => (
                      <div
                        key={staff.id}
                        className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-500 hover:bg-primary-50 transition-all cursor-pointer"
                        onClick={() => confirmAssignStaff(staff)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{staff.name}</p>
                            <p className="text-sm text-gray-600">{staff.phone}</p>
                            <p className="text-xs text-gray-500">{staff.email}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Truck className="text-blue-600" size={24} />
                            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                              Available
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Truck size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-600 mb-2">No available delivery staff</p>
                    <p className="text-sm text-gray-500">All staff members are currently assigned to orders</p>
                  </div>
                )}

                <button
                  onClick={() => setShowAssignStaff(false)}
                  className="w-full mt-6 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
