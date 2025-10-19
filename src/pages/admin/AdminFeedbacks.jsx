import { useState, useEffect } from 'react';
import { MessageSquare, Star, User, Calendar, Package } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { formatDate } from '../../lib/utils';

export default function AdminFeedbacks() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [ratingFilter, setRatingFilter] = useState('all'); // 'all', '5', '4', '3', '2', '1'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [feedbacks, ratingFilter]);

  const fetchFeedbacks = () => {
    setLoading(true);
    try {
      const savedFeedbacks = localStorage.getItem('feedbacks');
      const allFeedbacks = savedFeedbacks ? JSON.parse(savedFeedbacks) : [];
      
      // Sort by date (newest first)
      allFeedbacks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setFeedbacks(allFeedbacks);
    } catch (error) {
      console.error('Error fetching feedbacks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...feedbacks];

    if (ratingFilter !== 'all') {
      filtered = filtered.filter(f => f.rating === parseInt(ratingFilter));
    }

    setFilteredFeedbacks(filtered);
  };

  const getAverageRating = () => {
    if (feedbacks.length === 0) return 0;
    const sum = feedbacks.reduce((acc, f) => acc + f.rating, 0);
    return (sum / feedbacks.length).toFixed(1);
  };

  const getRatingCount = (rating) => {
    return feedbacks.filter(f => f.rating === rating).length;
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <span key={star} className="text-xl">
            {star <= rating ? '⭐' : '☆'}
          </span>
        ))}
      </div>
    );
  };

  return (
    <AdminLayout>
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customer Feedbacks</h1>
          <p className="text-gray-600">View and manage customer reviews</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-blue-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{feedbacks.length}</h3>
            <p className="text-sm text-gray-600">Total Feedbacks</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Star className="text-yellow-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{getAverageRating()}</h3>
            <p className="text-sm text-gray-600">Average Rating</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{getRatingCount(5)}</h3>
            <p className="text-sm text-gray-600">5-Star Reviews</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⭐</span>
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{getRatingCount(1) + getRatingCount(2)}</h3>
            <p className="text-sm text-gray-600">Low Ratings</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center space-x-4">
            <label className="text-sm font-medium text-gray-700">Filter by Rating:</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
            >
              <option value="all">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </select>
            <span className="text-sm text-gray-600">
              Showing <span className="font-semibold text-primary-600">{filteredFeedbacks.length}</span> feedback(s)
            </span>
          </div>
        </div>

        {/* Feedbacks List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading feedbacks...</p>
          </div>
        ) : filteredFeedbacks.length > 0 ? (
          <div className="space-y-4">
            {filteredFeedbacks.map((feedback) => (
              <div key={feedback.id} className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <User className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{feedback.customerName}</h3>
                      <p className="text-sm text-gray-600">{feedback.customerEmail}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <div className="flex items-center space-x-1">
                          <Package size={14} className="text-gray-500" />
                          <span className="text-sm text-gray-600">Order #{feedback.orderId}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar size={14} className="text-gray-500" />
                          <span className="text-sm text-gray-600">{formatDate(feedback.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    {renderStars(feedback.rating)}
                    <p className="text-sm text-gray-600 mt-1">{feedback.rating}/5</p>
                  </div>
                </div>

                <div className="pl-16">
                  <div className="bg-gray-50 rounded-lg p-4 border-l-4 border-primary-500">
                    <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <MessageSquare size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              {ratingFilter === 'all' ? 'No feedbacks yet' : `No ${ratingFilter}-star feedbacks`}
            </h3>
            <p className="text-gray-500">
              {ratingFilter === 'all' 
                ? 'Customer feedbacks will appear here once they submit reviews'
                : 'Try selecting a different rating filter'}
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
