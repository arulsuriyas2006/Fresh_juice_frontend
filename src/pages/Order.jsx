import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, MapPin, Phone, CreditCard, CheckCircle, Plus, Minus, Trash2, Gift } from 'lucide-react';
import { products, PAYMENT_MODES } from '../data/products';
import { generateOrderId, formatPrice } from '../lib/utils';
import { ordersAPI, loyaltyAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { initiateRazorpayPayment } from '../lib/razorpay';

export default function Order() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const preSelectedProduct = location.state?.product;

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    paymentMode: 'cash'
  });

  const [cart, setCart] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [errors, setErrors] = useState({});
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);

  // Delivery fee constant
  const DELIVERY_FEE = 20;

  // Pre-fill form with user data and add pre-selected product to cart
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
        address: user.address || prev.address
      }));
      // Fetch loyalty points
      if (user.email) {
        fetchLoyaltyPoints();
      }
    }
    if (preSelectedProduct && cart.length === 0) {
      setCart([{ product: preSelectedProduct, quantity: 1 }]);
    }
  }, [user, preSelectedProduct]);

  const fetchLoyaltyPoints = async () => {
    try {
      const response = await loyaltyAPI.getPoints(user.email);
      setLoyaltyPoints(response.loyaltyPoints || 0);
    } catch (error) {
      console.error('Error fetching loyalty points:', error);
    }
  };

  const totalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalProductCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const pointsToRedeem = useLoyaltyPoints ? Math.min(loyaltyPoints, totalPrice) : 0;
  const subtotalAfterDiscount = totalPrice - pointsToRedeem;
  const finalPrice = subtotalAfterDiscount + DELIVERY_FEE;

  const addToCart = () => {
    if (!selectedProductId) {
      setErrors(prev => ({ ...prev, productId: 'Please select a product' }));
      return;
    }

    const product = products.find(p => p.id === parseInt(selectedProductId));
    const existingItem = cart.find(item => item.product.id === product.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.product.id === product.id
          ? { ...item, quantity: item.quantity + selectedQuantity }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: selectedQuantity }]);
    }

    setSelectedProductId('');
    setSelectedQuantity(1);
    setErrors(prev => ({ ...prev, productId: '' }));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCart(cart.map(item =>
      item.product.id === productId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid 10-digit phone number';
    }
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (cart.length === 0) newErrors.cart = 'Please add at least one product to cart';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const createOrderInDatabase = async (newOrderId, paymentStatus = 'pending') => {
    // Create orders for each product in cart
    for (const item of cart) {
      const orderData = {
        orderId: newOrderId,
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        totalPrice: item.product.price * item.quantity,
        paymentMode: formData.paymentMode,
        paymentStatus: paymentStatus
      };
      await ordersAPI.createOrder(orderData);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    
    try {
      const newOrderId = generateOrderId();

      // Check payment mode first
      if (formData.paymentMode === 'online') {
        // Handle loyalty points redemption for online payment
        if (useLoyaltyPoints && pointsToRedeem > 0 && user?.email) {
          await loyaltyAPI.redeemPoints(user.email, pointsToRedeem);
        }

        // Initiate Razorpay for online payment
        const razorpayData = {
          amount: finalPrice, // Use final price after loyalty discount
          orderId: newOrderId,
          description: `Order for ${cart.length} item(s)`,
          customerName: formData.name,
          customerPhone: formData.phone,
          customerEmail: user?.email || '',
          address: formData.address
        };

        initiateRazorpayPayment(
          razorpayData,
          async (paymentResponse) => {
            // Payment successful
            try {
              await createOrderInDatabase(newOrderId, 'paid');
              // Add loyalty points for this order (1 point per product)
              if (user?.email) {
                await loyaltyAPI.addPoints(user.email, totalProductCount);
              }
              setOrderId(newOrderId);
              setOrderSuccess(true);
              // Reset form
              setFormData({
                name: user?.name || '',
                phone: user?.phone || '',
                address: user?.address || '',
                paymentMode: 'cash'
              });
              setCart([]);
              setUseLoyaltyPoints(false);
              setLoading(false);
            } catch (error) {
              console.error('Order creation error:', error);
              alert('Payment successful but failed to save order. Please contact support with Payment ID: ' + paymentResponse.razorpay_payment_id);
              setLoading(false);
            }
          },
          (error) => {
            // Payment failed or cancelled
            alert('Payment cancelled or failed: ' + error);
            setLoading(false);
          }
        );
      } else {
        // Cash on Delivery - Direct order placement without Razorpay
        console.log('Processing Cash on Delivery order...');
        
        // Handle loyalty points redemption for COD
        if (useLoyaltyPoints && pointsToRedeem > 0 && user?.email) {
          await loyaltyAPI.redeemPoints(user.email, pointsToRedeem);
        }
        
        // Create order in database
        await createOrderInDatabase(newOrderId, 'cod');
        
        // Add loyalty points for this order (1 point per product)
        if (user?.email) {
          await loyaltyAPI.addPoints(user.email, totalProductCount);
        }
        
        console.log('Cash on Delivery order placed successfully!');
        
        setOrderId(newOrderId);
        setOrderSuccess(true);
        
        // Reset form
        setFormData({
          name: user?.name || '',
          phone: user?.phone || '',
          address: user?.address || '',
          paymentMode: 'cash'
        });
        setCart([]);
        setUseLoyaltyPoints(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('Order error:', error);
      alert('Failed to place order: ' + (error.message || 'Please try again.'));
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen py-12 flex items-center justify-center">
        <div className="container-custom max-w-2xl">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center animate-slide-up">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="text-green-500" size={48} />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Order Placed Successfully! 🎉
            </h2>
            <p className="text-gray-600 mb-6">
              Thank you for your order. Your fresh juice is being prepared!
            </p>
            
            <div className="bg-primary-50 rounded-xl p-6 mb-8">
              <p className="text-sm text-gray-600 mb-2">Your Order ID</p>
              <p className="text-3xl font-bold text-primary-600 font-mono">{orderId}</p>
              <p className="text-sm text-gray-500 mt-2">Save this ID to track your order</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/track', { state: { orderId } })}
                className="btn-primary"
              >
                Track Order
              </button>
              <button
                onClick={() => setOrderSuccess(false)}
                className="btn-secondary"
              >
                Place Another Order
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container-custom max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
            Place Your Order
          </h1>
          <p className="text-xl text-gray-600">
            Fill in your details and get fresh juice delivered in minutes!
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-8 animate-slide-up">
              {/* Personal Information */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <User className="text-primary-500" size={24} />
                  <span>Personal Information</span>
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`input-field ${errors.name ? 'border-red-500' : ''}`}
                      placeholder="Enter your full name"
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className={`input-field pl-12 ${errors.phone ? 'border-red-500' : ''}`}
                        placeholder="10-digit mobile number"
                      />
                    </div>
                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        rows="3"
                        className={`input-field pl-12 ${errors.address ? 'border-red-500' : ''}`}
                        placeholder="Enter your complete delivery address"
                      />
                    </div>
                    {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
                  </div>
                </div>
              </div>

              {/* Product Selection */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <ShoppingCart className="text-primary-500" size={24} />
                  <span>Add Products to Cart</span>
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Product
                      </label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => {
                          setSelectedProductId(e.target.value);
                          setErrors(prev => ({ ...prev, productId: '' }));
                        }}
                        className={`input-field ${errors.productId ? 'border-red-500' : ''}`}
                      >
                        <option value="">Choose a juice...</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {formatPrice(product.price)}
                          </option>
                        ))}
                      </select>
                      {errors.productId && <p className="text-red-500 text-sm mt-1">{errors.productId}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={selectedQuantity}
                        onChange={(e) => setSelectedQuantity(parseInt(e.target.value) || 1)}
                        min="1"
                        max="20"
                        className="input-field"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addToCart}
                    className="btn-secondary w-full flex items-center justify-center space-x-2"
                  >
                    <Plus size={18} />
                    <span>Add to Cart</span>
                  </button>
                </div>

                {/* Cart Items */}
                {cart.length > 0 && (
                  <div className="mt-6 space-y-3">
                    <h4 className="font-semibold text-gray-900">Cart Items ({cart.length})</h4>
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-sm text-gray-600">{formatPrice(item.product.price)} × {item.quantity}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="p-1 hover:bg-gray-200 rounded"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                          <span className="font-semibold text-primary-600 w-20 text-right">
                            {formatPrice(item.product.price * item.quantity)}
                          </span>
                          <button
                            type="button"
                            onClick={() => removeFromCart(item.product.id)}
                            className="p-2 hover:bg-red-100 text-red-600 rounded"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.cart && <p className="text-red-500 text-sm mt-2">{errors.cart}</p>}
              </div>

              {/* Loyalty Points */}
              {loyaltyPoints > 0 && cart.length > 0 && (
                <div className="mb-8">
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <Gift className="text-amber-600" size={24} />
                        <h3 className="text-lg font-bold text-gray-900">Loyalty Points</h3>
                      </div>
                      <div className="bg-amber-600 text-white px-4 py-1 rounded-full font-bold">
                        {loyaltyPoints} Points
                      </div>
                    </div>
                    
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useLoyaltyPoints}
                        onChange={(e) => setUseLoyaltyPoints(e.target.checked)}
                        className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                      />
                      <div className="flex-1">
                        <span className="font-medium text-gray-900">
                          Use {Math.min(loyaltyPoints, totalPrice)} points to reduce ₹{Math.min(loyaltyPoints, totalPrice)}
                        </span>
                        <p className="text-sm text-gray-600 mt-1">
                          1 Point = ₹1 discount. You'll earn {totalProductCount} points from this order!
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Payment Mode */}
              <div className="mb-8">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center space-x-2">
                  <CreditCard className="text-primary-500" size={24} />
                  <span>Payment Mode</span>
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {PAYMENT_MODES.map(mode => (
                    <label
                      key={mode.id}
                      className={`flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        formData.paymentMode === mode.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-primary-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMode"
                        value={mode.id}
                        checked={formData.paymentMode === mode.id}
                        onChange={handleChange}
                        className="mr-2"
                      />
                      <span className="font-medium">{mode.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="btn-primary w-full text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-24 animate-slide-up">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h3>
              
              {cart.length > 0 ? (
                <>
                  <div className="mb-4 space-y-3 max-h-64 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={item.product.id} className="flex space-x-3 pb-3 border-b border-gray-100">
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-sm text-gray-900">{item.product.name}</h4>
                          <p className="text-xs text-gray-600">{formatPrice(item.product.price)} × {item.quantity}</p>
                          <p className="text-sm font-medium text-primary-600 mt-1">
                            {formatPrice(item.product.price * item.quantity)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-gray-200 pt-4 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatPrice(totalPrice)}</span>
                    </div>
                    {useLoyaltyPoints && pointsToRedeem > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-amber-600 flex items-center space-x-1">
                          <Gift size={16} />
                          <span>Loyalty Discount</span>
                        </span>
                        <span className="font-medium text-amber-600">-{formatPrice(pointsToRedeem)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery</span>
                      <span className="font-medium text-gray-900">{formatPrice(DELIVERY_FEE)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-bold text-2xl text-primary-600">
                        {formatPrice(finalPrice)}
                      </span>
                    </div>
                    {useLoyaltyPoints && pointsToRedeem > 0 && (
                      <div className="text-xs text-amber-600 text-center bg-amber-50 py-2 rounded">
                        🎉 You saved ₹{pointsToRedeem} with loyalty points!
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
                  <p>Add products to see summary</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
