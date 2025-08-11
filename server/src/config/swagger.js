const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

// Swagger definition
const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'RentHive API',
    version: '1.0.0',
    description: 'A comprehensive rental management system API with complete CRUD operations, payment processing, and business analytics.',
    contact: {
      name: 'RentHive Team',
      email: 'support@renthive.com'
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT'
    }
  },
  servers: [
    {
      url: 'http://localhost:5000',
      description: 'Development server'
    },
    {
      url: 'https://api.renthive.com',
      description: 'Production server'
    }
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token obtained from login endpoint'
      }
    },
    schemas: {
      User: {
        type: 'object',
        required: ['name', 'email', 'password', 'phone'],
        properties: {
          _id: {
            type: 'string',
            description: 'User unique identifier'
          },
          name: {
            type: 'string',
            description: 'User full name',
            example: 'John Doe'
          },
          email: {
            type: 'string',
            format: 'email',
            description: 'User email address',
            example: 'john@example.com'
          },
          phone: {
            type: 'string',
            pattern: '^[0-9]{10}$',
            description: '10-digit phone number',
            example: '9876543210'
          },
          role: {
            type: 'string',
            enum: ['customer', 'end_user'],
            description: 'User role',
            example: 'customer'
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            description: 'Account creation timestamp'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time',
            description: 'Last update timestamp'
          }
        }
      },
      Product: {
        type: 'object',
        required: ['name', 'category', 'description', 'pricing'],
        properties: {
          _id: {
            type: 'string',
            description: 'Product unique identifier'
          },
          name: {
            type: 'string',
            description: 'Product name',
            example: 'Professional Camera'
          },
          category: {
            type: 'string',
            enum: ['Electronics', 'Furniture', 'Vehicles', 'Sports', 'Tools', 'Events', 'Other'],
            description: 'Product category',
            example: 'Electronics'
          },
          description: {
            type: 'string',
            description: 'Product description',
            example: 'High-quality DSLR camera for professional photography'
          },
          rentable: {
            type: 'boolean',
            description: 'Whether the product is available for rent',
            example: true
          },
          pricing: {
            type: 'object',
            required: ['hour', 'day', 'week', 'month'],
            properties: {
              hour: {
                type: 'number',
                minimum: 0,
                description: 'Hourly rental price',
                example: 50
              },
              day: {
                type: 'number',
                minimum: 0,
                description: 'Daily rental price',
                example: 300
              },
              week: {
                type: 'number',
                minimum: 0,
                description: 'Weekly rental price',
                example: 1800
              },
              month: {
                type: 'number',
                minimum: 0,
                description: 'Monthly rental price',
                example: 6000
              }
            }
          },
          stock: {
            type: 'number',
            minimum: 0,
            description: 'Available stock quantity',
            example: 5
          },
          currentAvailableStock: {
            type: 'number',
            description: 'Currently available stock (calculated)',
            example: 3
          },
          images: {
            type: 'array',
            items: {
              type: 'string'
            },
            description: 'Product image URLs'
          },
          isActive: {
            type: 'boolean',
            description: 'Whether the product is active',
            example: true
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          },
          updatedAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Order: {
        type: 'object',
        required: ['customerId', 'items'],
        properties: {
          _id: {
            type: 'string',
            description: 'Order unique identifier'
          },
          customerId: {
            type: 'string',
            description: 'Customer ID reference',
            example: '507f1f77bcf86cd799439011'
          },
          items: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                productId: {
                  type: 'string',
                  description: 'Product ID reference'
                },
                quantity: {
                  type: 'number',
                  minimum: 1,
                  description: 'Rental quantity'
                },
                rentalDuration: {
                  type: 'object',
                  properties: {
                    startDate: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Rental start date'
                    },
                    endDate: {
                      type: 'string',
                      format: 'date-time',
                      description: 'Rental end date'
                    }
                  }
                },
                priceApplied: {
                  type: 'object',
                  properties: {
                    basePrice: {
                      type: 'number',
                      description: 'Base rental price'
                    },
                    discountAmount: {
                      type: 'number',
                      description: 'Applied discount amount'
                    },
                    totalPrice: {
                      type: 'number',
                      description: 'Final price after discount'
                    }
                  }
                }
              }
            }
          },
          status: {
            type: 'string',
            enum: ['quotation', 'reserved', 'picked_up', 'returned', 'late', 'cancelled'],
            description: 'Order status',
            example: 'reserved'
          },
          paymentStatus: {
            type: 'string',
            enum: ['pending', 'partial', 'paid', 'refunded'],
            description: 'Payment status',
            example: 'partial'
          },
          totalAmount: {
            type: 'number',
            description: 'Total order amount',
            example: 1500
          },
          depositAmount: {
            type: 'number',
            description: 'Deposit amount paid',
            example: 500
          },
          lateFee: {
            type: 'number',
            description: 'Late return fee',
            example: 0
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Payment: {
        type: 'object',
        required: ['orderId', 'amount', 'method'],
        properties: {
          _id: {
            type: 'string',
            description: 'Payment unique identifier'
          },
          orderId: {
            type: 'string',
            description: 'Order ID reference'
          },
          amount: {
            type: 'number',
            minimum: 0,
            description: 'Payment amount',
            example: 500
          },
          method: {
            type: 'string',
            enum: ['mock', 'razorpay', 'stripe', 'paypal', 'cash', 'bank_transfer'],
            description: 'Payment method',
            example: 'mock'
          },
          transactionId: {
            type: 'string',
            description: 'Transaction identifier'
          },
          status: {
            type: 'string',
            enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded'],
            description: 'Payment status',
            example: 'completed'
          },
          paidAt: {
            type: 'string',
            format: 'date-time',
            description: 'Payment completion timestamp'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      Notification: {
        type: 'object',
        properties: {
          _id: {
            type: 'string'
          },
          recipientId: {
            type: 'string',
            description: 'Recipient user ID'
          },
          type: {
            type: 'string',
            enum: ['pickup_reminder', 'return_reminder', 'payment_due', 'late_return', 'system', 'order_update'],
            description: 'Notification type'
          },
          title: {
            type: 'string',
            description: 'Notification title'
          },
          message: {
            type: 'string',
            description: 'Notification message'
          },
          status: {
            type: 'string',
            enum: ['pending', 'sent', 'failed', 'cancelled'],
            description: 'Notification status'
          },
          isRead: {
            type: 'boolean',
            description: 'Whether notification is read'
          },
          createdAt: {
            type: 'string',
            format: 'date-time'
          }
        }
      },
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Request success status'
          },
          message: {
            type: 'string',
            description: 'Response message'
          },
          data: {
            type: 'object',
            description: 'Response data'
          },
          errors: {
            type: 'object',
            description: 'Validation errors (if any)'
          }
        }
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false
          },
          message: {
            type: 'string',
            description: 'Error message'
          },
          errors: {
            type: 'object',
            description: 'Detailed error information'
          }
        }
      }
    }
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization'
    },
    {
      name: 'Products',
      description: 'Product catalog management'
    },
    {
      name: 'Orders',
      description: 'Order and rental management'
    },
    {
      name: 'Payments',
      description: 'Payment processing and management'
    },
    {
      name: 'Notifications',
      description: 'Notification system'
    },
    {
      name: 'Reports',
      description: 'Business analytics and reporting'
    },
    {
      name: 'Pricelists',
      description: 'Pricing rules and discount management'
    }
  ]
};

// Options for the swagger docs
const options = {
  swaggerDefinition,
  // Paths to files containing OpenAPI definitions
  apis: [
    './src/routes/auth.route.js'
    // Temporarily disabled other routes due to YAML parsing errors
    // './src/routes/*.js',
    // './src/controllers/*.js',
    // './src/models/*.js'
  ]
};

// Initialize swagger-jsdoc
const swaggerSpec = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  swaggerSpec
};
