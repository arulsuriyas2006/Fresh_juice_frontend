import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, ShoppingBag, Gift, LogOut, Award, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, loyaltyAPI } from '../services/api';
import { formatPrice } from '../lib/utils';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSpent: 0,
    loyaltyPoints: 0,
    totalPointsEarned: 0,
    usedPoints: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/');
      return;
    }
    fetchUserStats();
  }, [user, navigate]);

  const fetchUserStats = async () => {
    setLoading(true);
    try {
      // Fetch orders
      const ordersResponse = await ordersAPI.getOrders();
      const userOrders = ordersResponse.orders || [];
      
      // Group orders by orderId to get unique orders and calculate total products
      const uniqueOrders = {};
      let totalAmount = 0;
      let totalProductsOrdered = 0;
      
      userOrders.forEach(order => {
        if (!uniqueOrders[order.orderId]) {
          uniqueOrders[order.orderId] = true;
        }
        totalAmount += order.totalPrice || 0;
        totalProductsOrdered += order.quantity || 0; // Each product = 1 point
      });

      // Fetch current loyalty points (remaining)
      let currentLoyaltyPoints = 0;
      if (user?.email) {
        try {
          const loyaltyResponse = await loyaltyAPI.getPoints(user.email);
          currentLoyaltyPoints = loyaltyResponse.loyaltyPoints || 0;
        } catch (err) {
          console.error('Error fetching loyalty points:', err);
        }
      }

      // Calculate points earned and used
      const totalPointsEarned = totalProductsOrdered; // 1 point per product
      const pointsUsed = totalPointsEarned - currentLoyaltyPoints; // Points earned - remaining = used

      setStats({
        totalOrders: Object.keys(uniqueOrders).length,
        totalSpent: totalAmount,
        loyaltyPoints: currentLoyaltyPoints, // Available/Remaining points
        totalPointsEarned: totalPointsEarned, // Total earned
        usedPoints: pointsUsed >= 0 ? pointsUsed : 0 // Points redeemed
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-12 bg-gray-50">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <User className="text-white" size={48} />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{user.name}</h1>
          <p className="text-gray-600">{user.email}</p>
          <span className="inline-block mt-2 px-4 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold capitalize">
            {user.role}
          </span>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Total Orders */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="text-blue-600" size={28} />
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{stats.totalOrders}</h3>
                <p className="text-base text-gray-600">Total Orders</p>
              </div>

              {/* Total Spent */}
              <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-green-600" size={28} />
                  </div>
                </div>
                <h3 className="text-4xl font-bold text-gray-900 mb-2">{formatPrice(stats.totalSpent)}</h3>
                <p className="text-base text-gray-600">Total Spent</p>
              </div>
            </div>

            {/* Points Summary Card */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl shadow-lg p-6 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Earned</p>
                  <p className="text-3xl font-bold text-blue-600">{stats.totalPointsEarned}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Points Used</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.usedPoints}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Remaining</p>
                  <p className="text-3xl font-bold text-green-600">{stats.loyaltyPoints}</p>
                </div>
              </div>
              <div className="mt-4 text-center text-sm text-gray-600">
                <p>💡 Earned {stats.totalPointsEarned} points • Used {stats.usedPoints} points • {stats.loyaltyPoints} points available</p>
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white rounded-2xl shadow-lg p-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center space-x-2">
                <User className="text-primary-600" size={24} />
                <span>Personal Information</span>
              </h2>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <User className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="text-lg font-semibold text-gray-900">{user.name}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                  <Mail className="text-gray-400 mt-1" size={20} />
                  <div>
                    <p className="text-sm text-gray-600">Email Address</p>
                    <p className="text-lg font-semibold text-gray-900">{user.email}</p>
                  </div>
                </div>

                {user.phone && (
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <Phone className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Phone Number</p>
                      <p className="text-lg font-semibold text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}

                {user.address && (
                  <div className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <MapPin className="text-gray-400 mt-1" size={20} />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="text-lg font-semibold text-gray-900">{user.address}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Loyalty Points Info */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl shadow-lg p-8 animate-slide-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex items-center space-x-3 mb-4">
                <Gift className="text-amber-600" size={32} />
                <h2 className="text-2xl font-bold text-gray-900">Loyalty Rewards</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-2">Available Points</p>
                  <p className="text-4xl font-bold text-amber-600">{stats.loyaltyPoints}</p>
                  <p className="text-sm text-gray-600 mt-1">= ₹{stats.loyaltyPoints} discount</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-2">Points Value</p>
                  <p className="text-lg text-gray-700">1 Point = ₹1 discount</p>
                  <p className="text-sm text-gray-600 mt-1">Earn 1 point per product ordered</p>
                </div>
              </div>

              {stats.loyaltyPoints > 0 && (
                <div className="mt-6 p-4 bg-white rounded-lg">
                  <p className="text-sm text-gray-700">
                    🎉 You can save <span className="font-bold text-amber-600">₹{stats.loyaltyPoints}</span> on your next order!
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-slide-up" style={{ animationDelay: '0.6s' }}>
              <button
                onClick={() => navigate('/track')}
                className="flex items-center justify-center space-x-2 py-4 px-6 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <ShoppingBag size={20} />
                <span>View My Orders</span>
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 py-4 px-6 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
