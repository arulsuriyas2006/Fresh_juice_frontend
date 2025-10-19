import { useState } from 'react';
import { X, Mail, Lock, User, Phone, MapPin, Shield, UserCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [role, setRole] = useState('customer'); // 'customer' or 'admin'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { login, signup } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'signup') {
        await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address
        });
        setSuccess('Account created successfully!');
      } else {
        const response = await login({ 
          email: formData.email, 
          password: formData.password,
          role: role
        });
        setSuccess('Login successful!');
        
        setTimeout(() => {
          onClose();
          // Redirect admin to admin dashboard
          if (response.user.role === 'admin') {
            window.location.href = '/admin';
          } else {
            window.location.reload();
          }
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
    setSuccess('');
    setFormData({
      name: '',
      email: '',
      password: '',
      phone: '',
      address: '',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary-500 to-primary-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-bold">
              {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <p className="text-primary-100">
            {mode === 'login' 
              ? 'Login to your account' 
              : 'Sign up to get started'}
          </p>
        </div>

        <div className="p-6">
          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              I am a:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('customer')}
                className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-all ${
                  role === 'customer'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <UserCircle size={24} />
                <span className="font-semibold">Customer</span>
              </button>
              <button
                type="button"
                onClick={() => setRole('admin')}
                className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-all ${
                  role === 'admin'
                    ? 'border-primary-500 bg-primary-50 text-primary-700'
                    : 'border-gray-200 hover:border-primary-300'
                }`}
              >
                <Shield size={24} />
                <span className="font-semibold">Admin</span>
              </button>
            </div>
          </div>

          {/* Admin Default Credentials Info */}
          {role === 'admin' && mode === 'login' && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium mb-2">Default Admin Credentials:</p>
              <p className="text-sm text-blue-700">Email: <span className="font-mono font-semibold">admin@freshjuice.com</span></p>
              <p className="text-sm text-blue-700">Password: <span className="font-mono font-semibold">admin123</span></p>
            </div>
          )}

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
              {success}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="input-field pl-10"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="input-field pl-10"
                  placeholder="your@email.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="input-field pl-10"
                  placeholder="Enter password (min 6 characters)"
                />
              </div>
            </div>

            {/* Phone (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="input-field pl-10"
                    placeholder="10-digit mobile number"
                  />
                </div>
              </div>
            )}

            {/* Address (signup only) */}
            {mode === 'signup' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="2"
                    className="input-field pl-10"
                    placeholder="Your delivery address"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading 
                ? (mode === 'signup' ? 'Creating Account...' : 'Logging in...') 
                : (mode === 'signup' ? 'Sign Up' : `Login as ${role === 'admin' ? 'Admin' : 'Customer'}`)}
            </button>
          </form>

          {/* Footer Links - Hide signup option for admin */}
          {role !== 'admin' && (
            <div className="mt-6 text-center">
              <div className="text-gray-600 text-sm">
                {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                <button
                  onClick={switchMode}
                  className="text-primary-600 hover:text-primary-700 font-semibold"
                >
                  {mode === 'login' ? 'Sign Up' : 'Login'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
