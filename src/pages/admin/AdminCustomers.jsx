import { useState, useEffect } from 'react';
import { Users, Eye, Mail, Phone, MapPin, ShoppingBag } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { authAPI, ordersAPI } from '../../services/api';
import { formatPrice, formatDate } from '../../lib/utils';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [selectedOrderDetail, setSelectedOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(false);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // Fetch all orders to get customer data
      const ordersResponse = await ordersAPI.getOrders();
      const allOrders = ordersResponse.orders || [];

      // Group by customer email/phone
      const customerMap = {};
      allOrders.forEach(order => {
        const key = order.userId || order.phone;
        if (!customerMap[key]) {
          customerMap[key] = {
            name: order.name,
            phone: order.phone,
            address: order.address,
            email: order.userId || 'N/A',
            totalOrders: 0,
            totalSpent: 0,
            lastOrder: order.createdAt
          };
        }
        customerMap[key].totalOrders++;
        customerMap[key].totalSpent += order.totalPrice || 0;
        
        // Update last order date
        if (new Date(order.createdAt) > new Date(customerMap[key].lastOrder)) {
          customerMap[key].lastOrder = order.createdAt;
        }
      });

      setCustomers(Object.values(customerMap).sort((a, b) => 
        new Date(b.lastOrder) - new Date(a.lastOrder)
      ));
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    setLoadingOrders(true);
    
    try {
      const response = await ordersAPI.getOrders();
      const allOrders = response.orders || [];
      
      // Filter orders for this customer
      const customerOrdersList = allOrders.filter(order => 
        order.phone === customer.phone || order.name === customer.name
      );

      // Group by orderId
      const groupedOrders = {};
      customerOrdersList.forEach(order => {
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

      setCustomerOrders(Object.values(groupedOrders).sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
      ));
    } catch (error) {
      console.error('Error fetching customer orders:', error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const calculateTotal = (products) => {
    return products.reduce((sum, p) => sum + p.price, 0);
  };

  return (
    <AdminLayout>
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customers</h1>
          <p className="text-gray-600">View all registered customers and their orders</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{customers.length}</h3>
            <p className="text-sm text-gray-600">Total Customers</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ShoppingBag className="text-green-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {customers.reduce((sum, c) => sum + c.totalOrders, 0)}
            </h3>
            <p className="text-sm text-gray-600">Total Orders</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {formatPrice(customers.reduce((sum, c) => sum + c.totalSpent, 0))}
            </h3>
            <p className="text-sm text-gray-600">Total Revenue</p>
          </div>
        </div>

        {/* Customers Table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading customers...</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Customer Name</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Contact</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Address</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Total Orders</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Total Spent</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Last Order</th>
                    <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer, index) => (
                    <tr key={index} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <Users className="text-primary-600" size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{customer.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="text-sm">
                          <div className="flex items-center space-x-1 text-gray-700">
                            <Phone size={14} />
                            <span>{customer.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-start space-x-1 text-sm text-gray-700 max-w-xs">
                          <MapPin size={14} className="mt-1 flex-shrink-0" />
                          <span className="line-clamp-2">{customer.address}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm font-semibold text-gray-900">{customer.totalOrders}</td>
                      <td className="py-4 px-6 text-sm font-semibold text-green-600">{formatPrice(customer.totalSpent)}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">{formatDate(customer.lastOrder)}</td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => handleViewCustomer(customer)}
                          className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 font-medium text-sm"
                        >
                          <Eye size={16} />
                          <span>View Orders</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Customer Orders Modal */}
        {selectedCustomer && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedCustomer(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCustomer.name}'s Orders</h2>
                  <p className="text-sm text-gray-600">{selectedCustomer.phone}</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="p-6">
                {/* Customer Summary */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-600">{selectedCustomer.totalOrders}</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Total Spent</p>
                    <p className="text-2xl font-bold text-green-600">{formatPrice(selectedCustomer.totalSpent)}</p>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {formatPrice(selectedCustomer.totalSpent / selectedCustomer.totalOrders)}
                    </p>
                  </div>
                </div>

                {/* Orders List */}
                {loadingOrders ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading orders...</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-900">Order History</h3>
                    {customerOrders.map((order) => (
                      <div key={order.orderId} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Order #{order.orderId}</p>
                            <p className="text-xs text-gray-600">{formatDate(order.createdAt)}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                            order.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {order.products.map((product, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <span className="text-gray-700">{product.name} × {product.quantity}</span>
                              <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                            </div>
                          ))}
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center">
                          <span className="text-sm text-gray-600">Payment: <span className="font-medium capitalize">{order.paymentMode}</span></span>
                          <div className="flex items-center space-x-3">
                            <span className="text-lg font-bold text-primary-600">{formatPrice(calculateTotal(order.products))}</span>
                            <button
                              onClick={() => setSelectedOrderDetail(order)}
                              className="flex items-center space-x-1 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
                            >
                              <Eye size={14} />
                              <span>View</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Order Detail Modal */}
        {selectedOrderDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4" onClick={() => setSelectedOrderDetail(null)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
                <button
                  onClick={() => setSelectedOrderDetail(null)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Order ID</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrderDetail.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedOrderDetail.status === 'delivered' ? 'bg-green-100 text-green-700' :
                      selectedOrderDetail.status === 'out_for_delivery' ? 'bg-blue-100 text-blue-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {selectedOrderDetail.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Customer Name</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrderDetail.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrderDetail.phone}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600">Address</p>
                    <p className="text-lg font-semibold text-gray-900">{selectedOrderDetail.address}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-gray-600 mb-2">Products</p>
                    {selectedOrderDetail.products.map((product, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-gray-900">{product.name} × {product.quantity}</span>
                        <span className="font-semibold text-gray-900">{formatPrice(product.price)}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Mode</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">{selectedOrderDetail.paymentMode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-semibold text-primary-600">{formatPrice(calculateTotal(selectedOrderDetail.products))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Order Date</p>
                    <p className="text-sm text-gray-700">{formatDate(selectedOrderDetail.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Last Updated</p>
                    <p className="text-sm text-gray-700">{formatDate(selectedOrderDetail.updatedAt)}</p>
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
