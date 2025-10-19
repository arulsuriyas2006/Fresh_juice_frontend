import { useState, useEffect } from 'react';
import { Package, Plus, Edit, Trash2, Search, Filter } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { formatPrice } from '../../lib/utils';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'classic',
    image: '',
    stock: 100,
    features: []
  });

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, searchQuery, categoryFilter]);

  const loadProducts = () => {
    // Load products from localStorage or use default
    const savedProducts = localStorage.getItem('products');
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    } else {
      // Initialize with default products
      const defaultProducts = [
        {
          id: 1,
          name: 'Classic Orange Juice',
          description: 'Pure, fresh-squeezed orange with no additives, just pure goodness.',
          price: 89,
          category: 'classic',
          image: '/images/orange-juice.jpg',
          stock: 100,
          features: ['100% Natural', 'No Sugar Added', 'Fresh Squeezed'],
          isPopular: true
        },
        {
          id: 2,
          name: 'Pulp Delight',
          description: 'Extra pulpy orange juice for those who love the real fruit texture.',
          price: 99,
          category: 'premium',
          image: '/images/pulp-delight.jpg',
          stock: 75,
          features: ['Extra Pulp', 'Rich Texture', 'Vitamin C Boost'],
          isPopular: true
        },
        {
          id: 3,
          name: 'Vitamin Boost',
          description: 'Fortified with extra vitamins and minerals for your daily health needs.',
          price: 119,
          category: 'premium',
          image: '/images/vitamin-boost.jpg',
          stock: 50,
          features: ['Vitamin Fortified', 'Immunity Boost', 'Energy Plus'],
          isPopular: true
        }
      ];
      setProducts(defaultProducts);
      localStorage.setItem('products', JSON.stringify(defaultProducts));
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  };

  const handleAddProduct = (e) => {
    e.preventDefault();
    
    const newProduct = {
      id: Date.now(),
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock),
      features: formData.features.filter(f => f.trim() !== ''),
      isPopular: false
    };

    const updatedProducts = [...products, newProduct];
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));

    setShowAddModal(false);
    resetForm();
    alert('Product added successfully!');
  };

  const handleEditProduct = (e) => {
    e.preventDefault();
    
    const updatedProducts = products.map(p =>
      p.id === selectedProduct.id
        ? {
            ...p,
            ...formData,
            price: parseFloat(formData.price),
            stock: parseInt(formData.stock),
            features: formData.features.filter(f => f.trim() !== '')
          }
        : p
    );

    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));

    setShowEditModal(false);
    setSelectedProduct(null);
    resetForm();
    alert('Product updated successfully!');
  };

  const handleDeleteProduct = (productId) => {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const updatedProducts = products.filter(p => p.id !== productId);
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
    alert('Product deleted successfully!');
  };

  const handleStockUpdate = (productId, newStock) => {
    const updatedProducts = products.map(p =>
      p.id === productId ? { ...p, stock: parseInt(newStock) } : p
    );
    setProducts(updatedProducts);
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  };

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      image: product.image,
      stock: product.stock,
      features: product.features || []
    });
    setShowEditModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'classic',
      image: '',
      stock: 100,
      features: []
    });
  };

  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index, value) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData(prev => ({ ...prev, features: newFeatures }));
  };

  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  return (
    <AdminLayout>
      <div className="container-custom max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Manage Products</h1>
          <p className="text-gray-600">Add, edit, and manage product inventory</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="text-blue-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{products.length}</h3>
            <p className="text-sm text-gray-600">Total Products</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Package className="text-green-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {products.filter(p => p.stock > 20).length}
            </h3>
            <p className="text-sm text-gray-600">In Stock</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Package className="text-yellow-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {products.filter(p => p.stock > 0 && p.stock <= 20).length}
            </h3>
            <p className="text-sm text-gray-600">Low Stock</p>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Package className="text-red-600" size={24} />
              </div>
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">
              {products.filter(p => p.stock === 0).length}
            </h3>
            <p className="text-sm text-gray-600">Out of Stock</p>
          </div>
        </div>

        {/* Search and Add Button */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="classic">Classic</option>
                <option value="premium">Premium</option>
                <option value="healthy">Healthy</option>
                <option value="fusion">Fusion</option>
              </select>

              <button
                onClick={() => setShowAddModal(true)}
                className="flex items-center space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
              >
                <Plus size={20} />
                <span>Add Product</span>
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="h-48 bg-gradient-to-br from-primary-100 to-orange-100 flex items-center justify-center">
                <span className="text-6xl">{product.category === 'classic' ? '🍊' : product.category === 'premium' ? '🥤' : product.category === 'healthy' ? '🥗' : '🍹'}</span>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-xl font-bold text-gray-900">{product.name}</h3>
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold capitalize">
                    {product.category}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
                
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Stock:</span>
                    <input
                      type="number"
                      value={product.stock}
                      onChange={(e) => handleStockUpdate(product.id, e.target.value)}
                      className="w-20 px-2 py-1 border-2 border-gray-200 rounded focus:border-primary-500 focus:outline-none text-center"
                      min="0"
                    />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        product.stock > 50 ? 'bg-green-500' :
                        product.stock > 20 ? 'bg-yellow-500' :
                        product.stock > 0 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-primary-600">{formatPrice(product.price)}</span>
                  <span className={`text-sm font-semibold ${
                    product.stock > 20 ? 'text-green-600' :
                    product.stock > 0 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {product.stock > 20 ? 'In Stock' :
                     product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditModal(product)}
                    className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 border-2 border-primary-500 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors font-medium"
                  >
                    <Edit size={16} />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product.id)}
                    className="flex-1 flex items-center justify-center space-x-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                  >
                    <Trash2 size={16} />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <Package size={64} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No products found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}

        {/* Add/Edit Product Modal */}
        {(showAddModal || showEditModal) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => {
            setShowAddModal(false);
            setShowEditModal(false);
            resetForm();
          }}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900">
                  {showAddModal ? 'Add New Product' : 'Edit Product'}
                </h2>
              </div>

              <form onSubmit={showAddModal ? handleAddProduct : handleEditProduct} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                    placeholder="e.g., Fresh Orange Juice"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={3}
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none resize-none"
                    placeholder="Product description..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price (₹) *</label>
                    <input
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="89.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Stock Count *</label>
                    <input
                      type="number"
                      value={formData.stock}
                      onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                      required
                      min="0"
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                      placeholder="100"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                  >
                    <option value="classic">Classic</option>
                    <option value="premium">Premium</option>
                    <option value="healthy">Healthy</option>
                    <option value="fusion">Fusion</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none"
                        placeholder="e.g., 100% Natural"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    + Add Feature
                  </button>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false);
                      setShowEditModal(false);
                      resetForm();
                    }}
                    className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                  >
                    {showAddModal ? 'Add Product' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
