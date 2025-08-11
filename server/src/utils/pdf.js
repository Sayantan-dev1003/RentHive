/**
 * PDF Generation Utility
 * Enhanced PDF generation for invoices and reports
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

/**
 * Generate invoice PDF
 * @param {Object} order - Order data
 * @param {Object} customer - Customer data
 * @param {String} outputPath - Output file path
 * @returns {Promise<String>} - Generated PDF path
 */
const generateInvoicePDF = async (order, customer, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure output directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header
      addInvoiceHeader(doc, order);
      
      // Customer and order details
      addCustomerDetails(doc, customer, order);
      
      // Items table
      addItemsTable(doc, order);
      
      // Summary
      addInvoiceSummary(doc, order);
      
      // Footer
      addInvoiceFooter(doc, order);

      doc.end();
      
      stream.on('finish', () => {
        resolve(outputPath);
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate report PDF
 * @param {Object} reportData - Report data
 * @param {String} reportType - Type of report
 * @param {String} outputPath - Output file path
 * @returns {Promise<String>} - Generated PDF path
 */
const generateReportPDF = async (reportData, reportType, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure output directory exists
      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      // Header
      addReportHeader(doc, reportType, reportData);
      
      // Content based on report type
      switch (reportType) {
        case 'revenue':
          addRevenueReportContent(doc, reportData);
          break;
        case 'products':
          addProductReportContent(doc, reportData);
          break;
        case 'customers':
          addCustomerReportContent(doc, reportData);
          break;
        case 'orders':
          addOrderReportContent(doc, reportData);
          break;
        default:
          addGenericReportContent(doc, reportData);
      }
      
      // Footer
      addReportFooter(doc);

      doc.end();
      
      stream.on('finish', () => {
        resolve(outputPath);
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    } catch (error) {
      reject(error);
    }
  });
};

// Helper functions for invoice PDF
const addInvoiceHeader = (doc, order) => {
  doc.fontSize(20)
     .text('RentHive', 50, 50)
     .fontSize(12)
     .text('Rental Management System', 50, 75);

  doc.fontSize(16)
     .text('INVOICE', 400, 50)
     .fontSize(12)
     .text(`Invoice #: INV-${order._id.toString().slice(-8).toUpperCase()}`, 400, 75)
     .text(`Date: ${moment(order.createdAt).format('DD/MM/YYYY')}`, 400, 90)
     .text(`Order #: ${order._id.toString().slice(-6).toUpperCase()}`, 400, 105);

  // Add line
  doc.moveTo(50, 130).lineTo(550, 130).stroke();
};

const addCustomerDetails = (doc, customer, order) => {
  doc.fontSize(14)
     .text('Bill To:', 50, 150);
     
  doc.fontSize(12)
     .text(customer.name, 50, 170)
     .text(customer.email, 50, 185)
     .text(customer.phone, 50, 200);

  doc.fontSize(14)
     .text('Order Details:', 300, 150);
     
  doc.fontSize(12)
     .text(`Status: ${order.status.toUpperCase()}`, 300, 170)
     .text(`Payment: ${order.paymentStatus.toUpperCase()}`, 300, 185)
     .text(`Pickup: ${order.pickupDate ? moment(order.pickupDate).format('DD/MM/YYYY') : 'TBD'}`, 300, 200)
     .text(`Return: ${order.returnDate ? moment(order.returnDate).format('DD/MM/YYYY') : 'TBD'}`, 300, 215);
};

const addItemsTable = (doc, order) => {
  const tableTop = 250;
  
  // Table headers
  doc.fontSize(12)
     .text('Item', 50, tableTop)
     .text('Quantity', 200, tableTop)
     .text('Duration', 270, tableTop)
     .text('Rate', 380, tableTop)
     .text('Amount', 480, tableTop);

  // Header line
  doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

  let y = tableTop + 30;
  
  order.items.forEach((item, index) => {
    const startDate = moment(item.rentalDuration.startDate);
    const endDate = moment(item.rentalDuration.endDate);
    const duration = endDate.diff(startDate, 'days') + 1;
    
    doc.text(item.productId.name || `Product ${index + 1}`, 50, y)
       .text(item.quantity.toString(), 200, y)
       .text(`${duration} days`, 270, y)
       .text(`₹${(item.priceApplied.totalPrice / item.quantity / duration).toFixed(2)}`, 380, y)
       .text(`₹${item.priceApplied.totalPrice.toFixed(2)}`, 480, y);
    
    y += 20;
  });

  // Table bottom line
  doc.moveTo(50, y).lineTo(550, y).stroke();
};

const addInvoiceSummary = (doc, order) => {
  const summaryTop = 400;
  
  doc.fontSize(12)
     .text('Subtotal:', 400, summaryTop)
     .text(`₹${order.totalAmount.toFixed(2)}`, 480, summaryTop);

  if (order.lateFee > 0) {
    doc.text('Late Fee:', 400, summaryTop + 15)
       .text(`₹${order.lateFee.toFixed(2)}`, 480, summaryTop + 15);
  }

  if (order.depositAmount > 0) {
    doc.text('Deposit:', 400, summaryTop + 30)
       .text(`₹${order.depositAmount.toFixed(2)}`, 480, summaryTop + 30);
  }

  const totalWithFees = order.totalAmount + (order.lateFee || 0);
  
  doc.fontSize(14)
     .text('Total:', 400, summaryTop + 50)
     .text(`₹${totalWithFees.toFixed(2)}`, 480, summaryTop + 50);

  // Total line
  doc.moveTo(400, summaryTop + 65).lineTo(550, summaryTop + 65).stroke();
};

const addInvoiceFooter = (doc, order) => {
  doc.fontSize(10)
     .text('Thank you for choosing RentHive!', 50, 700)
     .text('For any queries, contact us at support@renthive.com', 50, 715)
     .text(`Generated on: ${moment().format('DD/MM/YYYY HH:mm')}`, 400, 715);
};

// Helper functions for report PDF
const addReportHeader = (doc, reportType, reportData) => {
  doc.fontSize(20)
     .text('RentHive', 50, 50)
     .fontSize(12)
     .text('Rental Management System', 50, 75);

  const reportTitle = getReportTitle(reportType);
  doc.fontSize(16)
     .text(reportTitle, 50, 110);

  if (reportData.period) {
    doc.fontSize(12)
       .text(`Period: ${moment(reportData.period.startDate).format('DD/MM/YYYY')} - ${moment(reportData.period.endDate).format('DD/MM/YYYY')}`, 50, 135);
  }

  doc.fontSize(10)
     .text(`Generated on: ${moment().format('DD/MM/YYYY HH:mm')}`, 400, 135);

  // Add line
  doc.moveTo(50, 160).lineTo(550, 160).stroke();
};

const addRevenueReportContent = (doc, reportData) => {
  let y = 180;
  
  doc.fontSize(14).text('Revenue Summary', 50, y);
  y += 25;
  
  if (reportData.summary) {
    doc.fontSize(12)
       .text(`Total Revenue: ₹${reportData.summary.totalRevenue || 0}`, 50, y)
       .text(`Total Orders: ${reportData.summary.totalOrders || 0}`, 300, y);
    y += 20;
    
    doc.text(`Average Order Value: ₹${reportData.summary.averageOrderValue || 0}`, 50, y)
       .text(`Completed Orders: ${reportData.summary.completedOrders || 0}`, 300, y);
    y += 30;
  }

  if (reportData.monthlyBreakdown && reportData.monthlyBreakdown.length > 0) {
    doc.fontSize(14).text('Monthly Breakdown', 50, y);
    y += 25;
    
    // Table headers
    doc.fontSize(12)
       .text('Month', 50, y)
       .text('Orders', 200, y)
       .text('Revenue', 350, y)
       .text('Avg Order', 450, y);
    
    y += 20;
    doc.moveTo(50, y - 5).lineTo(550, y - 5).stroke();
    
    reportData.monthlyBreakdown.forEach(month => {
      doc.text(month._id || 'N/A', 50, y)
         .text(month.totalOrders || 0, 200, y)
         .text(`₹${month.totalRevenue || 0}`, 350, y)
         .text(`₹${month.averageOrder || 0}`, 450, y);
      y += 15;
    });
  }
};

const addProductReportContent = (doc, reportData) => {
  let y = 180;
  
  doc.fontSize(14).text('Product Performance', 50, y);
  y += 25;
  
  if (reportData.products && reportData.products.length > 0) {
    // Table headers
    doc.fontSize(12)
       .text('Product', 50, y)
       .text('Category', 200, y)
       .text('Rentals', 320, y)
       .text('Revenue', 420, y);
    
    y += 20;
    doc.moveTo(50, y - 5).lineTo(550, y - 5).stroke();
    
    reportData.products.slice(0, 20).forEach(product => { // Limit to 20 items
      doc.text(product.name || 'N/A', 50, y)
         .text(product.category || 'N/A', 200, y)
         .text(product.totalRentals || 0, 320, y)
         .text(`₹${product.totalRevenue || 0}`, 420, y);
      y += 15;
      
      if (y > 700) { // Page break
        doc.addPage();
        y = 50;
      }
    });
  }
};

const addCustomerReportContent = (doc, reportData) => {
  let y = 180;
  
  doc.fontSize(14).text('Customer Analysis', 50, y);
  y += 25;
  
  if (reportData.customers && reportData.customers.length > 0) {
    // Table headers
    doc.fontSize(12)
       .text('Customer', 50, y)
       .text('Orders', 250, y)
       .text('Total Spent', 350, y)
       .text('Last Order', 450, y);
    
    y += 20;
    doc.moveTo(50, y - 5).lineTo(550, y - 5).stroke();
    
    reportData.customers.slice(0, 20).forEach(customer => {
      doc.text(customer.name || 'N/A', 50, y)
         .text(customer.totalOrders || 0, 250, y)
         .text(`₹${customer.totalSpent || 0}`, 350, y)
         .text(customer.lastOrderDate ? moment(customer.lastOrderDate).format('DD/MM/YY') : 'N/A', 450, y);
      y += 15;
      
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });
  }
};

const addOrderReportContent = (doc, reportData) => {
  let y = 180;
  
  doc.fontSize(14).text('Order Analysis', 50, y);
  y += 25;
  
  if (reportData.orderSummary) {
    const summary = reportData.orderSummary;
    doc.fontSize(12)
       .text(`Total Orders: ${summary.total || 0}`, 50, y)
       .text(`Completed: ${summary.completed || 0}`, 200, y)
       .text(`Pending: ${summary.pending || 0}`, 350, y)
       .text(`Cancelled: ${summary.cancelled || 0}`, 450, y);
    y += 30;
  }

  if (reportData.orders && reportData.orders.length > 0) {
    // Table headers
    doc.fontSize(12)
       .text('Order ID', 50, y)
       .text('Customer', 150, y)
       .text('Status', 280, y)
       .text('Amount', 380, y)
       .text('Date', 450, y);
    
    y += 20;
    doc.moveTo(50, y - 5).lineTo(550, y - 5).stroke();
    
    reportData.orders.slice(0, 25).forEach(order => {
      doc.text(order._id.toString().slice(-6).toUpperCase(), 50, y)
         .text(order.customerName || 'N/A', 150, y)
         .text(order.status || 'N/A', 280, y)
         .text(`₹${order.totalAmount || 0}`, 380, y)
         .text(moment(order.createdAt).format('DD/MM/YY'), 450, y);
      y += 15;
      
      if (y > 700) {
        doc.addPage();
        y = 50;
      }
    });
  }
};

const addGenericReportContent = (doc, reportData) => {
  let y = 180;
  
  doc.fontSize(12)
     .text('Report Data:', 50, y);
  y += 20;
  
  // Simple JSON-like display for generic data
  const dataString = JSON.stringify(reportData, null, 2);
  const lines = dataString.split('\n');
  
  lines.forEach(line => {
    if (y > 700) {
      doc.addPage();
      y = 50;
    }
    doc.text(line, 50, y);
    y += 12;
  });
};

const addReportFooter = (doc) => {
  const pages = doc.bufferedPageRange();
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i);
    doc.fontSize(10)
       .text(`Page ${i + 1} of ${pages.count}`, 450, 750)
       .text('Generated by RentHive', 50, 750);
  }
};

const getReportTitle = (reportType) => {
  const titles = {
    revenue: 'Revenue Report',
    products: 'Product Performance Report',
    customers: 'Customer Analysis Report',
    orders: 'Order Analysis Report',
    inventory: 'Inventory Report',
    financial: 'Financial Report'
  };
  
  return titles[reportType] || 'Business Report';
};

module.exports = {
  generateInvoicePDF,
  generateReportPDF
};
