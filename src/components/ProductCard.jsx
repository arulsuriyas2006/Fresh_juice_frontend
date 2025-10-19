import { useState } from 'react';
import { ShoppingCart, Star, Eye } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { useNavigate } from 'react-router-dom';
import ProductDetailsModal from './ProductDetailsModal';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);

  const handleOrder = () => {
    navigate('/order', { state: { product } });
  };

  return (
    <div className="card group">
      {/* Image */}
      <div className="relative overflow-hidden h-64">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {product.popular && (
          <div className="absolute top-4 right-4 bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
            <Star size={14} className="fill-current" />
            <span>Popular</span>
          </div>
        )}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-primary-700">
          {product.category}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

        {/* Features */}
        <div className="flex flex-wrap gap-2 mb-4">
          {product.features.map((feature, index) => (
            <span
              key={index}
              className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full"
            >
              {feature}
            </span>
          ))}
        </div>

        {/* Price and CTA */}
        <div className="space-y-3">
          {/* View Details Button */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-2xl font-bold text-primary-600">
                {formatPrice(product.price)}
              </span>
              <span className="text-gray-500 text-sm ml-1">/bottle</span>
            </div>
            <button
              onClick={() => setShowDetails(true)}
              className="flex items-center space-x-2 py-2 px-4 border-2 border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium"
            >
              <Eye size={18} />
              <span>View Details</span>
            </button>
          </div>
          
          {/* Order Button */}
          <button
            onClick={handleOrder}
            className="btn-primary w-full flex items-center justify-center space-x-2 py-3"
          >
            <ShoppingCart size={18} />
            <span>Order</span>
          </button>
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal 
        product={product}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </div>
  );
}
