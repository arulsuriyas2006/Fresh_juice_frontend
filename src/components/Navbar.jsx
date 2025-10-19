import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, ShoppingBag, Package, Search, LogIn, LogOut, User, Shield, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAdmin } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/menu', label: 'Menu', icon: ShoppingBag },
    { path: '/order', label: 'Order', icon: Package },
    { path: '/track', label: 'Track', icon: Search },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="container-custom">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200">
                <span className="text-2xl">🍊</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                FreshJuice
              </span>
            </Link>

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

              {/* Admin Link (only for admins) */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                    isActive('/admin')
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                  }`}
                >
                  <Shield size={18} />
                  <span className="font-medium">Admin</span>
                </Link>
              )}

              {/* Auth Section */}
              {user ? (
                <div className="flex items-center space-x-2 ml-2">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-50 text-primary-700 hover:bg-primary-100 transition-all duration-200"
                  >
                    <User size={18} />
                    <span className="font-medium">{user.name}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-all duration-200 shadow-md"
                  >
                    <LogOut size={18} />
                    <span className="font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition-all duration-200 shadow-md ml-2"
                >
                  <LogIn size={18} />
                  <span className="font-medium">Login</span>
                </button>
              )}
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
              
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`p-2 rounded-lg transition-all duration-200 ${
                    isActive('/admin')
                      ? 'bg-primary-500 text-white'
                      : 'text-gray-700 hover:bg-primary-50'
                  }`}
                >
                  <Shield size={20} />
                </Link>
              )}

              {user ? (
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="p-2 rounded-lg bg-primary-50 text-primary-700"
                >
                  <User size={20} />
                </button>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="p-2 rounded-lg bg-primary-500 text-white"
                >
                  <LogIn size={20} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile User Menu */}
        {showUserMenu && user && (
          <div className="md:hidden border-t border-gray-200 bg-white">
            <div className="container-custom py-3">
              <div className="px-4 py-2 border-b border-gray-200 mb-2">
                <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                <p className="text-xs text-gray-500">{user.email}</p>
                <span className="inline-block mt-1 px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                  {user.role}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2 rounded-lg"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
}
