const seedData = {
  users: [
    {
      _id: "64df7f3a4b9c4d8e5f9a1234",
      name: "John Smith",
      email: "john.smith@email.com",
      password: "$2b$10$N9qo8uLOickgx2ZMRZoMye4IFrq6oFrK5xFUaD5k2i5gFZnG7z.O2",
      phone: "+1234567890",
      role: "customer",
      createdAt: "2025-07-15T08:30:00Z",
      updatedAt: "2025-07-15T08:30:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9a1235",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      password: "$2b$10$N9qo8uLOickgx2ZMRZoMye4IFrq6oFrK5xFUaD5k2i5gFZnG7z.O2",
      phone: "+1234567891",
      role: "customer",
      createdAt: "2025-07-20T09:15:00Z",
      updatedAt: "2025-07-20T09:15:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9a1236",
      name: "Mike Davis",
      email: "mike.davis@email.com",
      password: "$2b$10$N9qo8uLOickgx2ZMRZoMye4IFrq6oFrK5xFUaD5k2i5gFZnG7z.O2",
      phone: "+1234567892",
      role: "end_user",
      createdAt: "2025-07-25T11:00:00Z",
      updatedAt: "2025-07-25T11:00:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9a1237",
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      password: "$2b$10$N9qo8uLOickgx2ZMRZoMye4IFrq6oFrK5xFUaD5k2i5gFZnG7z.O2",
      phone: "+1234567893",
      role: "customer",
      createdAt: "2025-08-01T14:20:00Z",
      updatedAt: "2025-08-01T14:20:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9a1238",
      name: "Tom Brown",
      email: "tom.brown@email.com",
      password: "$2b$10$N9qo8uLOickgx2ZMRZoMye4IFrq6oFrK5xFUaD5k2i5gFZnG7z.O2",
      phone: "+1234567894",
      role: "end_user",
      createdAt: "2025-08-05T16:45:00Z",
      updatedAt: "2025-08-05T16:45:00Z"
    }
  ],
  products: [
    {
      _id: "64df7f3a4b9c4d8e5f9b1234",
      name: "Canon EOS R5 Camera",
      category: "Electronics",
      description: "Professional mirrorless camera with 45MP sensor and 8K video recording",
      rentable: true,
      pricing: {
        hour: 25,
        day: 150,
        week: 900,
        month: 3200
      },
      stock: 3,
      availability: [
        {
          startDate: "2025-08-15T00:00:00Z",
          endDate: "2025-08-18T23:59:59Z",
          orderId: "64df7f3a4b9c4d8e5f9c1234"
        }
      ],
      createdAt: "2025-07-10T10:00:00Z",
      updatedAt: "2025-08-10T15:30:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9b1235",
      name: "DJI Mavic Air 2 Drone",
      category: "Electronics",
      description: "Compact drone with 4K camera and 34-minute flight time",
      rentable: true,
      pricing: {
        hour: 20,
        day: 120,
        week: 700,
        month: 2500
      },
      stock: 2,
      availability: [],
      createdAt: "2025-07-12T12:00:00Z",
      updatedAt: "2025-07-12T12:00:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9b1236",
      name: "4-Person Camping Tent",
      category: "Camping",
      description: "Waterproof dome tent with easy setup for outdoor adventures",
      rentable: true,
      pricing: {
        hour: 5,
        day: 30,
        week: 180,
        month: 600
      },
      stock: 8,
      availability: [
        {
          startDate: "2025-08-20T00:00:00Z",
          endDate: "2025-08-23T23:59:59Z",
          orderId: "64df7f3a4b9c4d8e5f9c1235"
        }
      ],
      createdAt: "2025-07-08T09:00:00Z",
      updatedAt: "2025-08-08T11:20:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9b1237",
      name: "Sleeping Bag Set",
      category: "Camping",
      description: "Temperature-rated sleeping bags suitable for all seasons",
      rentable: true,
      pricing: {
        hour: 3,
        day: 15,
        week: 90,
        month: 300
      },
      stock: 12,
      availability: [
        {
          startDate: "2025-08-20T00:00:00Z",
          endDate: "2025-08-23T23:59:59Z",
          orderId: "64df7f3a4b9c4d8e5f9c1235"
        }
      ],
      createdAt: "2025-07-08T09:30:00Z",
      updatedAt: "2025-08-08T11:20:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9b1238",
      name: "Professional DJ Setup",
      category: "Events",
      description: "Complete DJ equipment with mixer, turntables, and sound system",
      rentable: true,
      pricing: {
        hour: 50,
        day: 300,
        week: 1800,
        month: 6500
      },
      stock: 2,
      availability: [
        {
          startDate: "2025-08-25T00:00:00Z",
          endDate: "2025-08-25T23:59:59Z",
          orderId: "64df7f3a4b9c4d8e5f9c1236"
        }
      ],
      createdAt: "2025-07-05T14:00:00Z",
      updatedAt: "2025-08-09T10:15:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9b1239",
      name: "MacBook Pro 16-inch",
      category: "Electronics",
      description: "High-performance laptop with M2 Max chip for professional work",
      rentable: true,
      pricing: {
        hour: 15,
        day: 80,
        week: 480,
        month: 1800
      },
      stock: 5,
      availability: [],
      createdAt: "2025-07-18T13:00:00Z",
      updatedAt: "2025-07-18T13:00:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9b1240",
      name: "Wedding Decoration Package",
      category: "Events",
      description: "Complete wedding decoration set with flowers, lights, and centerpieces",
      rentable: true,
      pricing: {
        hour: 80,
        day: 500,
        week: 3000,
        month: 10000
      },
      stock: 1,
      availability: [
        {
          startDate: "2025-08-30T00:00:00Z",
          endDate: "2025-08-31T23:59:59Z",
          orderId: "64df7f3a4b9c4d8e5f9c1237"
        }
      ],
      createdAt: "2025-07-22T16:00:00Z",
      updatedAt: "2025-08-10T09:45:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9b1241",
      name: "Portable Camping Stove",
      category: "Camping",
      description: "Compact gas stove perfect for outdoor cooking",
      rentable: true,
      pricing: {
        hour: 2,
        day: 12,
        week: 70,
        month: 250
      },
      stock: 15,
      availability: [],
      createdAt: "2025-07-14T11:30:00Z",
      updatedAt: "2025-07-14T11:30:00Z"
    }
  ],
  pricelists: [
    {
      _id: "64df7f3a4b9c4d8e5f9d1234",
      name: "Default Pricing",
      type: "default",
      rules: [
        {
          condition: "duration >= 7 days",
          discount: 10,
          description: "10% discount for weekly rentals"
        },
        {
          condition: "duration >= 30 days",
          discount: 20,
          description: "20% discount for monthly rentals"
        }
      ],
      validity: {
        startDate: null,
        endDate: null
      },
      createdAt: "2025-07-01T00:00:00Z",
      updatedAt: "2025-07-01T00:00:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9d1235",
      name: "Holiday Special",
      type: "seasonal",
      rules: [
        {
          condition: "category == 'Events'",
          discount: 15,
          description: "15% off all event equipment during holidays"
        },
        {
          condition: "total_amount > 1000",
          discount: 25,
          description: "25% discount for orders above $1000"
        }
      ],
      validity: {
        startDate: "2025-12-15T00:00:00Z",
        endDate: "2026-01-15T23:59:59Z"
      },
      createdAt: "2025-07-15T10:00:00Z",
      updatedAt: "2025-07-15T10:00:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9d1236",
      name: "Corporate Rates",
      type: "corporate",
      rules: [
        {
          condition: "customer_type == 'corporate'",
          discount: 18,
          description: "18% discount for corporate customers"
        },
        {
          condition: "quantity >= 5",
          discount: 12,
          description: "12% bulk discount for 5+ items"
        }
      ],
      validity: {
        startDate: "2025-01-01T00:00:00Z",
        endDate: "2025-12-31T23:59:59Z"
      },
      createdAt: "2025-06-20T14:30:00Z",
      updatedAt: "2025-06-20T14:30:00Z"
    }
  ],
  orders: [
    {
      _id: "64df7f3a4b9c4d8e5f9c1234",
      customerId: "64df7f3a4b9c4d8e5f9a1234",
      items: [
        {
          productId: "64df7f3a4b9c4d8e5f9b1234",
          quantity: 1,
          rentalDuration: {
            startDate: "2025-08-15T00:00:00Z",
            endDate: "2025-08-18T23:59:59Z"
          },
          priceApplied: 450
        }
      ],
      status: "picked_up",
      pickupDate: "2025-08-15T10:00:00Z",
      returnDate: "2025-08-18T18:00:00Z",
      paymentStatus: "completed",
      depositAmount: 200,
      lateFee: 0,
      invoiceId: "64df7f3a4b9c4d8e5f9e1234",
      createdAt: "2025-08-12T09:30:00Z",
      updatedAt: "2025-08-15T10:00:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9c1235",
      customerId: "64df7f3a4b9c4d8e5f9a1235",
      items: [
        {
          productId: "64df7f3a4b9c4d8e5f9b1236",
          quantity: 2,
          rentalDuration: {
            startDate: "2025-08-20T00:00:00Z",
            endDate: "2025-08-23T23:59:59Z"
          },
          priceApplied: 120
        },
        {
          productId: "64df7f3a4b9c4d8e5f9b1237",
          quantity: 2,
          rentalDuration: {
            startDate: "2025-08-20T00:00:00Z",
            endDate: "2025-08-23T23:59:59Z"
          },
          priceApplied: 60
        }
      ],
      status: "reserved",
      pickupDate: "2025-08-20T09:00:00Z",
      returnDate: "2025-08-23T17:00:00Z",
      paymentStatus: "pending",
      depositAmount: 100,
      lateFee: 0,
      invoiceId: "64df7f3a4b9c4d8e5f9e1235",
      createdAt: "2025-08-18T14:20:00Z",
      updatedAt: "2025-08-18T14:20:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9c1236",
      customerId: "64df7f3a4b9c4d8e5f9a1237",
      items: [
        {
          productId: "64df7f3a4b9c4d8e5f9b1238",
          quantity: 1,
          rentalDuration: {
            startDate: "2025-08-25T00:00:00Z",
            endDate: "2025-08-25T23:59:59Z"
          },
          priceApplied: 300
        }
      ],
      status: "returned",
      pickupDate: "2025-08-25T14:00:00Z",
      returnDate: "2025-08-26T10:00:00Z",
      paymentStatus: "completed",
      depositAmount: 150,
      lateFee: 0,
      invoiceId: "64df7f3a4b9c4d8e5f9e1236",
      createdAt: "2025-08-22T11:15:00Z",
      updatedAt: "2025-08-26T10:00:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9c1237",
      customerId: "64df7f3a4b9c4d8e5f9a1234",
      items: [
        {
          productId: "64df7f3a4b9c4d8e5f9b1240",
          quantity: 1,
          rentalDuration: {
            startDate: "2025-08-30T00:00:00Z",
            endDate: "2025-08-31T23:59:59Z"
          },
          priceApplied: 1000
        }
      ],
      status: "late",
      pickupDate: "2025-08-30T08:00:00Z",
      returnDate: "2025-09-02T16:30:00Z",
      paymentStatus: "partial",
      depositAmount: 300,
      lateFee: 75,
      invoiceId: "64df7f3a4b9c4d8e5f9e1237",
      createdAt: "2025-08-28T13:45:00Z",
      updatedAt: "2025-09-02T16:30:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9c1238",
      customerId: "64df7f3a4b9c4d8e5f9a1235",
      items: [
        {
          productId: "64df7f3a4b9c4d8e5f9b1239",
          quantity: 1,
          rentalDuration: {
            startDate: "2025-08-12T00:00:00Z",
            endDate: "2025-08-19T23:59:59Z"
          },
          priceApplied: 560
        }
      ],
      status: "returned",
      pickupDate: "2025-08-12T11:30:00Z",
      returnDate: "2025-08-19T15:20:00Z",
      paymentStatus: "completed",
      depositAmount: 100,
      lateFee: 0,
      invoiceId: null,
      createdAt: "2025-08-10T16:00:00Z",
      updatedAt: "2025-08-19T15:20:00Z"
    }
  ],
  payments: [
    {
      _id: "64df7f3a4b9c4d8e5f9f1234",
      orderId: "64df7f3a4b9c4d8e5f9c1234",
      amount: 650,
      method: "razorpay",
      transactionId: "pay_12345abcdef",
      status: "completed",
      paidAt: "2025-08-12T10:15:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9f1235",
      orderId: "64df7f3a4b9c4d8e5f9c1236",
      amount: 450,
      method: "stripe",
      transactionId: "pi_1HqrS12eZvKYlo2CYgNqrqnX",
      status: "completed",
      paidAt: "2025-08-24T16:30:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9f1236",
      orderId: "64df7f3a4b9c4d8e5f9c1237",
      amount: 800,
      method: "paypal",
      transactionId: "PAYID-MXYZ123456789",
      status: "partial",
      paidAt: "2025-08-29T12:45:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9f1237",
      orderId: "64df7f3a4b9c4d8e5f9c1238",
      amount: 660,
      method: "razorpay",
      transactionId: "pay_67890wxyz",
      status: "completed",
      paidAt: "2025-08-11T14:20:00Z"
    }
  ],
  notifications: [
    {
      _id: "64df7f3a4b9c4d8e5f9g1234",
      recipientId: "64df7f3a4b9c4d8e5f9a1234",
      type: "pickup_reminder",
      orderId: "64df7f3a4b9c4d8e5f9c1234",
      sendDate: "2025-08-14T18:00:00Z",
      status: "sent",
      message: "Reminder: Your Canon EOS R5 Camera rental is ready for pickup tomorrow at 10:00 AM. Order #64df7f3a4b9c4d8e5f9c1234"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9g1235",
      recipientId: "64df7f3a4b9c4d8e5f9a1235",
      type: "pickup_reminder",
      orderId: "64df7f3a4b9c4d8e5f9c1235",
      sendDate: "2025-08-19T17:00:00Z",
      status: "sent",
      message: "Reminder: Your camping equipment is ready for pickup tomorrow at 9:00 AM. Order #64df7f3a4b9c4d8e5f9c1235"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9g1236",
      recipientId: "64df7f3a4b9c4d8e5f9a1234",
      type: "return_reminder",
      orderId: "64df7f3a4b9c4d8e5f9c1234",
      sendDate: "2025-08-17T16:00:00Z",
      status: "sent",
      message: "Reminder: Please return your Canon EOS R5 Camera by tomorrow 6:00 PM to avoid late fees. Order #64df7f3a4b9c4d8e5f9c1234"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9g1237",
      recipientId: "64df7f3a4b9c4d8e5f9a1234",
      type: "return_reminder",
      orderId: "64df7f3a4b9c4d8e5f9c1237",
      sendDate: "2025-09-01T10:00:00Z",
      status: "sent",
      message: "URGENT: Your wedding decoration package is overdue. Please return immediately to avoid additional late fees. Order #64df7f3a4b9c4d8e5f9c1237"
    }
  ],
  invoices: [
    {
      _id: "64df7f3a4b9c4d8e5f9e1234",
      orderId: "64df7f3a4b9c4d8e5f9c1234",
      customerId: "64df7f3a4b9c4d8e5f9a1234",
      amount: 650,
      status: "paid",
      pdfUrl: "https://storage.rental-app.com/invoices/INV-001-2025.pdf",
      issuedAt: "2025-08-12T09:45:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9e1235",
      orderId: "64df7f3a4b9c4d8e5f9c1235",
      customerId: "64df7f3a4b9c4d8e5f9a1235",
      amount: 180,
      status: "pending",
      pdfUrl: "https://storage.rental-app.com/invoices/INV-002-2025.pdf",
      issuedAt: "2025-08-18T14:30:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9e1236",
      orderId: "64df7f3a4b9c4d8e5f9c1236",
      customerId: "64df7f3a4b9c4d8e5f9a1237",
      amount: 450,
      status: "paid",
      pdfUrl: "https://storage.rental-app.com/invoices/INV-003-2025.pdf",
      issuedAt: "2025-08-22T11:30:00Z"
    },
    {
      _id: "64df7f3a4b9c4d8e5f9e1237",
      orderId: "64df7f3a4b9c4d8e5f9c1237",
      customerId: "64df7f3a4b9c4d8e5f9a1234",
      amount: 1075,
      status: "partial",
      pdfUrl: "https://storage.rental-app.com/invoices/INV-004-2025.pdf",
      issuedAt: "2025-08-28T14:00:00Z"
    }
  ]
};

module.exports = seedData;