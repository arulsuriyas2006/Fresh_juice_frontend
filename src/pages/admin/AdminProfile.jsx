import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Shield, LogOut, Edit, Save, X } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { useAuth } from '../../context/AuthContext';

export default function AdminProfile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate passwords if changing
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          alert('New passwords do not match!');
          setLoading(false);
          return;
        }
        if (formData.newPassword.length < 6) {
          alert('Password must be at least 6 characters!');
          setLoading(false);
          return;
        }
      }

      // Update user data in localStorage
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email
      };

      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      alert('Profile updated successfully!');
      setIsEditing(false);
      
      // Clear password fields
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Reload to update context
      window.location.reload();
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <AdminLayout>
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your admin account settings</p>
        </div>

        <div className="space-y-6">
          {/* Profile Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full flex items-center justify-center shadow-lg">
                  <Shield className="text-white" size={40} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{user?.name}</h2>
                  <p className="text-gray-600">{user?.email}</p>
                  <span className="inline-block mt-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    Administrator
                  </span>
                </div>
              </div>
              
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-all duration-200"
                >
                  <Edit size={18} />
                  <span>Edit Profile</span>
                </button>
              )}
            </div>

            {/* Profile Form */}
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none ${
                          isEditing 
                            ? 'border-gray-200 focus:border-primary-500 bg-white' 
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg focus:outline-none ${
                          isEditing 
                            ? 'border-gray-200 focus:border-primary-500 bg-white' 
                            : 'border-gray-100 bg-gray-50 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Change Password */}
              {isEditing && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Change Password (Optional)</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Current Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                          placeholder="Enter current password"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                          placeholder="Enter new password (min 6 characters)"
                          minLength={6}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {isEditing && (
                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <X size={20} />
                    <span>Cancel</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={20} />
                    <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Actions</h3>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all duration-200 shadow-lg"
            >
              <LogOut size={20} />
              <span className="font-medium">Logout from Admin Panel</span>
            </button>
          </div>

          {/* Admin Info */}
          <div className="bg-gradient-to-r from-primary-50 to-orange-50 border-2 border-primary-200 rounded-2xl p-6">
            <div className="flex items-start space-x-3">
              <Shield className="text-primary-600 flex-shrink-0" size={24} />
              <div>
                <h4 className="font-semibold text-gray-900 mb-1">Administrator Access</h4>
                <p className="text-sm text-gray-600">
                  You have full access to all administrative features including order management, 
                  customer data, delivery staff management, and system settings.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
