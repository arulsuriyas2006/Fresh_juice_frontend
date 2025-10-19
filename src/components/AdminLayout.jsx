import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Users, Truck, User, LogOut, MessageSquare, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const navItems = [
    { path: '/admin', label: 'Home', icon: Home },
    { path: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { path: '/admin/products', label: 'Products', icon: Package },
    { path: '/admin/customers', label: 'Customers', icon: Users },
    { path: '/admin/delivery-staff', label: 'Delivery Staffs', icon: Truck },
    { path: '/admin/feedbacks', label: 'Feedbacks', icon: MessageSquare },
    { path: '/admin/profile', label: 'My Profile', icon: User },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navbar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
                <span className="text-2xl">🍊</span>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                  FreshJuice
                </span>
                <span className="block text-xs text-gray-600">Admin Dashboard</span>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  <Icon size={18} />
                  <span className="font-medium">{label}</span>
                </Link>
              ))}

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-md ml-2"
              >
                <LogOut size={18} />
                <span className="font-medium">Logout</span>
              </button>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center space-x-1">
              {navItems.map(({ path, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-700 hover:bg-primary-50'
                  }`}
                >
                  <Icon size={20} />
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-200"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="py-8">
        {children}
      </main>
    </div>
  );
}
