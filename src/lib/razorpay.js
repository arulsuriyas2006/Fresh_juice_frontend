// Razorpay Integration

const RAZORPAY_KEY_ID = 'rzp_test_RN5RT3SpBDWrqZ';

// Load Razorpay script
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    // Check if script already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => {
      console.log('Razorpay script loaded successfully');
      resolve(true);
    };
    script.onerror = () => {
      console.error('Failed to load Razorpay script');
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

// Initialize Razorpay payment
export const initiateRazorpayPayment = async (orderData, onSuccess, onFailure) => {
  try {
    // Load Razorpay script
    const scriptLoaded = await loadRazorpayScript();
    
    if (!scriptLoaded) {
      const errorMsg = 'Failed to load Razorpay SDK. Please check your internet connection and try again.';
      alert(errorMsg);
      if (onFailure) onFailure(errorMsg);
      return;
    }

    // Wait a bit for script to initialize
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify Razorpay is available
    if (!window.Razorpay) {
      const errorMsg = 'Razorpay SDK failed to initialize. Please refresh the page and try again.';
      alert(errorMsg);
      if (onFailure) onFailure(errorMsg);
      return;
    }

    // Validate required data
    if (!orderData.amount || orderData.amount <= 0) {
      const errorMsg = 'Invalid payment amount';
      alert(errorMsg);
      if (onFailure) onFailure(errorMsg);
      return;
    }

    const options = {
      key: RAZORPAY_KEY_ID,
      amount: Math.round(orderData.amount * 100), // Amount in paise (₹1 = 100 paise)
      currency: 'INR',
      name: 'FreshJuice',
      description: orderData.description || 'Fresh Orange Juice Order',
      image: '/logo.png', // Your logo
      // Note: order_id should only be used with Razorpay Orders API
      // For simple checkout, we don't need it
      handler: function (response) {
        // Payment successful
        console.log('Payment successful:', response);
        onSuccess({
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature
        });
      },
      prefill: {
        name: orderData.customerName,
        email: orderData.customerEmail || '',
        contact: orderData.customerPhone
      },
      notes: {
        address: orderData.address,
        order_id: orderData.orderId
      },
      theme: {
        color: '#f97316' // Primary orange color
      },
      modal: {
        ondismiss: function() {
          // Payment cancelled
          console.log('Payment cancelled by user');
          if (onFailure) {
            onFailure('Payment cancelled by user');
          }
        }
      }
    };

    console.log('Opening Razorpay with options:', { ...options, key: 'HIDDEN' });
    const razorpay = new window.Razorpay(options);
    razorpay.open();
    
  } catch (error) {
    console.error('Razorpay initialization error:', error);
    const errorMsg = 'Failed to initialize payment. Please try again.';
    alert(errorMsg);
    if (onFailure) onFailure(errorMsg);
  }
};
