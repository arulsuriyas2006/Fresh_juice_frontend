import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Zap, Leaf, Clock, Award } from 'lucide-react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import AuthModal from '../components/AuthModal';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const popularProducts = products.filter(p => p.popular).slice(0, 3);

  // Check if redirected from protected route
  useEffect(() => {
    if (searchParams.get('login') === 'true' && !user) {
      setShowAuthModal(true);
      // Remove the query parameter
      setSearchParams({});
    }
  }, [searchParams, user, setSearchParams]);

  const features = [
    {
      icon: Zap,
      title: 'Lightning Fast',
      description: 'Delivered to your doorstep in minutes'
    },
    {
      icon: Leaf,
      title: '100% Natural',
      description: 'No preservatives or artificial flavors'
    },
    {
      icon: Clock,
      title: 'Fresh Daily',
      description: 'Squeezed fresh every single day'
    },
    {
      icon: Award,
      title: 'Premium Quality',
      description: 'Only the finest oranges selected'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-primary-700 text-white">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="container-custom relative py-20 md:py-32">
          <div className="max-w-3xl animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Fresh Orange Juice
              <span className="block text-primary-200">Delivered Fast! 🍊</span>
            </h1>
            <p className="text-xl md:text-2xl text-primary-100 mb-8">
              Get fresh, healthy orange juice delivered to your doorstep in minutes. 
              Pure goodness, zero compromise.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => navigate('/menu')}
                className="bg-white text-primary-600 hover:bg-primary-50 font-bold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
              >
                <span>Order Now</span>
                <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </button>
              <button
                onClick={() => navigate('/track')}
                className="bg-primary-700 hover:bg-primary-800 text-white font-bold py-4 px-8 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Track Order
              </button>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Why Choose FreshJuice?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-xl hover:bg-primary-50 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <feature.icon className="text-white" size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Products Section */}
      <section className="py-20 bg-gradient-to-br from-orange-50 to-white">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Popular Choices</h2>
            <p className="text-xl text-gray-600">Our customers' favorite picks</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <button
              onClick={() => navigate('/menu')}
              className="btn-primary inline-flex items-center space-x-2"
            >
              <span>View Full Menu</span>
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready for Fresh Juice?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers enjoying fresh, healthy orange juice every day.
          </p>
          <button
            onClick={() => navigate('/order')}
            className="bg-white text-primary-600 hover:bg-primary-50 font-bold py-4 px-10 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl text-lg"
          >
            Place Your Order Now
          </button>
        </div>
      </section>

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </div>
  );
}
