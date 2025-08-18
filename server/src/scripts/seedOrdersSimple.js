require('dotenv').config();

const mongoose = require('mongoose');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const User = require('../models/User');
const Product = require('../models/Product');

const MONGODB_URI = 'mongodb+srv://sayantanhalder78:F0vDLk5Afmxx6rHb@renthive.4dl7vm0.mongodb.net/?retryWrites=true&w=majority&appName=RentHive';

// Helper function to generate random date within a range
function randomDateBetween(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

async function seedOrdersSimple() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB successfully\n');

    // Clear existing orders and payments first
    console.log('🧹 Clearing existing orders and payments...');
    await Order.deleteMany({});
    await Payment.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Get existing data
    const customers = await User.find({ role: 'customer' });
    const admins = await User.find({ role: 'admin' });
    const products = await Product.find({ isActive: true });

    console.log(`👥 Found ${customers.length} customers`);
    console.log(`🔧 Found ${admins.length} admins`);
    console.log(`📦 Found ${products.length} products\n`);

    if (customers.length === 0 || products.length === 0 || admins.length === 0) {
      throw new Error('Need at least 1 customer, 1 admin, and 1 product to generate orders');
    }

    // Generate 50 simple orders
    const orders = [];
    const payments = [];
    
    console.log('📝 Generating 50 simple orders...');
    
    for (let i = 0; i < 50; i++) {
      try {
        // Random customer and admin
        const customer = customers[Math.floor(Math.random() * customers.length)];
        const admin = admins[Math.floor(Math.random() * admins.length)];
        const product = products[Math.floor(Math.random() * products.length)];
        
        // Random order date (last 3 months)
        const now = new Date();
        const threeMonthsAgo = new Date();
        threeMonthsAgo.setMonth(now.getMonth() - 3);
        
        const orderDate = randomDateBetween(threeMonthsAgo, now);
        
        // Simple rental duration (1-7 days)
        const startDate = new Date(orderDate);
        startDate.setDate(startDate.getDate() + 1); // Start tomorrow
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 7) + 1); // 1-7 days
        
        // Simple order item
        const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 items
        const basePrice = product.pricing.day;
        const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
        const totalPrice = basePrice * days * quantity;
        
        const orderItem = {
          productId: product._id,
          quantity: quantity,
          rentalDuration: {
            startDate: startDate,
            endDate: endDate
          },
          priceApplied: {
            basePrice: basePrice,
            totalPrice: totalPrice
          }
        };
        
        // Simple billing details
        const billingDetails = {
          fullName: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: "123 Sample Street",
          city: "Mumbai"
        };
        
        // Order status (weighted towards completed orders for older dates)
        const daysSinceOrder = (now - orderDate) / (1000 * 60 * 60 * 24);
        let status;
        if (daysSinceOrder > 60) {
          status = Math.random() < 0.8 ? 'returned' : 'cancelled';
        } else if (daysSinceOrder > 30) {
          status = Math.random() < 0.6 ? 'picked_up' : 'returned';
        } else {
          status = Math.random() < 0.7 ? 'reserved' : 'picked_up';
        }
        
        // Payment status
        let paymentStatus;
        if (status === 'cancelled') {
          paymentStatus = 'pending';
        } else if (status === 'returned') {
          paymentStatus = 'paid';
        } else {
          paymentStatus = Math.random() < 0.7 ? 'paid' : (Math.random() < 0.5 ? 'partial' : 'pending');
        }
        
        const depositAmount = Math.round(totalPrice * 0.3); // 30% deposit
        
        // Create order
        const order = new Order({
          customerId: customer._id,
          items: [orderItem],
          status: status,
          paymentStatus: paymentStatus,
          depositAmount: depositAmount,
          totalAmount: totalPrice,
          billingDetails: billingDetails,
          notes: `Sample order ${i + 1}`,
          createdBy: admin._id,
          createdAt: orderDate,
          updatedAt: orderDate
        });
        
        // Validate before adding
        await order.validate();
        orders.push(order);
        
        // Create payment if not pending
        if (paymentStatus !== 'pending') {
          const paymentAmount = paymentStatus === 'paid' ? totalPrice : depositAmount;
          
          const paymentMethods = ['razorpay', 'stripe', 'paypal', 'cash', 'bank_transfer'];
          const payment = new Payment({
            orderId: order._id,
            amount: paymentAmount,
            method: paymentMethods[Math.floor(Math.random() * paymentMethods.length)],
            status: 'completed',
            transactionId: `TXN${Date.now()}${i}`,
            paymentGatewayResponse: new Map([
              ['gateway', 'razorpay'],
              ['transactionId', `rzp_${Math.random().toString(36).substr(2, 9)}`],
              ['status', 'success']
            ]),
            createdAt: new Date(orderDate.getTime() + 60000), // 1 minute after order
            updatedAt: new Date(orderDate.getTime() + 60000)
          });
          
          payments.push(payment);
        }
        
        if ((i + 1) % 10 === 0) {
          console.log(`  Generated ${i + 1}/50 orders...`);
        }
        
      } catch (error) {
        console.error(`❌ Error generating order ${i + 1}:`, error.message);
      }
    }
    
    console.log(`\n📊 Generated ${orders.length} valid orders and ${payments.length} payments`);
    
    // Save orders
    console.log('💾 Saving orders to database...');
    const savedOrders = await Order.insertMany(orders);
    console.log(`✅ Saved ${savedOrders.length} orders`);
    
    // Update payment order IDs and save payments
    console.log('💾 Saving payments to database...');
    for (let i = 0; i < payments.length; i++) {
      const payment = payments[i];
      const savedOrder = savedOrders.find(o => o._id.toString() === payment.orderId.toString());
      if (savedOrder) {
        payment.orderId = savedOrder._id;
      }
    }
    
    const savedPayments = await Payment.insertMany(payments);
    console.log(`✅ Saved ${savedPayments.length} payments`);
    
    // Generate summary
    console.log('\n📈 SEEDING SUMMARY:');
    console.log('=' .repeat(50));
    
    const totalRevenue = savedOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const avgOrderValue = savedOrders.length > 0 ? totalRevenue / savedOrders.length : 0;
    
    const statusCounts = {};
    const paymentStatusCounts = {};
    
    savedOrders.forEach(order => {
      statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
      paymentStatusCounts[order.paymentStatus] = (paymentStatusCounts[order.paymentStatus] || 0) + 1;
    });
    
    console.log(`💰 Total Revenue: ₹${totalRevenue.toLocaleString()}`);
    console.log(`📊 Average Order Value: ₹${Math.round(avgOrderValue).toLocaleString()}`);
    console.log(`📦 Total Orders: ${savedOrders.length}`);
    console.log(`💳 Total Payments: ${savedPayments.length}`);
    
    console.log('\n📊 Order Status Distribution:');
    Object.entries(statusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} orders (${((count / savedOrders.length) * 100).toFixed(1)}%)`);
    });
    
    console.log('\n💳 Payment Status Distribution:');
    Object.entries(paymentStatusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} orders (${((count / savedOrders.length) * 100).toFixed(1)}%)`);
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
seedOrdersSimple().catch(console.error);
