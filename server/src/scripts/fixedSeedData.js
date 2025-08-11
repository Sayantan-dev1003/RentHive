const mongoose = require('mongoose');

// Fixed seed data that matches current model schemas
const fixedSeedData = {
  users: [
    {
      name: "John Smith",
      email: "john.smith@email.com",
      password: "password123", // Will be hashed in the seeding script
      phone: "9876543210",
      role: "customer"
    },
    {
      name: "Sarah Johnson", 
      email: "sarah.johnson@email.com",
      password: "password123",
      phone: "9876543211",
      role: "customer"
    },
    {
      name: "Admin",
      email: "Admin@email.com", 
      password: "admin123",
      phone: "9876543212",
      role: "admin"
    },
    {
      name: "Emma Wilson",
      email: "emma.wilson@email.com",
      password: "password123", 
      phone: "9876543213",
      role: "customer"
    },
    {
      name: "Tom Brown",
      email: "tom.brown@email.com",
      password: "password123",
      phone: "9876543214", 
      role: "admin"
    }
  ],
  
  products: [
    {
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
      availability: [],
      images: ["https://example.com/camera1.jpg"],
      isActive: true
    },
    {
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
      images: ["https://example.com/drone1.jpg"],
      isActive: true
    },
    {
      name: "4-Person Camping Tent",
      category: "Sports",
      description: "Waterproof dome tent with easy setup for outdoor adventures",
      rentable: true,
      pricing: {
        hour: 5,
        day: 30,
        week: 180,
        month: 600
      },
      stock: 8,
      availability: [],
      images: ["https://example.com/tent1.jpg"],
      isActive: true
    },
    {
      name: "Sleeping Bag Set",
      category: "Sports",
      description: "Temperature-rated sleeping bags suitable for all seasons",
      rentable: true,
      pricing: {
        hour: 3,
        day: 15, 
        week: 90,
        month: 300
      },
      stock: 12,
      availability: [],
      images: ["https://example.com/sleeping-bag.jpg"],
      isActive: true
    },
    {
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
      availability: [],
      images: ["https://example.com/dj-setup.jpg"],
      isActive: true
    },
    {
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
      images: ["https://example.com/macbook.jpg"],
      isActive: true
    },
    {
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
      availability: [],
      images: ["https://example.com/wedding-decor.jpg"],
      isActive: true
    },
    {
      name: "Portable Camping Stove",
      category: "Sports",
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
      images: ["https://example.com/stove.jpg"],
      isActive: true
    }
  ],
  
  pricelists: [
    {
      name: "Default Pricing",
      type: "default",
      rules: [
        {
          productCategory: "Electronics",
          discountType: "percentage",
          discountValue: 10,
          durationUnit: "week"
        },
        {
          productCategory: "Events", 
          discountType: "percentage",
          discountValue: 15,
          durationUnit: "month"
        }
      ],
      validity: {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31')
      },
      isActive: true,
      createdBy: null // Will be set to admin user ID
    },
    {
      name: "Holiday Special",
      type: "seasonal", 
      rules: [
        {
          productCategory: "Events",
          discountType: "percentage", 
          discountValue: 25,
          durationUnit: "day"
        }
      ],
      validity: {
        startDate: new Date('2025-12-15'),
        endDate: new Date('2026-01-15')
      },
      isActive: true,
      createdBy: null
    },
    {
      name: "Corporate Rates",
      type: "corporate",
      rules: [
        {
          productCategory: "Electronics",
          discountType: "percentage",
          discountValue: 18,
          durationUnit: "week"
        }
      ],
      validity: {
        startDate: new Date('2025-01-01'),
        endDate: new Date('2025-12-31')
      },
      isActive: true,
      createdBy: null
    }
  ]
};

module.exports = fixedSeedData;
