import { useState } from 'react';
import { products } from '../data/products';
import ProductCard from '../components/ProductCard';
import { Filter, Search, X } from 'lucide-react';

export default function Menu() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  const categories = ['All', ...new Set(products.map(p => p.category))];
  
  // Filter by category
  let filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);
  
  // Filter by search query
  if (searchQuery.trim()) {
    filteredProducts = filteredProducts.filter(product => {
      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    });
  }

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            Our Fresh Juice Menu
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our delicious range of fresh orange juices, each crafted with care and quality.
          </p>
        </div>

        {/* Special Offer Banner */}
        <div className="mb-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl p-6 md:p-8 text-white text-center shadow-xl animate-slide-up">
          <h3 className="text-2xl md:text-3xl font-bold mb-3">🎉 Special Offer!</h3>
          <p className="text-lg md:text-xl text-primary-100 mb-2">
            Order 3 or more bottles and get <span className="font-bold text-white bg-white/20 px-3 py-1 rounded-full">FREE delivery</span>
          </p>
          <p className="text-sm text-primary-200">
            * Offer valid on all products. Terms and conditions apply.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8 animate-slide-up">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for juices by name, description, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-12 py-4 rounded-full border-2 border-gray-200 focus:border-primary-500 focus:outline-none transition-all duration-200 text-gray-700 placeholder-gray-400 shadow-sm hover:shadow-md"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Clear search"
              >
                <X size={20} />
              </button>
            )}
          </div>
          {searchQuery && (
            <p className="text-sm text-gray-600 mt-2 text-center">
              Found <span className="font-semibold text-primary-600">{filteredProducts.length}</span> result{filteredProducts.length !== 1 ? 's' : ''} for "{searchQuery}"
            </p>
          )}
        </div>

        {/* Category Filter */}
        <div className="mb-8 animate-slide-up">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Filter size={20} className="text-primary-600" />
            <span className="font-semibold text-gray-700">Filter by Category:</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white shadow-md scale-105'
                    : 'bg-white text-gray-700 hover:bg-primary-50 hover:text-primary-600 shadow-sm'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProducts.map((product, index) => (
            <div
              key={product.id}
              className="animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500 mb-4">
              {searchQuery 
                ? `No results for "${searchQuery}". Try a different search term.`
                : 'Try selecting a different category'}
            </p>
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="btn-primary inline-flex items-center space-x-2"
              >
                <X size={18} />
                <span>Clear Search</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
