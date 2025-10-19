import { X, Clock, Users, Leaf, CheckCircle } from 'lucide-react';

export default function ProductDetailsModal({ product, isOpen, onClose }) {
  if (!isOpen || !product) return null;

  const { preparation } = product;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slide-up">
        {/* Full Product Image */}
        <div className="relative h-96 overflow-hidden rounded-t-2xl">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white rounded-full p-2 transition-colors shadow-lg"
          >
            <X size={24} />
          </button>
          <div className="absolute bottom-6 left-6 right-6">
            <h2 className="text-4xl font-bold text-white mb-3">{product.name}</h2>
            <p className="text-lg text-white/95">{product.description}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          {/* Quick Info */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            <div className="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg">
              <Clock className="text-primary-600" size={24} />
              <div>
                <p className="text-xs text-gray-600">Prep Time</p>
                <p className="font-semibold text-gray-900">{preparation.time}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg">
              <Users className="text-primary-600" size={24} />
              <div>
                <p className="text-xs text-gray-600">Serving Size</p>
                <p className="font-semibold text-gray-900">{preparation.servingSize}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-4 bg-primary-50 rounded-lg col-span-2 md:col-span-1">
              <Leaf className="text-primary-600" size={24} />
              <div>
                <p className="text-xs text-gray-600">Category</p>
                <p className="font-semibold text-gray-900">{product.category}</p>
              </div>
            </div>
          </div>

          {/* Ingredients */}
          <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <span className="text-3xl">🥤</span>
              <span>Ingredients</span>
            </h3>
            <div className="bg-gray-50 rounded-lg p-5">
              <ul className="space-y-3">
                {preparation.ingredients.map((ingredient, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <CheckCircle className="text-primary-600 flex-shrink-0 mt-0.5" size={20} />
                    <span className="text-gray-700 text-lg">{ingredient}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Nutrition Highlights */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
              <span className="text-3xl">💪</span>
              <span>Nutrition Highlights</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {preparation.nutritionHighlights.map((highlight, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-br from-primary-500 to-primary-600 text-white p-4 rounded-lg text-center"
                >
                  <p className="font-semibold">{highlight}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Product Features</h3>
            <div className="flex flex-wrap gap-2">
              {product.features.map((feature, index) => (
                <span
                  key={index}
                  className="bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="btn-primary w-full py-4 text-lg"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
