import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Helper function to create order in database for single product
const createOrderInDatabase = async (product, orderDetails, billingDetails) => {
  try {
    const customerId = localStorage.getItem('userId') || '6899d8609040f3cd865a896b'; // Fallback for testing
    
    // Create proper start and end dates
    const now = new Date();
    const startDate = orderDetails.startDate || new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
    const days = orderDetails.days || 1;
    const endDate = orderDetails.endDate || new Date(now.getTime() + (days + 1) * 24 * 60 * 60 * 1000).toISOString(); // Days after tomorrow

    const orderData = {
      customerId: customerId,
      items: [{
        productId: product._id || product.id,
        quantity: 1,
        startDate: startDate,
        endDate: endDate
      }],
      depositAmount: orderDetails.finalAmount, // Full payment as deposit
      notes: `Single product rental - ${product.name}`,
      pricelistId: null, // Optional pricelist
      billingDetails: {
        fullName: billingDetails.fullName,
        email: billingDetails.email,
        phone: billingDetails.phone,
        address: billingDetails.address,
        city: billingDetails.city
      }
    };

    console.log('📅 Order dates:', { startDate, endDate, days });

    console.log('Creating order with data:', orderData);

    // Check if user is authenticated
    let token = localStorage.getItem('token');
    
    // Temporary test token for development
    if (!token) {
      token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODlhN2E3NTYzMzk4MGYyZDQ1ZWM2ZWEiLCJpYXQiOjE3NTQ5NTQzNTcsImV4cCI6MTc1NTA0MDc1NywiaXNzIjoicmVudGhpdmUtYXBpIn0.b_SPDawmXxUEdcbQnx9RIQAg54I1w2fvCA8NozqCdyQ';
      console.log('🔧 Using temporary test token for development');
    }
    
    if (!token) {
      console.warn('⚠️ No authentication token found, skipping order creation');
      console.log('💡 Order will not be saved to database, but stock will still be updated');
      return null;
    }

    const orderResponse = await fetch('http://localhost:8000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const orderResult = await orderResponse.json();
    console.log('Order creation result:', orderResult);

    if (!orderResponse.ok) {
      console.error('Order creation failed:', orderResult);
      throw new Error(`Failed to create order: ${orderResult.message || 'Unknown error'}`);
    }

    console.log('✅ Order created successfully:', orderResult);
    return orderResult;
  } catch (error) {
    console.error('❌ Error creating order:', error);
    // Re-throw the error so the checkout process can handle it properly
    throw error;
  }
};

// Helper function to create order for multiple items
const createOrderForMultipleItems = async (cartItems, orderDetails, billingDetails) => {
  try {
    const customerId = localStorage.getItem('userId') || '6899d8609040f3cd865a896b'; // Fallback for testing
    
    // Create proper start and end dates for multiple items
    const now = new Date();
    const startDate = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(); // Tomorrow
    const endDate = new Date(now.getTime() + 8 * 24 * 60 * 60 * 1000).toISOString(); // 8 days from now (7 day rental)

    const orderData = {
      customerId: customerId,
      items: cartItems.map(item => ({
        productId: item._id || item.id,
        quantity: item.quantity || 1,
        startDate: item.startDate || startDate,
        endDate: item.endDate || endDate
      })),
      depositAmount: orderDetails.finalAmount, // Full payment as deposit
      notes: `Cart checkout - ${cartItems.length} items`,
      pricelistId: null, // Optional pricelist
      billingDetails: {
        fullName: billingDetails.fullName,
        email: billingDetails.email,
        phone: billingDetails.phone,
        address: billingDetails.address,
        city: billingDetails.city
      }
    };

    console.log('📅 Multi-item order dates:', { startDate, endDate });

    console.log('Creating multi-item order with data:', orderData);

    // Check if user is authenticated
    let token = localStorage.getItem('token');
    
    // Temporary test token for development
    if (!token) {
      token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODlhN2E3NTYzMzk4MGYyZDQ1ZWM2ZWEiLCJpYXQiOjE3NTQ5NTQzNTcsImV4cCI6MTc1NTA0MDc1NywiaXNzIjoicmVudGhpdmUtYXBpIn0.b_SPDawmXxUEdcbQnx9RIQAg54I1w2fvCA8NozqCdyQ';
      console.log('🔧 Using temporary test token for development');
    }
    
    if (!token) {
      console.warn('⚠️ No authentication token found, skipping order creation');
      console.log('💡 Order will not be saved to database, but stock will still be updated');
      return null;
    }

    const orderResponse = await fetch('http://localhost:8000/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(orderData)
    });

    const orderResult = await orderResponse.json();
    console.log('Multi-item order creation result:', orderResult);

    if (!orderResponse.ok) {
      console.error('Multi-item order creation failed:', orderResult);
      throw new Error(`Failed to create order: ${orderResult.message || 'Unknown error'}`);
    }

    console.log('✅ Multi-item order created successfully:', orderResult);
    return orderResult;
  } catch (error) {
    console.error('❌ Error creating multi-item order:', error);
    // Re-throw the error so the checkout process can handle it properly
    throw error;
  }
};

// Professional Checkout Styles
const checkoutStyles = `
  @keyframes fadeIn {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes subtleHover {
    0% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-2px);
    }
  }

  .fade-in {
    animation: fadeIn 0.6s ease-out forwards;
  }

  .checkout-card {
    background: white;
    border-radius: 12px;
    padding: 32px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: all 0.2s ease;
  }

  .checkout-card:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
  }

  .payment-method-card {
    background: white;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s ease;
  }

  .payment-method-card:hover {
    border-color: #3b82f6;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
  }

  .payment-method-card.selected {
    border-color: #3b82f6;
    background-color: #eff6ff;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.1);
  }

  .input-field {
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 12px 16px;
    transition: all 0.2s ease;
    font-size: 16px;
    width: 100%;
  }

  .input-field:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  .primary-button {
    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
    border: none;
    border-radius: 8px;
    color: white;
    font-weight: 600;
    padding: 16px 24px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-size: 16px;
  }

  .primary-button:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }

  .primary-button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }

  .status-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get data from navigation state
  const { product, cartItems, isFromCart, cartData } = location.state || {};
  
  // Determine if it's single product or multiple items
  const isSingleProduct = product && !isFromCart;
  const isMultipleItems = isFromCart && cartItems && cartItems.length > 0;

  // State for form data
  const [billingDetails, setBillingDetails] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: '',
    city: ''
  });

  // Removed payment method selection - direct checkout

  const [orderDetails, setOrderDetails] = useState({
    startDate: '',
    endDate: '',
    days: 1,
    totalAmount: 0,
    finalAmount: 0,
    productData: null
  });

  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch product data from database and calculate order details
  useEffect(() => {
    const fetchProductDataAndCalculate = async () => {
      if (isFromCart && cartData) {
        // For cart items, use the calculated totals
        setOrderDetails({
          startDate: '',
          endDate: '',
          days: 0,
          totalAmount: cartData.subtotal || 0,
          finalAmount: cartData.total || 0
        });
      } else if (product) {
        try {
          // Fetch fresh product data from database
          const productId = product._id || product.id;
          const response = await fetch(`http://localhost:8000/api/products/${productId}`);
          const result = await response.json();
          
          console.log('API Response:', result);
          
          // Extract product data from the nested response structure
          const productData = result.data?.product || result;
          console.log('Extracted product data:', productData);
          
          if (productData && productData.pricing) {
            const days = orderDetails.days || 1;
            const dailyRate = productData.pricing.day || 500;
            const totalAmount = dailyRate * days;
            
            console.log('Price calculation:', { 
              productData: productData.pricing, 
              dailyRate, 
              days, 
              totalAmount 
            });

            setOrderDetails(prev => ({
              ...prev,
              totalAmount,
              finalAmount: totalAmount, // Simplified - no security deposit
              productData: productData // Store fresh product data
            }));
          } else {
            console.error('No pricing data found in product:', productData);
          }
        } catch (error) {
          console.error('Error fetching product data:', error);
          // Fallback to passed product data
          const days = orderDetails.days || 1;
          const dailyRate = product.pricing?.day || 500;
          const totalAmount = dailyRate * days;
          
          setOrderDetails(prev => ({
            ...prev,
            totalAmount,
            finalAmount: totalAmount
          }));
        }
      }
    };

    fetchProductDataAndCalculate();
  }, [product, cartData, isFromCart, orderDetails.days]);

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Process the order and update stock
      if (isSingleProduct) {
        // Use fresh product data from orderDetails if available, otherwise fetch
        let productData = orderDetails.productData;
        const productId = product._id || product.id;
        
        if (!productData) {
          console.log('Fetching fresh product data for stock check...');
          const stockResponse = await fetch(`http://localhost:8000/api/products/${productId}`);
          const stockResult = await stockResponse.json();
          productData = stockResult.data?.product || stockResult;
        }
        
        console.log('Using product data for stock update:', productData);
        
        if (!productData || productData.stock <= 0) {
          alert('Sorry, this product is out of stock!');
          setIsProcessing(false);
          return;
        }

        // Update stock for single product - decrease by 1
        const newStock = productData.stock - 1;
        const updatePayload = {
          name: productData.name,
          category: productData.category,
          description: productData.description,
          pricing: JSON.stringify(productData.pricing), // Convert pricing object to JSON string
          stock: newStock.toString(), // Convert to string as expected by API
          rentable: (newStock > 0).toString(), // Convert boolean to string
          isActive: "true" // Keep product active even when stock is 0 to avoid order creation issues
        };

        // Create order in database BEFORE updating stock to avoid availability conflicts
        try {
          await createOrderInDatabase(product, orderDetails, billingDetails);
          console.log('✅ Order creation completed');
        } catch (orderError) {
          console.error('❌ Order creation failed:', orderError.message);
          console.log('⚠️ Continuing with stock update...');
          // Continue with stock update even if order creation fails
        }

        console.log('Updating product with payload:', updatePayload);

        const updateResponse = await fetch(`http://localhost:8000/api/dev/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatePayload),
        });

        const updateResult = await updateResponse.json();
        console.log('Stock update result:', updateResult);

        if (!updateResponse.ok) {
          console.error('Failed to update stock:', updateResult);
          throw new Error('Failed to update stock');
        }
      } else if (isMultipleItems) {
        // Create order for multiple items BEFORE updating stock
        try {
          await createOrderForMultipleItems(cartItems, orderDetails, billingDetails);
          console.log('✅ Multi-item order creation completed');
        } catch (orderError) {
          console.error('❌ Multi-item order creation failed:', orderError.message);
          console.log('⚠️ Continuing with stock updates...');
          // Continue with stock updates even if order creation fails
        }
        
        // Check and update stock for multiple items
        for (const item of cartItems) {
          const itemId = item._id || item.id;
          const stockResponse = await fetch(`http://localhost:8000/api/products/${itemId}`);
          const stockResult = await stockResponse.json();
          const itemData = stockResult.data?.product || stockResult;
          
          if (itemData.stock <= 0) {
            alert(`Sorry, ${item.name} is out of stock!`);
            setIsProcessing(false);
            return;
          }

          // Update stock for each item
          const newItemStock = itemData.stock - 1;
          const updateResponse = await fetch(`http://localhost:8000/api/dev/products/${itemId}`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              name: itemData.name,
              category: itemData.category,
              description: itemData.description,
              pricing: JSON.stringify(itemData.pricing), // Convert pricing object to JSON string
              stock: newItemStock.toString(), // Convert to string as expected by API
              rentable: (newItemStock > 0).toString(), // Convert boolean to string
              isActive: "true" // Keep product active even when stock is 0 to avoid order creation issues
            }),
          });

          const updateResult = await updateResponse.json();
          console.log(`Stock update result for ${item.name}:`, updateResult);

          if (!updateResponse.ok) {
            throw new Error(`Failed to update stock for ${item.name}`);
          }
        }
      }

      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate to order confirmation
      navigate('/customer/order-confirmation', {
        state: {
          order: {
            id: `ORD-${Date.now()}`,
            billingDetails,
            paymentMethod: 'Direct Payment',
            ...orderDetails
          },
          product: isSingleProduct ? product : null,
          cartItems: isMultipleItems ? cartItems : null
        }
      });
    } catch (error) {
      console.error('Order failed:', error);
      alert('Order processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // If no product or cart data, show error
  if (!product && !cartItems) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Items Selected</h2>
          <p className="text-gray-600 mb-6">Please select items to checkout.</p>
          <button
            onClick={() => navigate('/customer/customer-dashboard')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Go to Equipment Gallery
          </button>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <style>{checkoutStyles}</style>
      <div className="min-h-screen bg-gray-50">
        <div className="py-8 px-4">
          <div className="max-w-7xl mx-auto">
            {/* Professional Header */}
            <div className="text-center py-6 mb-8 fade-in">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Complete Your Order
              </h1>
              <div className="bg-white rounded-lg p-4 max-w-2xl mx-auto shadow-sm border">
                <p className="text-lg text-gray-700 font-medium mb-3">
                  {isMultipleItems 
                    ? `Secure checkout for ${cartItems.length} items`
                    : `Secure checkout for ${product.name}`
                  }
                </p>
                <div className="flex items-center justify-center gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="status-indicator bg-green-500"></span>
                    <span>SSL Secured</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="status-indicator bg-blue-500"></span>
                    <span>Instant Confirmation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="status-indicator bg-purple-500"></span>
                    <span>24/7 Support</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="checkout-card fade-in">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Summary</h2>
                <p className="text-gray-600 mb-6">Review your rental details</p>
                
                {/* Product/Cart Details */}
                {isMultipleItems ? (
                  /* Multiple Items from Cart */
                  <div className="space-y-4 mb-6">
                    <h3 className="font-semibold text-gray-800 mb-4">Items ({cartItems.length})</h3>
                    {cartItems.map((item, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-800">{item.name}</div>
                          <div className="text-sm text-gray-600">{item.days} days</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-800">₹{item.total}</div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Rental Summary for Cart */}
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium text-gray-800 mb-2">Rental Summary</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Total Items: {cartItems.length}</div>
                        <div>Average Duration: {Math.round(cartItems.reduce((sum, item) => sum + item.days, 0) / cartItems.length)} days</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Single Product */
                  <div className="mb-6">
                    <div className="flex items-center gap-4 mb-4">
                      <img 
                        src={product.image || '/truck.png'} 
                        alt={product.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div>
                        <h3 className="font-semibold text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.category}</p>
                        <div className="flex items-center gap-1 mt-1">
                          <span className="text-yellow-500">★</span>
                          <span className="text-sm text-gray-600">{product.rating || '4.5'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Rental Period - Only for single product flow */}
                    {!isFromCart && (
                      <div className="mb-4">
                        <h4 className="font-medium text-gray-800 mb-3">Rental Period</h4>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">Start Date</label>
                            <input
                              type="date"
                              value={orderDetails.startDate}
                              onChange={(e) => setOrderDetails(prev => ({ ...prev, startDate: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm text-gray-600 mb-1">End Date</label>
                            <input
                              type="date"
                              value={orderDetails.endDate}
                              onChange={(e) => {
                                const endDate = e.target.value;
                                const startDate = orderDetails.startDate;
                                if (startDate && endDate) {
                                  const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1;
                                  setOrderDetails(prev => ({ ...prev, endDate, days: Math.max(1, days) }));
                                } else {
                                  setOrderDetails(prev => ({ ...prev, endDate }));
                                }
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                              required
                            />
                          </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-600">
                          Duration: {orderDetails.days} day{orderDetails.days !== 1 ? 's' : ''}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Price Breakdown */}
                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-800 mb-3">Price Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">
                        {isFromCart ? 'Cart Total' : `Rental (${orderDetails.days} day${orderDetails.days !== 1 ? 's' : ''})`}
                      </span>
                      <span className="text-gray-800">₹{orderDetails.totalAmount || 0}</span>
                    </div>
                    {isFromCart && cartData && cartData.tax && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tax</span>
                        <span className="text-gray-800">₹{cartData.tax}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-semibold text-lg border-t pt-2">
                      <span className="text-gray-800">Total Amount</span>
                      <span className="text-blue-600">₹{orderDetails.finalAmount || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Payment Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handlePayment} className="space-y-6">
                {/* Billing Details */}
                <div className="checkout-card fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Billing Information</h2>
                  <p className="text-gray-600 mb-6">Please provide your billing details</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={billingDetails.fullName}
                        onChange={(e) => setBillingDetails(prev => ({ ...prev, fullName: e.target.value }))}
                        className="input-field"
                        placeholder="Enter your full name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={billingDetails.email}
                        onChange={(e) => setBillingDetails(prev => ({ ...prev, email: e.target.value }))}
                        className="input-field"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                      <input
                        type="tel"
                        value={billingDetails.phone}
                        onChange={(e) => setBillingDetails(prev => ({ ...prev, phone: e.target.value }))}
                        className="input-field"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                      <input
                        type="text"
                        value={billingDetails.city}
                        onChange={(e) => setBillingDetails(prev => ({ ...prev, city: e.target.value }))}
                        className="input-field"
                        placeholder="Mumbai, Delhi, etc."
                        required
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Complete Address</label>
                      <textarea
                        value={billingDetails.address}
                        onChange={(e) => setBillingDetails(prev => ({ ...prev, address: e.target.value }))}
                        rows="3"
                        className="input-field resize-none"
                        placeholder="Enter your complete address with pincode..."
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Order Confirmation */}
                <div className="checkout-card fade-in">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Order Confirmation</h2>
                  <p className="text-gray-600 mb-6">Review your order details before confirming</p>
                  
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900">Ready to Confirm</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Your order will be processed immediately and the items will be reserved for you.
                    </p>
                    <div className="text-sm text-blue-800 bg-blue-100 rounded-md p-3">
                      <strong>Note:</strong> Stock will be automatically updated after confirmation. 
                      Items will become unavailable if stock reaches zero.
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="checkout-card fade-in text-center">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Complete Your Order</h3>
                  
                  <button
                    type="submit"
                    disabled={isProcessing || (!isFromCart && (!orderDetails.startDate || !orderDetails.endDate))}
                    className={`primary-button w-full max-w-md text-lg ${
                      isProcessing || (!isFromCart && (!orderDetails.startDate || !orderDetails.endDate))
                        ? 'opacity-50 cursor-not-allowed'
                        : ''
                    }`}
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing Payment...</span>
                      </div>
                    ) : (
                      <span>Pay Now - ₹{orderDetails.finalAmount || 0}</span>
                    )}
                  </button>
                  
                  <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="status-indicator bg-green-500"></span>
                      <span>SSL Encrypted</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="status-indicator bg-blue-500"></span>
                      <span>Instant Confirmation</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="status-indicator bg-purple-500"></span>
                      <span>Secure Payment</span>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-xs text-gray-500">
                    By completing this payment, you agree to our terms and conditions
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    </React.Fragment>
  );
};

export default Checkout;