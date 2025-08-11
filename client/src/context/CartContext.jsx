import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([
    // One demo item to test cart functionality
    {
      id: 999,
      image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400&h=300&fit=crop&crop=center",
      name: "Test Demo Item",
      category: "Demo Equipment",
      price: 1000,
      originalPrice: 1200,
      period: "day",
      quantity: 1,
      days: 1,
      location: "Demo Location",
      brand: "Demo Brand",
    }
  ]);
  
  console.log('CartProvider initialized with cartItems:', cartItems);

  const addToCart = (product, days = 1) => {
    console.log('Adding to cart:', product); // Debug log
    
    const existingItem = cartItems.find(item => item.id === product.id);
    
    if (existingItem) {
      // If item already exists, increase quantity
      setCartItems(prev =>
        prev.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      // Add new item to cart
      const cartItem = {
        id: product.id,
        image: product.image,
        name: product.name,
        category: product.category,
        price: parseInt(product.price.replace('₹', '').replace(',', '')),
        originalPrice: parseInt(product.originalPrice.replace('₹', '').replace(',', '')),
        period: product.rentalPeriod === "Per Day" ? "day" : "day",
        quantity: 1,
        days: days,
        location: product.location,
        brand: product.brand,
      };
      
      console.log('Cart item to add:', cartItem); // Debug log
      setCartItems(prev => {
        const newCart = [...prev, cartItem];
        console.log('New cart state:', newCart); // Debug log
        return newCart;
      });
    }

    // Show success message
    showAddedToCartMessage(product.name);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const updateDays = (productId, newDays) => {
    if (newDays < 1) return;
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === productId ? { ...item, days: newDays } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getCartTotal = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity * item.days), 0);
    const tax = subtotal * 0.18; // 18% GST
    return subtotal + tax;
  };

  const isInCart = (productId) => {
    return cartItems.some(item => item.id === productId);
  };

  const showAddedToCartMessage = (productName) => {
    // Create and show a toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform transition-all duration-300';
    toast.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
        </svg>
        <span class="font-medium">${productName} added to cart!</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  };

  const value = {
    cartItems,
    setCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateDays,
    clearCart,
    getCartCount,
    getCartTotal,
    isInCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartContext;