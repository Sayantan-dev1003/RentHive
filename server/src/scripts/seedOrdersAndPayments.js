require('dotenv').config();

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Product = require('../models/Product');
const PickupSlot = require('../models/PickupSlot');

const MONGODB_URI = 'mongodb+srv://sayantanhalder78:F0vDLk5Afmxx6rHb@renthive.4dl7vm0.mongodb.net/?retryWrites=true&w=majority&appName=RentHive';

// Helper function to generate random date within a range
function randomDateBetween(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate realistic billing details
function generateBillingDetails(customerName) {
  const addresses = [
    { street: "123 MG Road", city: "Mumbai", state: "Maharashtra", zipCode: "400001" },
    { street: "456 Park Street", city: "Delhi", state: "Delhi", zipCode: "110001" },
    { street: "789 Brigade Road", city: "Bangalore", state: "Karnataka", zipCode: "560001" },
    { street: "321 Anna Salai", city: "Chennai", state: "Tamil Nadu", zipCode: "600001" },
    { street: "654 Sector 15", city: "Gurgaon", state: "Haryana", zipCode: "122001" }
  ];
  
  const address = addresses[Math.floor(Math.random() * addresses.length)];
  
  return {
    name: customerName,
    email: customerName.toLowerCase().replace(' ', '.') + '@email.com',
    phone: `+91 ${Math.floor(Math.random() * 9000000000) + 1000000000}`,
    address: {
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: "India"
    }
  };
}

// Generate realistic rental duration
function generateRentalDuration() {
  const now = new Date();
  const durationTypes = [
    { days: 1, weight: 30 },    // 30% daily rentals
    { days: 3, weight: 25 },    // 25% 3-day rentals
    { days: 7, weight: 20 },    // 20% weekly rentals
    { days: 14, weight: 15 },   // 15% bi-weekly rentals
    { days: 30, weight: 10 }    // 10% monthly rentals
  ];
  
  const random = Math.random() * 100;
  let cumulative = 0;
  
  for (const duration of durationTypes) {
    cumulative += duration.weight;
    if (random <= cumulative) {
      const startDate = randomDateBetween(
        new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)  // 10 days from now
      );
      const endDate = new Date(startDate.getTime() + duration.days * 24 * 60 * 60 * 1000);
      
      return { startDate, endDate, days: duration.days };
    }
  }
  
  // Default fallback
  const startDate = new Date();
  const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
  return { startDate, endDate, days: 7 };
}

async function seedOrdersAndPayments() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Get existing data
    const customers = await User.find({ role: 'customer' });
    const admins = await User.find({ role: 'admin' });
    const products = await Product.find({ isActive: true });
    const pickupSlots = await PickupSlot.find({ isActive: true });

    console.log(`👥 Found ${customers.length} customers`);
    console.log(`🔧 Found ${admins.length} admins`);
    console.log(`📦 Found ${products.length} products`);
    console.log(`🕐 Found ${pickupSlots.length} pickup slots\n`);

    if (customers.length === 0 || products.length === 0) {
      throw new Error('Need at least 1 customer and 1 product to generate orders');
    }

    // Generate orders for the last 6 months
    const orders = [];
    const payments = [];
    const orderStatuses = ['reserved', 'picked_up', 'returned', 'cancelled'];
    const paymentStatuses = ['pending', 'partial', 'paid'];
    
    // Generate more orders for recent months
    const monthlyOrderCounts = [45, 52, 38, 41, 48, 55]; // Last 6 months
    
    for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
      const orderCount = monthlyOrderCounts[5 - monthOffset];
      console.log(`📅 Generating ${orderCount} orders for month ${monthOffset + 1} ago...`);
      
      for (let i = 0; i < orderCount; i++) {
        try {
          // Random customer
          const customer = customers[Math.floor(Math.random() * customers.length)];
          const admin = admins[Math.floor(Math.random() * admins.length)];
          
          // Random order date within the month
          const monthStart = new Date();
          monthStart.setMonth(monthStart.getMonth() - monthOffset);
          monthStart.setDate(1);
          monthStart.setHours(0, 0, 0, 0);
          
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthEnd.getMonth() + 1);
          monthEnd.setDate(0);
          monthEnd.setHours(23, 59, 59, 999);
          
          const orderDate = randomDateBetween(monthStart, monthEnd);
          
          // Generate rental duration
          const rentalDuration = generateRentalDuration();
          
          // Random product(s) - 70% single item, 30% multiple items
          const itemCount = Math.random() < 0.7 ? 1 : Math.floor(Math.random() * 3) + 1;
          const selectedProducts = [];
          
          for (let j = 0; j < itemCount; j++) {
            const product = products[Math.floor(Math.random() * products.length)];
            if (!selectedProducts.some(p => p._id.toString() === product._id.toString())) {
              selectedProducts.push(product);
            }
          }
          
          // Generate order items
          const items = selectedProducts.map(product => {
            const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 items
            const basePrice = product.pricing.day * rentalDuration.days;
            const totalPrice = basePrice * quantity;
            
            return {
              productId: product._id,
              quantity,
              rentalDuration: {
                startDate: rentalDuration.startDate,
                endDate: rentalDuration.endDate
              },
              priceApplied: {
                basePrice: product.pricing.day,
                totalPrice,
                currency: 'INR'
              }
            };
          });
          
          const totalAmount = items.reduce((sum, item) => sum + item.priceApplied.totalPrice, 0);
          const depositAmount = Math.round(totalAmount * (0.2 + Math.random() * 0.5)); // 20-70% deposit
          
          // Order status based on time (older orders more likely to be completed)
          let status;
          const daysSinceOrder = (new Date() - orderDate) / (1000 * 60 * 60 * 24);
          
          if (daysSinceOrder > 30) {
            status = Math.random() < 0.8 ? 'returned' : (Math.random() < 0.5 ? 'picked_up' : 'cancelled');
          } else if (daysSinceOrder > 7) {
            status = Math.random() < 0.6 ? 'picked_up' : (Math.random() < 0.7 ? 'reserved' : 'returned');
          } else {
            status = Math.random() < 0.8 ? 'reserved' : 'picked_up';
          }
          
          // Payment status
          let paymentStatus;
          if (status === 'cancelled') {
            paymentStatus = Math.random() < 0.7 ? 'pending' : 'partial';
          } else if (status === 'returned') {
            paymentStatus = 'paid';
          } else {
            paymentStatus = Math.random() < 0.6 ? 'paid' : (Math.random() < 0.7 ? 'partial' : 'pending');
          }
          
          // Generate billing details
          const billingDetails = generateBillingDetails(customer.name);
          
          // Create order
          const order = new Order({
            customerId: customer._id,
            items,
            status,
            paymentStatus,
            depositAmount,
            totalAmount,
            billingDetails,
            notes: `Order placed on ${orderDate.toDateString()}`,
            createdBy: admin._id,
            createdAt: orderDate,
            updatedAt: orderDate
          });
          
          // Add pickup slot if order is picked up or returned
          if ((status === 'picked_up' || status === 'returned') && pickupSlots.length > 0) {
            const randomSlot = pickupSlots[Math.floor(Math.random() * pickupSlots.length)];
            order.pickupSlot = {
              slotId: randomSlot._id,
              confirmedAt: new Date(orderDate.getTime() + 24 * 60 * 60 * 1000), // Next day
              status: status === 'returned' ? 'completed' : 'confirmed'
            };
          }
          
          orders.push(order);
          
          // Create corresponding payments
          if (paymentStatus !== 'pending') {
            const paymentAmount = paymentStatus === 'paid' ? totalAmount : depositAmount;
            
            const payment = new Payment({
              orderId: order._id,
              customerId: customer._id,
              amount: paymentAmount,
              method: ['credit_card', 'debit_card', 'upi', 'bank_transfer'][Math.floor(Math.random() * 4)],
              status: 'completed',
              transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
              gatewayResponse: {
                gateway: 'razorpay',
                transactionId: `rzp_${Math.random().toString(36).substr(2, 9)}`,
                status: 'success'
              },
              createdAt: new Date(orderDate.getTime() + Math.random() * 60 * 60 * 1000), // Within an hour
              updatedAt: new Date(orderDate.getTime() + Math.random() * 60 * 60 * 1000)
            });
            
            payments.push(payment);
            
            // Add second payment for fully paid orders that were partially paid first
            if (paymentStatus === 'paid' && Math.random() < 0.3) {
              const remainingAmount = totalAmount - depositAmount;
              const secondPayment = new Payment({
                orderId: order._id,
                customerId: customer._id,
                amount: remainingAmount,
                method: ['credit_card', 'debit_card', 'upi'][Math.floor(Math.random() * 3)],
                status: 'completed',
                transactionId: `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`,
                gatewayResponse: {
                  gateway: 'razorpay',
                  transactionId: `rzp_${Math.random().toString(36).substr(2, 9)}`,
                  status: 'success'
                },
                createdAt: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days later
                updatedAt: new Date(orderDate.getTime() + 2 * 24 * 60 * 60 * 1000)
              });
              
              payments.push(secondPayment);
            }
          }
          
        } catch (error) {
          console.error(`❌ Error generating order ${i + 1} for month ${monthOffset + 1}:`, error.message);
        }
      }
    }
    
    console.log(`\n📊 Generated ${orders.length} orders and ${payments.length} payments`);
    
    // Insert orders in batches
    console.log('💾 Saving orders to database...');
    const savedOrders = await Order.insertMany(orders, { ordered: false });
    console.log(`✅ Saved ${savedOrders.length} orders`);
    
    // Update payment order IDs and insert payments
    console.log('💾 Saving payments to database...');
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      const savedOrder = savedOrders.find(o => o._id.toString() === payment.orderId.toString());
      if (savedOrder) {
        payment.orderId = savedOrder._id;
      }
    }
    
    const savedPayments = await Payment.insertMany(payments, { ordered: false });
    console.log(`✅ Saved ${savedPayments.length} payments`);
    
    // Generate summary statistics
    console.log('\n📈 SEEDING SUMMARY:');
    console.log('=' .repeat(50));
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
    
    const statusCounts = {};
    const paymentStatusCounts = {};
    
    orders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      paymentStatusCounts[order.paymentStatus] = (paymentStatusCounts[order.paymentStatus] || 0) + 1;
    });
    
    console.log(`💰 Total Revenue: ₹${totalRevenue.toLocaleString()}`);
    console.log(`📊 Average Order Value: ₹${Math.round(avgOrderValue).toLocaleString()}`);
    console.log(`📦 Total Orders: ${orders.length}`);
    console.log(`💳 Total Payments: ${payments.length}`);
    
    console.log('\n📊 Order Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} orders (${((count / orders.length) * 100).toFixed(1)}%)`);
    });
    
    console.log('\n💳 Payment Status Distribution:');
    Object.entries(paymentStatusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} orders (${((count / orders.length) * 100).toFixed(1)}%)`);
    });
    
    console.log('\n✅ Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Database seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

// Run the seeding
seedOrdersAndPayments().catch(console.error);
