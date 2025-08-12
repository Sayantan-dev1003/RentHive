const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const moment = require('moment');

/**
 * Generate invoice PDF for an order
 * @param {Object} order - Order document with populated customer and items
 * @param {Object} invoice - Invoice document
 * @returns {Promise<String>} Path to generated PDF file
 */
const generateInvoicePDF = async (order, invoice) => {
  try {
    // Ensure invoice directory exists
    const invoiceDir = process.env.INVOICE_DIR || './tmp/invoices';
    if (!fs.existsSync(invoiceDir)) {
      fs.mkdirSync(invoiceDir, { recursive: true });
    }

    // Generate filename
    const filename = `invoice_${order._id}.pdf`;
    const filepath = path.join(invoiceDir, filename);

    // Create PDF document
    const doc = new PDFDocument({ margin: 50 });
    
    // Pipe to file
    doc.pipe(fs.createWriteStream(filepath));

    // Add header
    addHeader(doc, invoice);
    
    // Add company and customer details
    addCompanyDetails(doc, invoice);
    addCustomerDetails(doc, order.customerId, invoice, order);
    
    // Add invoice details
    addInvoiceDetails(doc, invoice, order);
    
    // Add line items
    addLineItems(doc, order.items, invoice);
    
    // Add totals
    addTotals(doc, invoice);
    
    // Add footer
    addFooter(doc, invoice);

    // Finalize the PDF
    doc.end();

    // Wait for file to be written
    await new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);
    });

    return filepath;
  } catch (error) {
    throw new Error(`Failed to generate PDF: ${error.message}`);
  }
};

/**
 * Add header to PDF
 */
const addHeader = (doc, invoice) => {
  doc.fontSize(20)
     .font('Helvetica-Bold')
     .text('INVOICE', 50, 50)
     .fontSize(10)
     .font('Helvetica')
     .text(`Invoice #: ${invoice.invoiceNumber}`, 50, 80)
     .text(`Date: ${moment(invoice.issuedAt).format('DD/MM/YYYY')}`, 50, 95)
     .text(`Due Date: ${moment(invoice.dueDate).format('DD/MM/YYYY')}`, 50, 110);
  
  // Add logo placeholder (you can add actual logo here)
  doc.fontSize(16)
     .font('Helvetica-Bold')
     .text('RentHive', 400, 50)
     .fontSize(10)
     .font('Helvetica')
     .text('Rental Management System', 400, 70);
};

/**
 * Add company details
 */
const addCompanyDetails = (doc, invoice) => {
  const companyDetails = invoice.companyDetails || {
    name: 'RentHive',
    address: {
      street: '123 Business Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zipCode: '400001',
      country: 'India'
    },
    email: 'contact@renthive.com',
    phone: '+91 98765 43210'
  };

  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('From:', 50, 150)
     .fontSize(10)
     .font('Helvetica')
     .text(companyDetails.name, 50, 170)
     .text(companyDetails.address.street, 50, 185)
     .text(`${companyDetails.address.city}, ${companyDetails.address.state} ${companyDetails.address.zipCode}`, 50, 200)
     .text(companyDetails.address.country, 50, 215)
     .text(`Email: ${companyDetails.email}`, 50, 235)
     .text(`Phone: ${companyDetails.phone}`, 50, 250);
};

/**
 * Add customer details
 */
const addCustomerDetails = (doc, customer, invoice, order) => {
  // Use billing details from order first, then customer data as fallback
  const billingInfo = order?.billingDetails || {};
  const customerInfo = customer || {};
  
  const name = billingInfo.fullName || customerInfo.name || 'N/A';
  const email = billingInfo.email || customerInfo.email || 'N/A';
  const phone = billingInfo.phone || customerInfo.phone || 'N/A';
  const address = billingInfo.address || 'N/A';
  const city = billingInfo.city || 'N/A';

  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('Bill To:', 300, 150)
     .fontSize(10)
     .font('Helvetica')
     .text(name, 300, 170)
     .text(email, 300, 185)
     .text(phone, 300, 200);

  // Add address if available
  if (address !== 'N/A') {
    doc.text(`Address: ${address}`, 300, 220);
  }
  if (city !== 'N/A') {
    doc.text(`City: ${city}`, 300, 235);
  }
};

/**
 * Add invoice details
 */
const addInvoiceDetails = (doc, invoice, order) => {
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('Invoice Details:', 50, 300)
     .fontSize(10)
     .font('Helvetica')
     .text(`Order ID: ${order._id}`, 50, 320)
     .text(`Payment Terms: ${invoice.paymentTerms}`, 50, 335)
     .text(`Status: ${invoice.status.toUpperCase()}`, 50, 350);

  if (invoice.notes) {
    doc.text(`Notes: ${invoice.notes}`, 50, 365);
  }
};

/**
 * Add line items table
 */
const addLineItems = (doc, items, invoice) => {
  const tableTop = 400;
  const itemCodeX = 50;
  const descriptionX = 150;
  const quantityX = 300;
  const priceX = 350;
  const totalX = 450;

  // Table header
  doc.fontSize(10)
     .font('Helvetica-Bold')
     .text('Item', itemCodeX, tableTop)
     .text('Description', descriptionX, tableTop)
     .text('Qty', quantityX, tableTop)
     .text('Price', priceX, tableTop)
     .text('Total', totalX, tableTop);

  // Draw header line
  doc.moveTo(50, tableTop + 15)
     .lineTo(550, tableTop + 15)
     .stroke();

  // Add items
  let currentY = tableTop + 25;
  
  items.forEach((item, index) => {
    const lineItem = invoice.lineItems && invoice.lineItems[index] ? 
      invoice.lineItems[index] : 
      {
        description: `Rental: ${item.productId.name || 'Product'}`,
        quantity: item.quantity,
        unitPrice: item.priceApplied.totalPrice / item.quantity,
        totalPrice: item.priceApplied.totalPrice
      };

    doc.fontSize(9)
       .font('Helvetica')
       .text(index + 1, itemCodeX, currentY)
       .text(lineItem.description, descriptionX, currentY, { width: 140 })
       .text(lineItem.quantity.toString(), quantityX, currentY)
       .text(`₹${lineItem.unitPrice.toFixed(2)}`, priceX, currentY)
       .text(`₹${lineItem.totalPrice.toFixed(2)}`, totalX, currentY);

    // Add rental period if available
    if (item.rentalDuration) {
      currentY += 12;
      doc.fontSize(8)
         .font('Helvetica-Oblique')
         .text(`Period: ${moment(item.rentalDuration.startDate).format('DD/MM/YY')} - ${moment(item.rentalDuration.endDate).format('DD/MM/YY')}`, 
               descriptionX, currentY, { width: 140 });
    }

    currentY += 20;
  });

  return currentY;
};

/**
 * Add totals section
 */
const addTotals = (doc, invoice) => {
  const totalsY = 500;
  const labelX = 400;
  const valueX = 500;

  doc.fontSize(10)
     .font('Helvetica');

  let currentY = totalsY;

  // Subtotal
  doc.text('Subtotal:', labelX, currentY)
     .text(`₹${invoice.amount.toFixed(2)}`, valueX, currentY);
  currentY += 15;

  // Discount
  if (invoice.discountAmount > 0) {
    doc.text('Discount:', labelX, currentY)
       .text(`-₹${invoice.discountAmount.toFixed(2)}`, valueX, currentY);
    currentY += 15;
  }

  // Tax
  if (invoice.taxAmount > 0) {
    doc.text('Tax:', labelX, currentY)
       .text(`₹${invoice.taxAmount.toFixed(2)}`, valueX, currentY);
    currentY += 15;
  }

  // Total line
  doc.moveTo(400, currentY)
     .lineTo(550, currentY)
     .stroke();
  currentY += 10;

  // Total amount
  doc.fontSize(12)
     .font('Helvetica-Bold')
     .text('Total:', labelX, currentY)
     .text(`₹${invoice.totalAmount.toFixed(2)}`, valueX, currentY);
  currentY += 20;

  // Paid amount
  if (invoice.paidAmount > 0) {
    doc.fontSize(10)
       .font('Helvetica')
       .text('Paid:', labelX, currentY)
       .text(`₹${invoice.paidAmount.toFixed(2)}`, valueX, currentY);
    currentY += 15;

    // Remaining amount
    const remaining = invoice.totalAmount - invoice.paidAmount;
    if (remaining > 0) {
      doc.font('Helvetica-Bold')
         .text('Due:', labelX, currentY)
         .text(`₹${remaining.toFixed(2)}`, valueX, currentY);
    }
  }
};

/**
 * Add footer
 */
const addFooter = (doc, invoice) => {
  doc.fontSize(8)
     .font('Helvetica')
     .text('Thank you for your business!', 50, 700)
     .text('For any queries, please contact us at support@renthive.com', 50, 715)
     .text(`Generated on: ${moment().format('DD/MM/YYYY HH:mm')}`, 50, 730);
};

/**
 * Generate rental agreement PDF
 * @param {Object} order - Order document
 * @returns {Promise<String>} Path to generated PDF
 */
const generateRentalAgreementPDF = async (order) => {
  try {
    const agreementDir = process.env.INVOICE_DIR || './tmp/invoices';
    if (!fs.existsSync(agreementDir)) {
      fs.mkdirSync(agreementDir, { recursive: true });
    }

    const filename = `agreement_${order._id}.pdf`;
    const filepath = path.join(agreementDir, filename);

    const doc = new PDFDocument({ margin: 50 });
    doc.pipe(fs.createWriteStream(filepath));

    // Header
    doc.fontSize(18)
       .font('Helvetica-Bold')
       .text('RENTAL AGREEMENT', { align: 'center' })
       .moveDown();

    // Agreement content
    doc.fontSize(12)
       .font('Helvetica')
       .text(`Agreement No: ${order._id}`)
       .text(`Date: ${moment().format('DD/MM/YYYY')}`)
       .moveDown()
       .text('This rental agreement is between RentHive and the customer for the rental of the following items:')
       .moveDown();

    // Items
    order.items.forEach((item, index) => {
      doc.text(`${index + 1}. ${item.productId.name} (Qty: ${item.quantity})`)
         .text(`   Rental Period: ${moment(item.rentalDuration.startDate).format('DD/MM/YYYY')} to ${moment(item.rentalDuration.endDate).format('DD/MM/YYYY')}`)
         .moveDown(0.5);
    });

    // Terms and conditions
    doc.moveDown()
       .fontSize(14)
       .font('Helvetica-Bold')
       .text('Terms and Conditions:')
       .fontSize(10)
       .font('Helvetica')
       .text('1. The customer agrees to return the items in good condition.')
       .text('2. Late returns will incur additional charges.')
       .text('3. The customer is responsible for any damage or loss.')
       .text('4. Payment must be completed before item pickup.')
       .moveDown()
       .text('Customer Signature: _________________ Date: _________')
       .moveDown()
       .text('RentHive Representative: _________________ Date: _________');

    doc.end();

    await new Promise((resolve, reject) => {
      doc.on('end', resolve);
      doc.on('error', reject);
    });

    return filepath;
  } catch (error) {
    throw new Error(`Failed to generate rental agreement: ${error.message}`);
  }
};

module.exports = {
  generateInvoicePDF,
  generateRentalAgreementPDF
};
